import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseServer } from '@/lib/supabase';
import { AIAnalyzer } from '@/lib/ai-analyzer';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: projects, error: dbError } = await supabaseServer
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
      .eq('user_id', session.user.id);

    if (dbError) throw dbError;
    if (!projects || projects.length === 0) {
      return NextResponse.json({ error: 'No project found' }, { status: 404 });
    }

    const project = projects[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const competitorsWithRecentChanges = project.competitors.map((comp: any) => ({
      ...comp,
      changes: comp.changes.filter((c: any) => 
        new Date(c.created_at) >= weekAgo
      )
    }));

    const analyzer = new AIAnalyzer();
    const briefing = await analyzer.generateWeeklyBriefing(
      project.name,
      competitorsWithRecentChanges
    );

    return NextResponse.json({
      success: true,
      briefing,
      project: project.name,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}