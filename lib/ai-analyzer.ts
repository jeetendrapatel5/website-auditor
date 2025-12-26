import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIAnalyzer {
  /**
   * UPDATED FOR DEC 2025:
   * 'gemini-3-flash' is now the standard for fast, low-cost tasks.
   * 'gemini-2.5-flash' is the stable fallback.
   */
  private model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
  private fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async analyzeCompetitorChange(competitorName: string, oldAudit: any, newAudit: any) {
    const prompt = `You are a competitive intelligence analyst.
    Competitor: ${competitorName}
    OLD SCORES: Overall ${oldAudit.overallScore}, SEO ${oldAudit.seoScore}, Perf ${oldAudit.performanceScore}
    NEW SCORES: Overall ${newAudit.overallScore}, SEO ${newAudit.seoScore}, Perf ${newAudit.performanceScore}
    
    Respond ONLY with valid JSON:
    {
      "hasSignificantChange": boolean,
      "changeType": "improvement|decline|mixed",
      "severity": "critical|important|minor",
      "title": "string",
      "description": "string",
      "impactEstimate": number,
      "recommendedAction": "string",
      "opportunities": "string"
    }`;

    try {
      // Try primary model first
      let result = await this.model.generateContent(prompt).catch(() => this.fallbackModel.generateContent(prompt));
      const response = await result.response;
      const text = response.text();
      
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return { hasSignificantChange: false, title: 'Analysis Error', description: 'Could not parse changes.' };
    }
  }

  async generateWeeklyBriefing(projectName: string, competitors: any[]): Promise<string> {
    if (!competitors || competitors.length === 0) {
      return `# Weekly Intelligence Briefing\n\n**Project:** ${projectName}\n**Status:** ✅ All Quiet\nNo competitors tracked.`;
    }

    const competitorSummaries = competitors.map(comp => {
      const recentChanges = comp.changes?.slice(0, 3) || [];
      return `**${comp.name}** (${comp.domain})\n${recentChanges.map((c: any) => `- ${c.title}: ${c.description}`).join('\n')}`;
    }).join('\n');

    const prompt = `You are a CMO's executive assistant. Create a strategic 4-section briefing in markdown for project: ${projectName}.
    
    COMPETITOR DATA:
    ${competitorSummaries}
    
    Format:
    ## 🚨 THREAT ASSESSMENT
    ## 📊 KEY MOVES THIS WEEK
    ## ⚔️ COUNTER-ATTACK PLAN
    ## 💡 OPPORTUNITIES SPOTTED`;

    try {
      // Use fallback if gemini-3-flash is still rolling out to your key
      const result = await this.model.generateContent(prompt).catch(() => this.fallbackModel.generateContent(prompt));
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Briefing generation error:', error);
      return `## Briefing Unavailable\nAI Error: ${error.message}. Please check your API key in Google AI Studio.`;
    }
  }
}