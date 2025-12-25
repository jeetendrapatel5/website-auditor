import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // ✅ Import
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions) // ✅ Pass authOptions
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects } = await supabaseServer
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)

  return NextResponse.json(projects || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) // ✅ Pass authOptions
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, domain } = await req.json()

  if (!name || !domain) {
    return NextResponse.json(
      { error: 'Name and domain required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseServer
    .from('projects')
    .insert({
      user_id: session.user.id,
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