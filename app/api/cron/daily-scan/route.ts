import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { performAudit } from '@/lib/auditChecks'
import { AIAnalyzer } from '@/lib/ai-analyzer'

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting daily competitor scan...')

    // Get competitors that need scanning (last scanned > 24h ago or never scanned)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: competitors, error: fetchError } = await supabaseServer
      .from('competitors')
      .select('id, name, domain, last_scraped')
      .or(`last_scraped.is.null,last_scraped.lt.${yesterday.toISOString()}`)
      .limit(20) // Process 20 per run

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    console.log(`Found ${competitors?.length || 0} competitors to scan`)

    const results = []
    const analyzer = new AIAnalyzer()

    for (const competitor of competitors || []) {
      try {
        console.log(`Scanning ${competitor.name}...`)

        // Run audit
        const auditReport = await performAudit(`https://${competitor.domain}`)

        // Get last snapshot
        const { data: lastSnapshot } = await supabaseServer
          .from('snapshots')
          .select('audit_data')
          .eq('competitor_id', competitor.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Save new snapshot
        await supabaseServer
          .from('snapshots')
          .insert({
            competitor_id: competitor.id,
            audit_data: auditReport
          })

        // AI Analysis if previous snapshot exists
        if (lastSnapshot) {
          const analysis = await analyzer.analyzeCompetitorChange(
            competitor.name,
            lastSnapshot.audit_data,
            auditReport
          )

          if (analysis.hasSignificantChange) {
            await supabaseServer
              .from('changes')
              .insert({
                competitor_id: competitor.id,
                change_type: analysis.changeType,
                severity: analysis.severity,
                title: analysis.title,
                description: analysis.description,
                impact_estimate: analysis.impactEstimate,
                action: analysis.recommendedAction
              })

            console.log(`Change detected for ${competitor.name}: ${analysis.title}`)
          }
        }

        // Update last_scraped
        await supabaseServer
          .from('competitors')
          .update({ last_scraped: new Date().toISOString() })
          .eq('id', competitor.id)

        results.push({
          competitor: competitor.name,
          success: true
        })

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error: any) {
        console.error(`Error scanning ${competitor.name}:`, error)
        results.push({
          competitor: competitor.name,
          success: false,
          error: error.message
        })
      }
    }

    // Cleanup old snapshots
    await supabaseServer.rpc('cleanup_old_snapshots')

    console.log('Daily scan completed')

    return NextResponse.json({
      success: true,
      processed: competitors?.length || 0,
      results
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}