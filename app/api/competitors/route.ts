import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // ✅ Import authOptions
import { supabaseServer } from '@/lib/supabase'

// Get user's competitors
export async function GET(req: Request) {
  const session = await getServerSession(authOptions) // ✅ Pass authOptions
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects } = await supabaseServer
    .from('projects')
    .select(`
      *,
      competitors (
        *,
        changes (*)
      )
    `)
    .eq('user_id', session.user.id)

  return NextResponse.json(projects || [])
}

// Add new competitor
export async function POST(req: Request) {
  const session = await getServerSession(authOptions) // ✅ Pass authOptions
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, name, domain } = await req.json()

  if (!projectId || !name || !domain) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseServer
    .from('competitors')
    .insert({
      project_id: projectId,
      name,
      domain
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}