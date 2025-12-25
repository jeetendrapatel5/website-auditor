import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseServer } from '@/lib/supabase'
import { AIAnalyzer } from '@/lib/ai-analyzer'

export async function POST() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's project with competitors and recent changes
    const { data: projects } = await supabaseServer
      .from('projects')
      .select(`
        *,
        competitors (
          id,
          name,
          domain,
          changes (
            id,
            title,
            description,
            severity,
            created_at
          )
        )
      `)
      .eq('user_id', session.user.id)

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'No project found' },
        { status: 404 }
      )
    }

    const project = projects[0]

    // Filter changes from last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const competitorsWithRecentChanges = project.competitors.map((comp: any) => ({
      ...comp,
      changes: comp.changes.filter((c: any) => 
        new Date(c.created_at) >= weekAgo
      )
    }))

    // Generate briefing with AI
    const analyzer = new AIAnalyzer()
    const briefing = await analyzer.generateWeeklyBriefing(
      project.name,
      competitorsWithRecentChanges
    )

    return NextResponse.json({
      success: true,
      briefing,
      project: project.name,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}