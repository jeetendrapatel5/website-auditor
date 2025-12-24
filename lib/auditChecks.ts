import * as cheerio from 'cheerio';

type Issue = {
  category: 'SEO' | 'Performance' | 'Accessibility';
  severity: 'high' | 'medium' | 'low';
  problem: string;
  why: string;
  howToFix: string;
};

type AuditReport = {
  url: string;
  overallScore: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  issues: Issue[];
  checkedAt: string;
};

export async function performAudit(url: string): Promise<AuditReport> {

  const html = await fetchWebsite(url);
  
  const $ = cheerio.load(html);
  
  const issues: Issue[] = [];
  
  issues.push(...checkTitle($));
  issues.push(...checkMetaDescription($));
  issues.push(...checkH1Tags($));
  issues.push(...checkHTTPS(url));
  
  issues.push(...checkImages($));
  
  issues.push(...checkImageAltText($));
  
  const scores = calculateScores(issues);
  
  return {
    url,
    overallScore: scores.overall,
    seoScore: scores.seo,
    performanceScore: scores.performance,
    accessibilityScore: scores.accessibility,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

async function fetchWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Website Auditor Bot)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Cannot fetch website: ${error}`);
  }
}

function checkTitle($: cheerio.CheerioAPI): Issue[] {
  const issues: Issue[] = [];
  const title = $('title').text();

  if (!title) {
    issues.push({
      category: 'SEO',
      severity: 'high',
      problem: 'Missing title tag',
      why: 'Title tags are crucial for SEO. They appear in search results and browser tabs.',
      howToFix: 'Add a <title> tag inside your <head> section with a descriptive page title (50-60 characters).',
    });
  } 

  else if (title.length < 30) {
    issues.push({
      category: 'SEO',
      severity: 'medium',
      problem: 'Title tag too short',
      why: 'Short titles may not fully describe your page content to users and search engines.',
      howToFix: 'Expand your title to 50-60 characters with relevant keywords and clear description.',
    });
  }

  else if (title.length > 60) {
    issues.push({
      category: 'SEO',
      severity: 'low',
      problem: 'Title tag too long',
      why: 'Long titles get cut off in search results, potentially hiding important information.',
      howToFix: 'Shorten your title to 50-60 characters, keeping the most important words at the start.',
    });
  }
  
  return issues;
}

function checkMetaDescription($: cheerio.CheerioAPI): Issue[] {
  const issues: Issue[] = [];
  const metaDescription = $('meta[name="description"]').attr('content');
  
  if (!metaDescription) {
    issues.push({
      category: 'SEO',
      severity: 'high',
      problem: 'Missing meta description',
      why: 'Meta descriptions appear in search results and help users decide whether to click.',
      howToFix: 'Add <meta name="description" content="Your page description here (150-160 characters)"> in the <head>.',
    });
  } else if (metaDescription.length < 120) {
    issues.push({
      category: 'SEO',
      severity: 'medium',
      problem: 'Meta description too short',
      why: 'Short descriptions don\'t provide enough information in search results.',
      howToFix: 'Expand your meta description to 150-160 characters with relevant keywords.',
    });
  } else if (metaDescription.length > 160) {
    issues.push({
      category: 'SEO',
      severity: 'low',
      problem: 'Meta description too long',
      why: 'Long descriptions get truncated in search results.',
      howToFix: 'Shorten your meta description to 150-160 characters.',
    });
  }
  
  return issues;
}

function checkH1Tags($: cheerio.CheerioAPI): Issue[] {
  const issues: Issue[] = [];
  const h1Tags = $('h1');

  if (h1Tags.length === 0) {
    issues.push({
      category: 'SEO',
      severity: 'high',
      problem: 'Missing H1 tag',
      why: 'H1 tags tell search engines and users what your page is about.',
      howToFix: 'Add one <h1> tag with your main page heading near the top of your content.',
    });
  } 
  
  else if (h1Tags.length > 1) {
    issues.push({
      category: 'SEO',
      severity: 'medium',
      problem: `Multiple H1 tags found (${h1Tags.length})`,
      why: 'Multiple H1 tags can confuse search engines about your page\'s main topic.',
      howToFix: 'Use only one <h1> tag for the main heading. Use <h2>, <h3>, etc. for subheadings.',
    });
  }
  
  return issues;
}

function checkHTTPS(url: string): Issue[] {
  const issues: Issue[] = [];
  
  if (!url.startsWith('https://')) {
    issues.push({
      category: 'Performance',
      severity: 'high',
      problem: 'Not using HTTPS',
      why: 'HTTPS encrypts data between users and your site. Search engines prefer HTTPS sites.',
      howToFix: 'Get an SSL certificate (often free with hosting) and redirect all HTTP traffic to HTTPS.',
    });
  }
  
  return issues;
}

function checkImages($: cheerio.CheerioAPI): Issue[] {
  const issues: Issue[] = [];
  const images = $('img');
  
  if (images.length > 20) {
    issues.push({
      category: 'Performance',
      severity: 'medium',
      problem: `High number of images (${images.length})`,
      why: 'Too many images can slow down page load time.',
      howToFix: 'Consider lazy loading images, using image sprites, or reducing the number of images.',
    });
  }
  
  return issues;
}

function checkImageAltText($: cheerio.CheerioAPI): Issue[] {
  const issues: Issue[] = [];
  const images = $('img');
  let missingAlt = 0;
  
  images.each((_, img) => {
    const alt = $(img).attr('alt');
    if (!alt) {
      missingAlt++;
    }
  });
  
  if (missingAlt > 0) {
    issues.push({
      category: 'Accessibility',
      severity: 'high',
      problem: `${missingAlt} image${missingAlt > 1 ? 's' : ''} missing alt text`,
      why: 'Alt text helps screen readers describe images to visually impaired users and helps SEO.',
      howToFix: 'Add descriptive alt attributes to all images: <img src="..." alt="Description of image">',
    });
  }
  
  return issues;
}

function calculateScores(issues: Issue[]) {

  let seo = 100;
  let performance = 100;
  let accessibility = 100;
 
  issues.forEach(issue => {

    const deduction = 
      issue.severity === 'high' ? 15 :
      issue.severity === 'medium' ? 10 : 5;
    
    if (issue.category === 'SEO') {
      seo = Math.max(0, seo - deduction);
    } else if (issue.category === 'Performance') {
      performance = Math.max(0, performance - deduction);
    } else if (issue.category === 'Accessibility') {
      accessibility = Math.max(0, accessibility - deduction);
    }
  });

  const overall = Math.round((seo + performance + accessibility) / 3);
  
  return {
    overall,
    seo,
    performance,
    accessibility,
  };
}