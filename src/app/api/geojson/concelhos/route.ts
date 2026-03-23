import { NextResponse } from 'next/server';
import path from 'path';
import { readFileSync } from 'fs';

let cached: object | null = null;

export async function GET() {
  if (!cached) {
    const filePath = path.join(process.cwd(), 'public', 'geojson', 'concelhos.json');
    cached = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return NextResponse.json(cached);
}
