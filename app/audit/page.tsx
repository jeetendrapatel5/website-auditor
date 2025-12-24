'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type AuditReport = {
  url: string;
  overallScore: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  issues: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    problem: string;
    why: string;
    howToFix: string;
  }>;
  checkedAt: string;
};

export default function AuditPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    fetchAuditReport(url);
  }, [url]);

  async function fetchAuditReport(targetUrl: string) {
    try {
      setLoading(true);
      
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to audit website');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError('Failed to audit website. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Analyzing {url}...</h2>
          <p className="text-zinc-400">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-red-500">Error</h2>
          <p>{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Audit Report</h1>
        
        {/* Overall Score */}
        <div className="bg-zinc-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl mb-4">Overall Score</h2>
          <div className="text-6xl font-bold mb-4">
            {report.overallScore}/100
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-zinc-400">SEO</p>
              <p className="text-2xl">{report.seoScore}/100</p>
            </div>
            <div>
              <p className="text-zinc-400">Performance</p>
              <p className="text-2xl">{report.performanceScore}/100</p>
            </div>
            <div>
              <p className="text-zinc-400">Accessibility</p>
              <p className="text-2xl">{report.accessibilityScore}/100</p>
            </div>
          </div>
        </div>

        {/* Issues Found */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Issues Found ({report.issues.length})</h2>
          
          {report.issues.length === 0 ? (
            <p className="text-zinc-400">No issues found! Great job!</p>
          ) : (
            report.issues.map((issue, index) => (
              <div key={index} className="bg-zinc-800 p-6 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{issue.problem}</h3>
                  <span className={`px-3 py-1 rounded text-sm ${
                    issue.severity === 'high' ? 'bg-red-500' :
                    issue.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                
                <p className="text-zinc-400 mb-4">{issue.why}</p>
                
                <div className="bg-zinc-900 p-4 rounded">
                  <p className="text-sm font-semibold text-green-400 mb-2">How to fix:</p>
                  <p className="text-sm">{issue.howToFix}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}