/**
 * Material Quality Assessment Module
 * Assesses the quality and relevance of uploaded course materials
 */

export interface MaterialQualityResult {
  quality: "good" | "thin" | "mismatched";
  reasons: string[];
  keywordHits: Array<{ keyword: string; hits: number }>;
  coverageScore: number; // 0-1
}

/**
 * Extracts keywords from user request text
 * Focuses on nouns, entities, and key concepts
 */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  
  // Common Hebrew stop words to filter out
  const stopWords = new Set([
    'את', 'אתה', 'אתה', 'אני', 'הוא', 'היא', 'אנחנו', 'אתם', 'אתן', 'הם', 'הן',
    'של', 'על', 'אל', 'עם', 'ב', 'ל', 'מ', 'כ', 'כמו', 'או', 'וגם', 'אבל',
    'זה', 'זו', 'אלה', 'אלו', 'מה', 'מי', 'איפה', 'מתי', 'איך', 'למה',
    'היה', 'היו', 'יהיה', 'יהיו', 'יש', 'אין', 'לא', 'כן'
  ]);
  
  // Split by common delimiters and filter
  const words = text
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Return unique keywords, prioritizing longer words
  return Array.from(new Set(words))
    .sort((a, b) => b.length - a.length)
    .slice(0, 15); // Top 15 keywords
}

/**
 * Calculates keyword hit rate in material text
 */
function calculateKeywordHits(keywords: string[], materialText: string): Array<{ keyword: string; hits: number }> {
  const lowerMaterial = materialText.toLowerCase();
  return keywords.map(keyword => ({
    keyword,
    hits: (lowerMaterial.match(new RegExp(keyword, 'g')) || []).length
  }));
}

/**
 * Calculates coverage score based on keyword hits
 */
function calculateCoverageScore(keywordHits: Array<{ keyword: string; hits: number }>): number {
  if (keywordHits.length === 0) return 0;
  
  // Weight: at least 1 hit per keyword = 0.3, 2+ hits = 0.5, 5+ hits = 1.0
  const totalKeywords = keywordHits.length;
  const keywordsWithHits = keywordHits.filter(kh => kh.hits > 0).length;
  const keywordsWithMultipleHits = keywordHits.filter(kh => kh.hits >= 2).length;
  const keywordsWithManyHits = keywordHits.filter(kh => kh.hits >= 5).length;
  
  const baseScore = keywordsWithHits / totalKeywords;
  const multipleHitsBonus = (keywordsWithMultipleHits / totalKeywords) * 0.2;
  const manyHitsBonus = (keywordsWithManyHits / totalKeywords) * 0.3;
  
  return Math.min(1.0, baseScore + multipleHitsBonus + manyHitsBonus);
}

/**
 * Assesses material quality based on user request and uploaded material content
 */
export function assessMaterialQuality(params: {
  userRequestText: string;
  extractedMaterialTextOrChunks: string | string[];
}): MaterialQualityResult {
  const { userRequestText, extractedMaterialTextOrChunks } = params;
  
  // Combine material chunks if array
  const materialText = Array.isArray(extractedMaterialTextOrChunks)
    ? extractedMaterialTextOrChunks.join('\n\n')
    : extractedMaterialTextOrChunks || '';
  
  // Check if material is empty or too short
  const materialLength = materialText.trim().length;
  if (materialLength < 50) {
    return {
      quality: "thin",
      reasons: ["החומר שהועלה קצר מדי או ריק"],
      keywordHits: [],
      coverageScore: 0
    };
  }
  
  // Extract keywords from user request
  const keywords = extractKeywords(userRequestText);
  
  if (keywords.length === 0) {
    // If no keywords extracted, consider it thin if material is short
    if (materialLength < 200) {
      return {
        quality: "thin",
        reasons: ["לא ניתן לזהות נושאים מרכזיים בבקשה"],
        keywordHits: [],
        coverageScore: 0.3
      };
    }
    return {
      quality: "good",
      reasons: ["חומר מספק אך לא ניתן לזהות נושאים ספציפיים"],
      keywordHits: [],
      coverageScore: 0.5
    };
  }
  
  // Calculate keyword hits
  const keywordHits = calculateKeywordHits(keywords, materialText);
  const coverageScore = calculateCoverageScore(keywordHits);
  
  // Determine quality
  const reasons: string[] = [];
  let quality: "good" | "thin" | "mismatched";
  
  if (coverageScore >= 0.6) {
    quality = "good";
    reasons.push("החומר שהועלה מכיל תוכן רלוונטי לנושא");
  } else if (coverageScore >= 0.3) {
    quality = "thin";
    reasons.push("החומר שהועלה דל או מכיל תוכן חלקי בלבד");
    const missingKeywords = keywordHits
      .filter(kh => kh.hits === 0)
      .slice(0, 3)
      .map(kh => kh.keyword);
    if (missingKeywords.length > 0) {
      reasons.push(`חסרים נושאים מרכזיים: ${missingKeywords.join(', ')}`);
    }
  } else {
    quality = "mismatched";
    reasons.push("החומר שהועלה לא תואם לנושא המבוקש");
    const missingKeywords = keywordHits
      .filter(kh => kh.hits === 0)
      .slice(0, 5)
      .map(kh => kh.keyword);
    if (missingKeywords.length > 0) {
      reasons.push(`נושאים מרכזיים חסרים: ${missingKeywords.join(', ')}`);
    }
  }
  
  return {
    quality,
    reasons,
    keywordHits,
    coverageScore
  };
}

