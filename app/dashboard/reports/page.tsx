'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Loader2, Sparkles, ChevronLeft, BarChart3, ShieldAlert } from 'lucide-react'

export default function ReportsPage() {
  const [briefing, setBriefing] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateBriefing() {
    setLoading(true)
    setError('')
    setBriefing('')

    try {
      const response = await fetch('/api/reports/weekly-briefing', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      setBriefing(data.briefing)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-zinc-400 hover:text-white p-0 hover:bg-transparent">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Intelligence Reports</h1>
            <p className="text-zinc-400 text-lg font-medium">
              Weekly strategic synthesis of competitor movements.
            </p>
          </div>
          <Button 
            onClick={generateBriefing}
            disabled={loading}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Briefing
              </>
            )}
          </Button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <ShieldAlert className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Empty State / Content */}
        {!briefing && !loading ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
            <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="text-zinc-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Briefing</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Ready to see what changed? Click the button above to analyze the last 7 days of competitor data.
            </p>
          </div>
        ) : briefing ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-500">
            {/* Report Header Decorative Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
            
            <div className="p-8 md:p-12">
              <div className="prose prose-invert prose-indigo max-w-none 
                prose-headings:font-bold prose-h2:text-indigo-400 prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2
                prose-strong:text-zinc-100 prose-p:text-zinc-300 prose-li:text-zinc-300">
                <ReactMarkdown>{briefing}</ReactMarkdown>
              </div>
              
              <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-wrap gap-4 items-center justify-between text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ANALYSIS COMPLETE
                </div>
                <div>ENGINE: GEMINI-1.5-FLASH</div>
                <div>TS: {new Date().toISOString()}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Loading State Skeletal View */
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-zinc-900 rounded w-1/4" />
            <div className="h-64 bg-zinc-900 rounded w-full" />
            <div className="h-32 bg-zinc-900 rounded w-full" />
          </div>
        )}
      </div>
    </div>
  )
}