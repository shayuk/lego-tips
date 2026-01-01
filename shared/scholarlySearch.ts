/**
 * Scholarly Web Search Module
 * Shared module for Firebase Functions and Express server
 * Searches for academic sources using OpenAlex API (no API key required)
 */

// Interface for scholarly source
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
  credibilityScore: number;
  relevanceScore: number;
}

// Helper: Search scholarly sources via OpenAlex
export async function searchScholarlySources(query: string, maxResults: number = 8): Promise<ScholarlySource[]> {
  if (!query || query.trim().length === 0) return [];
  const DENY_DOMAINS = ['wikipedia.org', 'wikimedia.org', 'medium.com', 'substack.com', 'blogspot.com', 'wordpress.com', 'coursehero.com', 'studocu.com'];
  const ACADEMIC_TYPES = ['journal-article', 'book', 'book-chapter', 'report', 'dissertation'];
  try {
    const queryKeywords = query.toLowerCase().replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2).slice(0, 10);
    const baseUrl = 'https://api.openalex.org/works';
    const searchParams = new URLSearchParams({ search: query, per_page: String(Math.min(maxResults * 2, 25)), filter: `type:${ACADEMIC_TYPES.join('|')}`, sort: 'relevance_score:desc' });
    const url = `${baseUrl}?${searchParams.toString()}`;
    
    // Use console.log for compatibility (both logger and console work in Node)
    const logFn = typeof console !== 'undefined' && console.log ? console.log : () => {};
    logFn(`[ScholarlySearch] Querying OpenAlex: ${query}`);
    
    const response = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Pedagogical-Lego/1.0' } });
    if (!response.ok) {
      const warnFn = typeof console !== 'undefined' && console.warn ? console.warn : logFn;
      warnFn(`[ScholarlySearch] OpenAlex API error: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const works = data.results || [];
    const sources: ScholarlySource[] = [];
    for (const work of works) {
      const landingUrl = work.open_access?.oa_url || work.primary_location?.landing_page_url || (work.doi ? `https://doi.org/${work.doi}` : null);
      if (landingUrl) {
        try {
          const domain = new URL(landingUrl).hostname.toLowerCase();
          if (DENY_DOMAINS.some(denied => domain.includes(denied))) continue;
        } catch {}
      }
      const credibilityScore = (work.type === 'journal-article' ? 0.3 : work.type === 'book' ? 0.2 : 0) + (work.open_access?.is_oa ? 0.1 : 0) + (work.doi ? 0.1 : 0) + Math.min(0.1, (work.cited_by_count || 0) / 1000) + 0.5;
      const combinedText = `${work.title || ''} ${work.abstract || ''}`.toLowerCase();
      const matches = queryKeywords.filter(kw => combinedText.includes(kw.toLowerCase())).length;
      const relevanceScore = queryKeywords.length > 0 ? matches / queryKeywords.length : 0.5;
      if (relevanceScore < 0.2 && credibilityScore < 0.6) continue;
      const authors = (work.authorships || []).slice(0, 5).map((auth: any) => auth.author?.display_name || 'Unknown').filter(Boolean);
      const year = work.publication_date ? parseInt(work.publication_date.split('-')[0]) : null;
      const yearValid = year && year > 1900 && year <= new Date().getFullYear() + 1 ? year : null;
      const venue = work.primary_location?.source?.display_name || work.locations?.[0]?.source?.display_name || null;
      sources.push({
        id: work.id || work.doi || `work_${Math.random().toString(36).substr(2, 9)}`,
        title: work.title || 'Untitled',
        authors: authors.length > 0 ? authors : ['Unknown'],
        year: yearValid,
        venue,
        doi: work.doi ? work.doi.replace('https://doi.org/', '') : null,
        isbn: null,
        url: landingUrl,
        abstractText: work.abstract || null,
        credibilityScore: Math.min(1.0, credibilityScore),
        relevanceScore
      });
      if (sources.length >= maxResults) break;
    }
    sources.sort((a, b) => (b.relevanceScore * 0.6 + b.credibilityScore * 0.4) - (a.relevanceScore * 0.6 + a.credibilityScore * 0.4));
    logFn(`[ScholarlySearch] Found ${sources.length} scholarly sources`);
    return sources.slice(0, maxResults);
  } catch (error: any) {
    const errorFn = typeof console !== 'undefined' && console.error ? console.error : () => {};
    errorFn('[ScholarlySearch] Error:', error);
    return [];
  }
}

// Helper: Format APA7 references
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

