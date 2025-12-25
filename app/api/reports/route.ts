import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { performAudit } from '@/lib/auditChecks';

export async function POST(request: NextRequest) {
  try {
    const { competitorId } = await request.json();

    if (!competitorId) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // 1. Update timestamp AND select the data back
    const { data: competitor, error: compError } = await supabaseServer
      .from('competitors')
      .update({ last_scraped: new Date().toISOString() })
      .eq('id', competitorId)
      .select() // <--- CRITICAL: You must add this to get data back
      .single();

    if (compError || !competitor) {
      console.error('Lookup Error:', compError);
      return NextResponse.json({ error: 'Competitor not found in DB' }, { status: 404 });
    }

    // 2. Run audit (Ensuring protocol exists)
    const url = competitor.domain.startsWith('http') 
      ? competitor.domain 
      : `https://${competitor.domain}`;
      
    const auditResults = await performAudit(url);

    // 3. Save snapshot
    const { error: snapshotError } = await supabaseServer
      .from('snapshots')
      .insert({
        competitor_id: competitorId,
        audit_data: auditResults,
        created_at: new Date().toISOString()
      });

    if (snapshotError) {
      console.error('Snapshot Insert Error:', snapshotError);
      throw snapshotError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete scan' }, { status: 500 });
  }
}