import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class AIAnalyzer {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async analyzeCompetitorChange(
    competitorName: string,
    oldAudit: any,
    newAudit: any
  ) {
    const prompt = `You are a competitive intelligence analyst.

Competitor: ${competitorName}

OLD AUDIT SCORES:
- Overall: ${oldAudit.overallScore}/100
- SEO: ${oldAudit.seoScore}/100
- Performance: ${oldAudit.performanceScore}/100
- Accessibility: ${oldAudit.accessibilityScore}/100
- Issues: ${oldAudit.issues.length}

NEW AUDIT SCORES:
- Overall: ${newAudit.overallScore}/100
- SEO: ${newAudit.seoScore}/100
- Performance: ${newAudit.performanceScore}/100
- Accessibility: ${newAudit.accessibilityScore}/100
- Issues: ${newAudit.issues.length}

OLD ISSUES:
${oldAudit.issues.map((i: any) => `- ${i.problem} (${i.severity})`).join('\n')}

NEW ISSUES:
${newAudit.issues.map((i: any) => `- ${i.problem} (${i.severity})`).join('\n')}

Analyze what changed and provide strategic insights.

Respond ONLY with valid JSON in this exact format:
{
  "hasSignificantChange": true/false,
  "changeType": "improvement|decline|mixed",
  "severity": "critical|important|minor",
  "title": "Brief title of the change",
  "description": "What changed and why it matters",
  "impactEstimate": 0,
  "recommendedAction": "Specific action to take in response",
  "opportunities": "How you can exploit this"
}

If no significant change (score diff <5 points), set hasSignificantChange to false.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      // Clean response
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      
      return parsed
    } catch (error) {
      console.error('AI analysis error:', error)
      return {
        hasSignificantChange: false,
        changeType: 'mixed',
        severity: 'minor',
        title: 'Change detected',
        description: 'Unable to analyze changes automatically',
        impactEstimate: 0,
        recommendedAction: 'Review changes manually',
        opportunities: 'Monitor for further changes'
      }
    }
  }

  async generateWeeklyBriefing(
    projectName: string,
    competitors: any[]
  ): Promise<string> {
    if (!competitors || competitors.length === 0) {
      return `# Weekly Intelligence Briefing

**Project:** ${projectName}
**Period:** Past 7 days
**Status:** ✅ All Quiet

No competitors being tracked yet. Add competitors to start receiving intelligence.`
    }

    const competitorSummaries = competitors.map(comp => {
      const recentChanges = comp.changes?.slice(0, 3) || []
      return `
**${comp.name}** (${comp.domain})
- Changes this week: ${recentChanges.length}
${recentChanges.map((c: any) => `  - ${c.title}: ${c.description}`).join('\n')}
`
    }).join('\n')

    const prompt = `You are a CMO's executive assistant creating a Monday morning briefing.

Project: ${projectName}

COMPETITOR ACTIVITY (Past 7 Days):
${competitorSummaries}

Create a strategic 4-section briefing in markdown:

## 🚨 THREAT ASSESSMENT
Rate overall threat level (🔴 RED / 🟡 YELLOW / 🟢 GREEN) and explain why.

## 📊 KEY MOVES THIS WEEK
Highlight 2-3 most important changes with strategic context.

## ⚔️ COUNTER-ATTACK PLAN
Provide 3 specific, prioritized actions with expected outcomes.

## 💡 OPPORTUNITIES SPOTTED
Where are competitors weak? What can we exploit?

Be concise, strategic, and actionable. Use business language, not technical jargon.`

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Briefing generation error:', error)
      return 'Unable to generate briefing. Please try again later.'
    }
  }
}