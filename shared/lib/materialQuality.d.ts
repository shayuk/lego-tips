/**
 * Material Quality Assessment Module
 * Shared module for Firebase Functions and Express server
 * Assesses the quality and relevance of uploaded course materials
 */
export interface MaterialQualityReport {
    quality: "good" | "thin" | "mismatched";
    reasons: string[];
    coverageScore: number;
}
export declare function extractKeywords(text: string): string[];
export declare function assessMaterialQuality(userRequestText: string, materialText: string): MaterialQualityReport;
export declare function validateAssignmentSpecificity(output: string, userRequestText: string): boolean;
