import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseServer } from '@/lib/supabase'
import { performAudit } from '@/lib/auditChecks'
import { AIAnalyzer } from '@/lib/ai-analyzer'

export const runtime = "nodejs"


export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const competitorId = params.id

  // Get competitor
  const { data: competitor } = await supabaseServer
    .from('competitors')
    .select('*')
    .eq('id', competitorId)
    .single()

  if (!competitor) {
    return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
  }

  try {
    // Run audit
    const auditReport = await performAudit(`https://${competitor.domain}`)

    // Get last snapshot
    const { data: lastSnapshot } = await supabaseServer
      .from('snapshots')
      .select('audit_data')
      .eq('competitor_id', competitorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Save new snapshot
    await supabaseServer
      .from('snapshots')
      .insert({
        competitor_id: competitorId,
        audit_data: auditReport
      })

    // AI Analysis if previous snapshot exists
    if (lastSnapshot) {
      const analyzer = new AIAnalyzer()
      const analysis = await analyzer.analyzeCompetitorChange(
        competitor.name,
        lastSnapshot.audit_data,
        auditReport
      )

      // Save change if significant
      if (analysis.hasSignificantChange) {
        await supabaseServer
          .from('changes')
          .insert({
            competitor_id: competitorId,
            change_type: analysis.changeType,
            severity: analysis.severity,
            title: analysis.title,
            description: analysis.description,
            impact_estimate: analysis.impactEstimate,
            action: analysis.recommendedAction
          })
      }
    }

    // Update last_scraped
    await supabaseServer
      .from('competitors')
      .update({ last_scraped: new Date().toISOString() })
      .eq('id', competitorId)

    // Cleanup old snapshots
    await supabaseServer.rpc('cleanup_old_snapshots')

    return NextResponse.json({
      success: true,
      audit: auditReport
    })
  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: error.message || 'Scan failed' },
      { status: 500 }
    )
  }
}