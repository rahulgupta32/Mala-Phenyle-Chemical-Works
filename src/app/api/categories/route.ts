import { NextResponse } from 'next/server';
import { db } from 'src/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { status: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
