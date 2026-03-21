import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const valves = await prisma.valve.findMany({
      orderBy: { tag: 'asc' }
    });
    
    // Calculate zones dynamically
    const zones = [...new Set(valves.map(v => v.zona))].sort();
    
    return NextResponse.json({ valves, zones });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch valves' }, { status: 500 });
  }
}
