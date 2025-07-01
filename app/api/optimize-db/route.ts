import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add critical indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_templates_status_created ON templates(status, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_templates_category_status ON templates(category, status)`;
    
    return NextResponse.json({ success: true, message: 'Database optimized!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}