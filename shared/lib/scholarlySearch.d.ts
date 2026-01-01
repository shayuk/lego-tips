/**
 * Scholarly Web Search Module
 * Shared module for Firebase Functions and Express server
 * Searches for academic sources using OpenAlex API (no API key required)
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
    credibilityScore: number;
    relevanceScore: number;
}
export declare function searchScholarlySources(query: string, maxResults?: number): Promise<ScholarlySource[]>;
export declare function formatAPA7References(sources: ScholarlySource[]): string[];
