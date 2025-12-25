'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ReportsPage() {
  const [briefing, setBriefing] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateBriefing() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reports/weekly-briefing', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setBriefing(data.briefing)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">← Back</Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Intelligence Reports</h1>
        <p className="text-zinc-400 mb-8">
          AI-generated strategic briefings on competitor activity
        </p>

        <div className="bg-zinc-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Weekly Intelligence Briefing</h2>
          <p className="text-zinc-400 mb-4">
            Get a comprehensive analysis of all competitor changes from the past 7 days
          </p>
          <Button 
            onClick={generateBriefing}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? '⏳ Generating Report...' : '✨ Generate Weekly Briefing'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {briefing && (
          <div className="bg-zinc-800 p-8 rounded-lg prose prose-invert max-w-none">
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ 
                __html: briefing.replace(/\n/g, '<br />') 
              }}
            />
          </div>
        )}

        {!briefing && !loading && (
          <div className="text-center py-16 bg-zinc-800 rounded-lg">
            <p className="text-zinc-400">
              Click the button above to generate your first intelligence briefing
            </p>
          </div>
        )}
      </div>
    </div>
  )
}