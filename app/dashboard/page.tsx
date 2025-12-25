import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get user's projects
  const { data: projects } = await supabaseServer
    .from('projects')
    .select(`
      *,
      competitors (
        id,
        name,
        domain,
        last_scraped,
        changes (
          id,
          severity,
          title,
          created_at
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const project = projects?.[0]

  // Calculate metrics
  const totalCompetitors = project?.competitors?.length || 0

  const recentChanges =
    project?.competitors
      ?.flatMap(c => c.changes || [])
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 10) || []

  const criticalChanges = recentChanges.filter(
    c => c.severity === 'high'
  ).length

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {project?.name || 'Your Dashboard'}
            </h1>
            <p className="text-zinc-400">{session.user.email}</p>
          </div>

          {/* Proper sign out */}
          <SignOutButton />
        </div>

        <div className="mb-8">
          <Link href="/dashboard/reports">
            <Button variant="outline">📊 View Reports</Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-800 p-6 rounded-lg">
            <p className="text-sm text-zinc-400 mb-1">Threat Level</p>
            <p className="text-3xl font-bold">
              {criticalChanges > 2
                ? '🔴 HIGH'
                : criticalChanges > 0
                ? '🟡 MEDIUM'
                : '🟢 LOW'}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              {criticalChanges} critical changes
            </p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg">
            <p className="text-sm text-zinc-400 mb-1">Competitors Tracked</p>
            <p className="text-3xl font-bold">{totalCompetitors}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {3 - totalCompetitors} more on free plan
            </p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg">
            <p className="text-sm text-zinc-400 mb-1">Recent Activity</p>
            <p className="text-3xl font-bold">{recentChanges.length}</p>
            <p className="text-sm text-zinc-400 mt-1">
              Changes this week
            </p>
          </div>
        </div>

        {/* Add Competitor Button */}
        {totalCompetitors < 3 && (
          <div className="mb-8">
            <Link href="/dashboard/add-competitor">
              <Button className="w-full md:w-auto">
                + Add Competitor
              </Button>
            </Link>
          </div>
        )}

        {/* Competitors List */}
        {project?.competitors?.length ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Competitors</h2>

            {project.competitors.map(competitor => (
              <div
                key={competitor.id}
                className="bg-zinc-800 p-6 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {competitor.name}
                    </h3>
                    <p className="text-zinc-400">{competitor.domain}</p>
                  </div>

                  <Link
                    href={`/dashboard/competitor/${competitor.id}`}
                  >
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>

                <div className="text-sm text-zinc-400">
                  Last checked:{' '}
                  {competitor.last_scraped
                    ? new Date(
                        competitor.last_scraped
                      ).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              No competitors yet
            </h3>
            <p className="text-zinc-400 mb-6">
              Start tracking your competitors to get insights
            </p>

            <Link href="/dashboard/add-competitor">
              <Button>Add Your First Competitor</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
