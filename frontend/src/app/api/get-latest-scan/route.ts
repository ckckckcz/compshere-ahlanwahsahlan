import { NextRequest, NextResponse } from 'next/server';

let latestScan: { tagId?: string; ndefText?: string; tagType?: string; nik?: string } = {};

export function getLatestScan() {
  return latestScan;
}

export function setLatestScan(data: { tagId?: string; ndefText?: string; tagType?: string; nik?: string }) {
  latestScan = data;
}

export async function GET() {
  return NextResponse.json(latestScan);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  latestScan = body;
  return NextResponse.json({ message: 'Data updated' });
}
