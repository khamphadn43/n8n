import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create templates table
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'Other',
        link VARCHAR(500),
        html_content TEXT,
        content_length INTEGER DEFAULT 0,
        author VARCHAR(200) DEFAULT 'Anonymous',
        views INTEGER DEFAULT 50000,
        downloads INTEGER DEFAULT 25,
        rating DECIMAL(2,1) DEFAULT 4.5,
        is_free BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'active'
      )
    `;

    // Insert sample data
    await sql`
      INSERT INTO templates (title, description, category, link, html_content) VALUES
      ('Sample AI Workflow', 'Workflow AI mẫu', 'AI', 'https://example.com', '<h2>Sample HTML</h2>'),
      ('API Template', 'Template API', 'Engineering', 'https://example.com', '<h2>API Guide</h2>')
    `;

    return NextResponse.json({ success: true, message: 'Database setup completed!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}