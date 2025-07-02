import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // Build WHERE clause
    let whereClause = "WHERE status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;

    if (category && category !== 'All') {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get paginated data
    const offset = (page - 1) * limit;
    const dataResult = await sql.query(`
      SELECT 
        id, title, description, category, link, author, created_at,
        views, downloads, rating, html_content,  is_free as "isFree", 
        ARRAY[category] as tags
      FROM templates 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await sql.query(
      `SELECT COUNT(*) as total FROM templates ${whereClause}`, 
      params
    );

    // Get categories
    const categoriesResult = await sql`
      SELECT DISTINCT category FROM templates WHERE status = 'active' ORDER BY category
    `;

    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);
    const categories = categoriesResult.rows.map(row => row.category);

    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      categories
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: error.message,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPrevPage: false
      },
      categories: []
    }, { status: 500 });
  }
}