import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const result = await sql`
      WITH data_query AS (
        SELECT 
          id, title, description, category, link, author, created_at,
          views, downloads, rating, is_free as "isFree",
          ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM templates 
        WHERE status = 'active'
      ),
      categories_query AS (
        SELECT DISTINCT category FROM templates WHERE status = 'active'
      ),
      count_query AS (
        SELECT COUNT(*) as total FROM templates WHERE status = 'active'
      )
      SELECT 
        json_build_object(
          'data', json_agg(data_query.*) FILTER (WHERE rn <= 12),
          'total', (SELECT total FROM count_query),
          'categories', (SELECT array_agg(category) FROM categories_query)
        ) as result
      FROM data_query
    `;

    const data = result.rows[0].result;
    
    return NextResponse.json({
      data: data.data || [],
      pagination: {
        currentPage: 1,
        totalPages: Math.ceil(data.total / 12),
        totalItems: data.total,
        itemsPerPage: 12,
        hasNextPage: data.total > 12,
        hasPrevPage: false
      },
      categories: data.categories || []
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}