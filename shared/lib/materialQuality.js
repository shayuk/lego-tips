"use strict";
/**
 * Material Quality Assessment Module
 * Shared module for Firebase Functions and Express server
 * Assesses the quality and relevance of uploaded course materials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAssignmentSpecificity = exports.assessMaterialQuality = exports.extractKeywords = void 0;
// Helper: Extract keywords from text
function extractKeywords(text) {
    if (!text || text.trim().length === 0)
        return [];
    const stopWords = new Set(['את', 'אתה', 'אני', 'הוא', 'היא', 'של', 'על', 'אל', 'עם', 'ב', 'ל', 'מ', 'כ', 'זה', 'זו', 'היה', 'היו', 'יש', 'אין', 'לא', 'כן']);
    const words = text.toLowerCase().replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    return Array.from(new Set(words)).sort((a, b) => b.length - a.length).slice(0, 15);
}
exports.extractKeywords = extractKeywords;
// Helper: Assess material quality
function assessMaterialQuality(userRequestText, materialText) {
    const materialLength = materialText.trim().length;
    if (materialLength < 50) {
        return { quality: "thin", reasons: ["החומר שהועלה קצר מדי או ריק"], coverageScore: 0 };
    }
    const keywords = extractKeywords(userRequestText);
    if (keywords.length === 0) {
        return { quality: materialLength < 200 ? "thin" : "good", reasons: ["לא ניתן לזהות נושאים מרכזיים"], coverageScore: materialLength < 200 ? 0.3 : 0.5 };
    }
    const lowerMaterial = materialText.toLowerCase();
    const keywordHits = keywords.map(k => ({ keyword: k, hits: (lowerMaterial.match(new RegExp(k, 'g')) || []).length }));
    const keywordsWithHits = keywordHits.filter(kh => kh.hits > 0).length;
    const keywordsWithMultipleHits = keywordHits.filter(kh => kh.hits >= 2).length;
    const keywordsWithManyHits = keywordHits.filter(kh => kh.hits >= 5).length;
    const totalKeywords = keywordHits.length;
    const baseScore = keywordsWithHits / totalKeywords;
    const multipleHitsBonus = (keywordsWithMultipleHits / totalKeywords) * 0.2;
    const manyHitsBonus = (keywordsWithManyHits / totalKeywords) * 0.3;
    const coverageScore = Math.min(1.0, baseScore + multipleHitsBonus + manyHitsBonus);
    const reasons = [];
    let quality;
    if (coverageScore >= 0.6) {
        quality = "good";
        reasons.push("החומר שהועלה מכיל תוכן רלוונטי לנושא");
    }
    else if (coverageScore >= 0.3) {
        quality = "thin";
        reasons.push("החומר שהועלה דל או מכיל תוכן חלקי בלבד");
        const missingKeywords = keywordHits.filter(kh => kh.hits === 0).slice(0, 3).map(kh => kh.keyword);
        if (missingKeywords.length > 0)
            reasons.push(`חסרים נושאים מרכזיים: ${missingKeywords.join(', ')}`);
    }
    else {
        quality = "mismatched";
        reasons.push("החומר שהועלה לא תואם לנושא המבוקש");
        const missingKeywords = keywordHits.filter(kh => kh.hits === 0).slice(0, 5).map(kh => kh.keyword);
        if (missingKeywords.length > 0)
            reasons.push(`נושאים מרכזיים חסרים: ${missingKeywords.join(', ')}`);
    }
    return { quality, reasons, coverageScore };
}
exports.assessMaterialQuality = assessMaterialQuality;
// Helper: Validate assignment specificity
function validateAssignmentSpecificity(output, userRequestText) {
    const keywords = extractKeywords(userRequestText);
    if (keywords.length === 0)
        return true; // Can't validate without keywords
    const lowerOutput = output.toLowerCase();
    const foundKeywords = keywords.filter(kw => lowerOutput.includes(kw.toLowerCase()));
    return foundKeywords.length >= Math.min(2, Math.floor(keywords.length * 0.3));
}
exports.validateAssignmentSpecificity = validateAssignmentSpecificity;
