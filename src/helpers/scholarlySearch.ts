/**
 * Scholarly Web Search Module
 * Searches for academic sources using OpenAlex API (no API key required)
 * Filters out non-peer-reviewed sources (Wikipedia, blogs, etc.)
 */

export interface ScholarlySource {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  isbn: string | null;
  url: string | null;
  abstractText: string | null;
  credibilityScore: number; // 0-1
  relevanceScore: number; // 0-1
}

// Domains to deny (non-peer-reviewed sources)
const DENY_DOMAINS = [
  'wikipedia.org',
  'wikimedia.org',
  'medium.com',
  'substack.com',
  'blogspot.com',
  'wordpress.com',
  'coursehero.com',
  'studocu.com',
  'chegg.com',
  'quizlet.com',
  'reddit.com',
  'quora.com',
  'yahoo.com',
  'answers.com'
];

// Academic types from OpenAlex
const ACADEMIC_TYPES = [
  'journal-article',
  'book',
  'book-chapter',
  'report',
  'dissertation',
  'dataset'
];

/**
 * Checks if a URL should be denied based on domain
 */
function isDeniedDomain(url: string | null): boolean {
  if (!url) return false;
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return DENY_DOMAINS.some(denied => domain.includes(denied));
  } catch {
    return false;
  }
}

/**
 * Calculates credibility score based on source metadata
 */
function calculateCredibilityScore(work: any): number {
  let score = 0.5; // Base score
  
  // Boost for journal articles
  if (work.type === 'journal-article') {
    score += 0.3;
  }
  
  // Boost for books
  if (work.type === 'book') {
    score += 0.2;
  }
  
  // Boost for open access
  if (work.open_access?.is_oa) {
    score += 0.1;
  }
  
  // Boost for citations count
  if (work.cited_by_count && work.cited_by_count > 10) {
    score += Math.min(0.1, work.cited_by_count / 1000);
  }
  
  // Boost for DOI
  if (work.doi) {
    score += 0.1;
  }
  
  return Math.min(1.0, score);
}

/**
 * Calculates relevance score based on title/abstract matching
 */
function calculateRelevanceScore(work: any, queryKeywords: string[]): number {
  if (queryKeywords.length === 0) return 0.5;
  
  const title = (work.title || '').toLowerCase();
  const abstract = (work.abstract || '').toLowerCase();
  const combinedText = `${title} ${abstract}`;
  
  let matches = 0;
  queryKeywords.forEach(keyword => {
    if (combinedText.includes(keyword.toLowerCase())) {
      matches++;
    }
  });
  
  return matches / queryKeywords.length;
}

/**
 * Formats authors array from OpenAlex format
 */
function formatAuthors(authorships: any[]): string[] {
  if (!authorships || authorships.length === 0) return ['Unknown'];
  
  return authorships
    .slice(0, 5) // Limit to 5 authors
    .map(auth => {
      const author = auth.author;
      if (author.display_name) {
        return author.display_name;
      }
      return 'Unknown';
    })
    .filter(Boolean);
}

/**
 * Formats venue/journal name from OpenAlex format
 */
function formatVenue(work: any): string | null {
  if (work.primary_location?.source?.display_name) {
    return work.primary_location.source.display_name;
  }
  if (work.locations?.[0]?.source?.display_name) {
    return work.locations[0].source.display_name;
  }
  return null;
}

/**
 * Extracts year from publication date
 */
function extractYear(work: any): number | null {
  if (work.publication_date) {
    const year = parseInt(work.publication_date.split('-')[0]);
    if (!isNaN(year) && year > 1900 && year <= new Date().getFullYear() + 1) {
      return year;
    }
  }
  return null;
}

/**
 * Gets landing page URL (prefer open access, fallback to DOI)
 */
function getLandingUrl(work: any): string | null {
  // Prefer open access URL
  if (work.open_access?.oa_url) {
    return work.open_access.oa_url;
  }
  
  // Fallback to primary location URL
  if (work.primary_location?.landing_page_url) {
    return work.primary_location.landing_page_url;
  }
  
  // Fallback to DOI URL
  if (work.doi) {
    return `https://doi.org/${work.doi}`;
  }
  
  return null;
}

/**
 * Searches for scholarly sources using OpenAlex API
 */
export async function searchScholarlySources(params: {
  query: string;
  maxResults?: number;
  minYear?: number;
}): Promise<ScholarlySource[]> {
  const { query, maxResults = 10, minYear } = params;
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  try {
    // Extract keywords for relevance scoring
    const queryKeywords = query
      .toLowerCase()
      .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 10);
    
    // Build OpenAlex API URL
    const baseUrl = 'https://api.openalex.org/works';
    const searchParams = new URLSearchParams({
      search: query,
      per_page: String(Math.min(maxResults * 2, 25)), // Get more to filter
      filter: `type:${ACADEMIC_TYPES.join('|')}`,
      sort: 'relevance_score:desc'
    });
    
    if (minYear && minYear >= 2015) {
      searchParams.append('filter', `publication_year:>=${minYear}`);
    }
    
    const url = `${baseUrl}?${searchParams.toString()}`;
    
    console.log(`[ScholarlySearch] Querying OpenAlex: ${query}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pedagogical-Lego/1.0'
      }
    });
    
    if (!response.ok) {
      console.warn(`[ScholarlySearch] OpenAlex API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const works = data.results || [];
    
    // Filter and transform results
    const sources: ScholarlySource[] = [];
    
    for (const work of works) {
      // Skip denied domains
      const landingUrl = getLandingUrl(work);
      if (isDeniedDomain(landingUrl)) {
        continue;
      }
      
      // Calculate scores
      const credibilityScore = calculateCredibilityScore(work);
      const relevanceScore = calculateRelevanceScore(work, queryKeywords);
      
      // Only include sources with reasonable relevance
      if (relevanceScore < 0.2 && credibilityScore < 0.6) {
        continue;
      }
      
      const source: ScholarlySource = {
        id: work.id || work.doi || `work_${Math.random().toString(36).substr(2, 9)}`,
        title: work.title || 'Untitled',
        authors: formatAuthors(work.authorships || []),
        year: extractYear(work),
        venue: formatVenue(work),
        doi: work.doi ? work.doi.replace('https://doi.org/', '') : null,
        isbn: null, // OpenAlex doesn't provide ISBN directly
        url: landingUrl,
        abstractText: work.abstract || null,
        credibilityScore,
        relevanceScore
      };
      
      sources.push(source);
      
      // Stop when we have enough high-quality sources
      if (sources.length >= maxResults) {
        break;
      }
    }
    
    // Sort by combined score (relevance + credibility)
    sources.sort((a, b) => {
      const scoreA = a.relevanceScore * 0.6 + a.credibilityScore * 0.4;
      const scoreB = b.relevanceScore * 0.6 + b.credibilityScore * 0.4;
      return scoreB - scoreA;
    });
    
    console.log(`[ScholarlySearch] Found ${sources.length} scholarly sources`);
    
    return sources.slice(0, maxResults);
    
  } catch (error) {
    console.error('[ScholarlySearch] Error searching sources:', error);
    return [];
  }
}

/**
 * Formats sources into APA 7th edition bibliography format
 */
export function formatAPA7References(sources: ScholarlySource[]): string[] {
  return sources.map(source => {
    const authors = source.authors.length > 0
      ? source.authors.length === 1
        ? source.authors[0]
        : source.authors.length <= 7
        ? source.authors.slice(0, -1).join(', ') + ', & ' + source.authors[source.authors.length - 1]
        : source.authors.slice(0, 6).join(', ') + ', ... ' + source.authors[source.authors.length - 1]
      : 'Unknown';
    
    const year = source.year ? ` (${source.year})` : ' (n.d.)';
    const title = source.title ? `. ${source.title}` : '';
    const venue = source.venue ? `. ${source.venue}` : '';
    const doi = source.doi ? ` https://doi.org/${source.doi}` : '';
    const url = !source.doi && source.url ? ` ${source.url}` : '';
    
    return `${authors}${year}${title}${venue}${doi}${url}`;
  });
}

