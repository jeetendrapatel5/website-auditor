import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ScanButton from '@/components/dashboard/ScanButton'

export default async function CompetitorDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get competitor with snapshots and changes
  const { data: competitor } = await supabaseServer
    .from('competitors')
    .select(`
      *,
      snapshots (
        id,
        audit_data,
        created_at
      ),
      changes (
        id,
        change_type,
        severity,
        title,
        description,
        impact_estimate,
        action,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!competitor) {
    return <div className="p-8">Competitor not found</div>
  }

  const latestSnapshot = competitor.snapshots?.[0]
  const auditData = latestSnapshot?.audit_data as any

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2">← Back to Dashboard</Button>
            </Link>
            <h1 className="text-3xl font-bold">{competitor.name}</h1>
            <p className="text-zinc-400">{competitor.domain}</p>
          </div>
          <ScanButton competitorId={competitor.id} />
        </div>

        {/* Latest Audit Score */}
        {auditData && (
          <div className="bg-zinc-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Current Website Score</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">Overall</p>
                <p className="text-4xl font-bold">{auditData.overallScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">SEO</p>
                <p className="text-2xl font-bold">{auditData.seoScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">Performance</p>
                <p className="text-2xl font-bold">{auditData.performanceScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">Accessibility</p>
                <p className="text-2xl font-bold">{auditData.accessibilityScore}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Last checked: {new Date(latestSnapshot.created_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Detected Changes */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Detected Changes ({competitor.changes?.length || 0})
          </h2>
          
          {competitor.changes && competitor.changes.length > 0 ? (
            <div className="space-y-4">
              {competitor.changes.map((change: any) => (
                <div 
                  key={change.id} 
                  className="bg-zinc-800 p-6 rounded-lg border-l-4"
                  style={{
                    borderColor: 
                      change.severity === 'high' ? '#ef4444' :
                      change.severity === 'medium' ? '#eab308' : '#3b82f6'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{change.title}</h3>
                      <p className="text-sm text-zinc-400">
                        {new Date(change.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      change.severity === 'high' ? 'bg-red-500' :
                      change.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {change.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  {change.description && (
                    <p className="text-zinc-300 mb-3">{change.description}</p>
                  )}
                  
                  {change.action && (
                    <div className="bg-zinc-900 p-4 rounded">
                      <p className="text-sm font-semibold text-green-400 mb-1">
                        💡 Recommended Action:
                      </p>
                      <p className="text-sm">{change.action}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-800 p-8 rounded-lg text-center">
              <p className="text-zinc-400">
                No changes detected yet. We'll notify you when something changes.
              </p>
            </div>
          )}
        </div>

        {/* Current Issues */}
        {auditData?.issues && auditData.issues.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Current Issues ({auditData.issues.length})
            </h2>
            <div className="space-y-3">
              {auditData.issues.map((issue: any, index: number) => (
                <div key={index} className="bg-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{issue.problem}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      issue.severity === 'high' ? 'bg-red-500' :
                      issue.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{issue.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}