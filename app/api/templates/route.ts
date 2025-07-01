import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // Build WHERE clause for filtering
    let whereClause = "status = 'active'";
    if (category && category !== 'All') {
      whereClause += ` AND category = '${category}'`;
    }
    if (search) {
      whereClause += ` AND (title ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
    }

    const offset = (page - 1) * limit;

    const result = await sql`
      WITH data_query AS (
        SELECT 
          id, title, description, category, link, author, created_at,
          views, downloads, rating, is_free as "isFree",
          ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM templates 
        WHERE ${sql.unsafe(whereClause)}
      ),
      categories_query AS (
        SELECT DISTINCT category FROM templates WHERE status = 'active'
      ),
      count_query AS (
        SELECT COUNT(*) as total FROM templates WHERE status = 'active'
        ${category && category !== 'All' ? sql.unsafe(`AND category = '${category}'`) : sql``}
        ${search ? sql.unsafe(`AND (title ILIKE '%${search}%' OR description ILIKE '%${search}%')`) : sql``}
      )
      SELECT 
        json_build_object(
          'data', json_agg(data_query.*) FILTER (WHERE rn > ${offset} AND rn <= ${offset + limit}),
          'total', (SELECT total FROM count_query),
          'categories', (SELECT array_agg(category) FROM categories_query)
        ) as result
      FROM data_query
    `;

    const data = result.rows[0].result;
    const totalItems = data.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    return NextResponse.json({
      data: data.data || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      categories: data.categories || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}