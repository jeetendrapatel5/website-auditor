'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AddCompetitorPage() {
  const router = useRouter()
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasProject, setHasProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDomain, setProjectDomain] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  useEffect(() => {
    checkForProject()
  }, [])

  async function checkForProject() {
    try {
      const response = await fetch('/api/projects')
      const projects = await response.json()
      
      if (projects.length > 0) {
        setProjectId(projects[0].id)
        setHasProject(true)
      }
    } catch (error) {
      console.error('Error checking projects:', error)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreatingProject(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          domain: projectDomain
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create project')
        setCreatingProject(false)
        return
      }

      const project = await response.json()
      setProjectId(project.id)
      setHasProject(true)
      setCreatingProject(false)
    } catch (err) {
      setError('Something went wrong')
      setCreatingProject(false)
    }
  }

  async function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!name || !domain) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name,
          domain: domain.replace(/^https?:\/\//, '')
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to add competitor')
        setLoading(false)
        return
      }

      const competitor = await response.json()
      
      // Trigger initial scan
      await fetch(`/api/competitors/${competitor.id}/scan`, {
        method: 'POST'
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  if (!hasProject) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">First, tell us about your website</h1>
          <p className="text-zinc-400 mb-8">
            We need to know your website to track competitors
          </p>

          <form onSubmit={handleCreateProject} className="space-y-4 bg-zinc-800 p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Company/Project Name
              </label>
              <Input
                placeholder="e.g., My SaaS Company"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Website Domain
              </label>
              <Input
                placeholder="e.g., mycompany.com"
                value={projectDomain}
                onChange={(e) => setProjectDomain(e.target.value)}
                required
                className="bg-zinc-900"
              />
              <p className="text-xs text-zinc-500 mt-1">
                No http:// needed, just the domain
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
              type="submit" 
              className="w-full"
              disabled={creatingProject}
            >
              {creatingProject ? 'Creating...' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Add Competitor</h1>
        <p className="text-zinc-400 mb-8">
          Track a competitor's website changes automatically
        </p>

        <form onSubmit={handleAddCompetitor} className="space-y-4 bg-zinc-800 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">
              Competitor Name
            </label>
            <Input
              placeholder="e.g., Competitor Inc"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Competitor Website
            </label>
            <Input
              placeholder="e.g., competitor.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="bg-zinc-900"
            />
            <p className="text-xs text-zinc-500 mt-1">
              No http:// needed, just the domain
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adding & Scanning...' : 'Add Competitor'}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>📊 What we'll track:</strong>
            <br />
            • Website performance scores
            <br />
            • SEO changes (title, meta, headings)
            <br />
            • Content updates
            <br />
            • Accessibility improvements
          </p>
        </div>
      </div>
    </div>
  )
}