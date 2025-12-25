import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ScanButton from '@/components/dashboard/ScanButton'
import { authOptions } from '@/lib/auth'

// ... (Your type definitions remain the same) ...

export default async function CompetitorDetailPage({
  params // 1. Don't destructure yet
}: {
  params: Promise<{ id: string }> // 2. Update Type: params is now a Promise
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // 3. AWAIT the params here
  const { id } = await params 

  console.log(`🔍 [CompetitorDetail] Fetching ID: ${id}`) // This should now print the real ID

  // 4. Use 'id' (not params.id) for the rest of the function
  const { data: competitor, error } = await supabaseServer
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
    .eq('id', id) // Correct ID usage
    .single()

  // 3. Debugging Logs (Check your server terminal when this runs)
  if (error) {
    console.error("❌ [Supabase Error]:", error.message, error.details)
  }
  
  if (!competitor) {
    console.warn("⚠️ [No Data]: Competitor not found. Check RLS policies or ID validity.")
    
    // Improved 'Not Found' State
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Competitor Not Found</h1>
        <p className="text-zinc-400 mb-6 max-w-md">
          We couldn't find a competitor with ID: <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">{id}</code>
        </p>
        
        {/* Debug Info for you (Remove in production) */}
        {error && (
          <div className="bg-zinc-900 border border-red-900/50 p-4 rounded text-left mb-6 w-full max-w-md">
            <p className="text-red-400 text-xs font-mono mb-1">Error Details:</p>
            <p className="text-zinc-500 text-xs font-mono">{error.message}</p>
          </div>
        )}

        <Link href="/dashboard">
          <Button>← Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // 4. Safe Data Extraction
  // Sort snapshots to ensure we get the absolute latest
  const sortedSnapshots = competitor.snapshots?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || []

  const latestSnapshot = sortedSnapshots[0]
  const auditData = latestSnapshot?.audit_data as AuditData
  const changes = competitor.changes as Change[]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all">← Back to Dashboard</Button>
            </Link>
            <h1 className="text-3xl font-bold">{competitor.name}</h1>
            <p className="text-zinc-400 flex items-center gap-2 mt-1">
              {competitor.domain}
              <a href={competitor.domain.startsWith('http') ? competitor.domain : `https://${competitor.domain}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition-colors">
                Visit Site ↗
              </a>
            </p>
          </div>
          <ScanButton competitorId={competitor.id} />
        </div>

        {/* Latest Audit Score */}
        {auditData ? (
          <div className="bg-zinc-800 p-6 rounded-lg mb-6 border border-zinc-700/50">
            <h2 className="text-xl font-bold mb-4">Current Website Score</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScoreBox label="Overall" score={auditData.overallScore} large />
              <ScoreBox label="SEO" score={auditData.seoScore} />
              <ScoreBox label="Performance" score={auditData.performanceScore} />
              <ScoreBox label="Accessibility" score={auditData.accessibilityScore} />
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-right">
              Last checked: {new Date(latestSnapshot.created_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-dashed border-zinc-700 p-8 rounded-lg mb-6 text-center">
            <p className="text-zinc-400">No audit data available yet.</p>
            <p className="text-sm text-zinc-500 mt-1">Click "Scan Now" to run the first audit.</p>
          </div>
        )}

        {/* Detected Changes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Detected Changes 
            <span className="text-sm font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {changes?.length || 0}
            </span>
          </h2>
          
          {changes && changes.length > 0 ? (
            <div className="space-y-4">
              {changes.map((change) => (
                <div 
                  key={change.id} 
                  className="bg-zinc-800 p-6 rounded-lg border-l-4 transition-transform hover:translate-x-1"
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
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                      change.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                      change.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {change.severity}
                    </span>
                  </div>
                  
                  {change.description && (
                    <p className="text-zinc-300 mb-4 leading-relaxed">{change.description}</p>
                  )}
                  
                  {change.action && (
                    <div className="bg-zinc-900/80 p-4 rounded border border-zinc-700/50">
                      <p className="text-xs font-bold text-green-400 uppercase mb-1 tracking-wider">
                        Recommendation
                      </p>
                      <p className="text-sm text-zinc-300">{change.action}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-800 p-8 rounded-lg text-center border border-zinc-700">
              <p className="text-zinc-400">No changes detected yet.</p>
            </div>
          )}
        </div>

        {/* Current Issues */}
        {auditData?.issues && auditData.issues.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Issues ({auditData.issues.length})</h2>
            <div className="grid gap-3">
              {auditData.issues.map((issue, index) => (
                <div key={index} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-200">{issue.problem}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{issue.why}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      issue.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      issue.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Component for consistency
function ScoreBox({ label, score, large = false }: { label: string, score: number, large?: boolean }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500'
    if (s >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="text-center p-2">
      <p className="text-sm text-zinc-400 mb-2 font-medium uppercase tracking-wider">{label}</p>
      <p className={`${large ? 'text-5xl' : 'text-3xl'} font-bold ${getColor(score)}`}>
        {score}
      </p>
    </div>
  )
}