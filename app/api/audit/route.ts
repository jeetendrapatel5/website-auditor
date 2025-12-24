import { NextRequest, NextResponse } from 'next/server';
import { performAudit } from '@/lib/auditChecks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const report = await performAudit(targetUrl.toString());

    return NextResponse.json(report);

  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit website' },
      { status: 500 }
    );
  }
}