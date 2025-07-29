import knowledgeBase from '../../../helpers/knowledgeBase.json'; // נתיב מתוקן

export interface DomainMatch {
  domain: string;
  keywords: string[];
  topics: string[];
  researchFocus: string;
  score: number; // ציון התאמה (0-100)
}

export interface AnalysisResult {
  detectedDomains: DomainMatch[];
  bestMatch: DomainMatch | null;
  specificTopics: string[];
  researchFocus: string;
}

/**
 * פונקציה דינמית לניתוח קבצים וזיהוי תחומי דעת
 */
export const analyzeUploadedFiles = (files: File[]): AnalysisResult => {
  console.log('🔍 מתחיל ניתוח דינמי של קבצים:', files.map(f => f.name));
  
  if (files.length === 0) {
    return {
      detectedDomains: [],
      bestMatch: null,
      specificTopics: [],
      researchFocus: 'ניתוח תהליכים אקדמיים מודרניים'
    };
  }

  const detectedDomains: DomainMatch[] = [];

  // בדיקת כל תחום ידע מול הקבצים המועלים
  Object.entries(knowledgeBase).forEach(([domainKey, domainData]) => {
    const matchingKeywords: string[] = [];
    let totalScore = 0;

    // עבור כל קובץ, בדוק התאמה למילות מפתח
    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      const fileContent = fileName; // אפשר להרחיב לתוכן הקובץ בעתיד
      
      domainData.keywords.forEach(keyword => {
        if (fileContent.includes(keyword.toLowerCase())) {
          matchingKeywords.push(keyword);
          totalScore += 10; // נקודות עבור כל התאמה
        }
      });
    });

    // אם נמצאו התאמות, הוסף לרשימה
    if (matchingKeywords.length > 0) {
      const score = Math.min(totalScore, 100); // מקסימום 100 נקודות
      detectedDomains.push({
        domain: domainKey,
        keywords: [...new Set(matchingKeywords)], // הסר כפילויות
        topics: domainData.topics,
        researchFocus: domainData.researchFocus,
        score
      });
    }
  });

  // מיון לפי ציון התאמה (הגבוה ביותר ראשון)
  detectedDomains.sort((a, b) => b.score - a.score);

  const bestMatch = detectedDomains.length > 0 ? detectedDomains[0] : null;
  
  // יצירת רשימת נושאים ספציפיים
  const specificTopics: string[] = [];
  detectedDomains.forEach(domain => {
    specificTopics.push(...domain.topics.slice(0, 3)); // 3 נושאים עיקריים מכל תחום
  });

  // בחירת מיקוד מחקר
  const researchFocus = bestMatch 
    ? bestMatch.researchFocus 
    : 'ניתוח תהליכים אקדמיים מתקדמים';

  console.log('📊 תוצאות ניתוח:', {
    detectedDomainsCount: detectedDomains.length,
    bestMatchDomain: bestMatch?.domain,
    bestMatchScore: bestMatch?.score,
    specificTopicsCount: specificTopics.length
  });

  return {
    detectedDomains,
    bestMatch,
    specificTopics: [...new Set(specificTopics)], // הסר כפילויות
    researchFocus
  };
};

/**
 * פונקציה לניתוח שם קורס כשאין קבצים
 */
export const analyzeCourseName = (courseName: string, faculty?: string, department?: string): AnalysisResult => {
  console.log('🔍 מנתח שם קורס:', { courseName, faculty, department });
  
  const searchText = `${courseName} ${faculty} ${department}`.toLowerCase();
  const detectedDomains: DomainMatch[] = [];

  Object.entries(knowledgeBase).forEach(([domainKey, domainData]) => {
    const matchingKeywords: string[] = [];
    let totalScore = 0;

    domainData.keywords.forEach(keyword => {
      if (searchText.includes(keyword.toLowerCase())) {
        matchingKeywords.push(keyword);
        totalScore += 15; // ניקוד גבוה יותר לניתוח שם קורס
      }
    });

    if (matchingKeywords.length > 0) {
      const score = Math.min(totalScore, 100);
      detectedDomains.push({
        domain: domainKey,
        keywords: [...new Set(matchingKeywords)],
        topics: domainData.topics,
        researchFocus: domainData.researchFocus,
        score
      });
    }
  });

  detectedDomains.sort((a, b) => b.score - a.score);
  const bestMatch = detectedDomains.length > 0 ? detectedDomains[0] : null;

  const specificTopics: string[] = [];
  if (bestMatch) {
    specificTopics.push(...bestMatch.topics.slice(0, 4)); // יותר נושאים לקורס מזוהה
  }

  const researchFocus = bestMatch 
    ? bestMatch.researchFocus 
    : `ניתוח מעמיק של נושאים מתקדמים ב${courseName}`;

  return {
    detectedDomains,
    bestMatch,
    specificTopics,
    researchFocus
  };
};

/**
 * פונקציה משולבת - ניתוח קבצים או שם קורס
 */
export const performDynamicAnalysis = (
  files: File[], 
  courseName?: string, 
  faculty?: string, 
  department?: string
): AnalysisResult => {
  // אם יש קבצים - נתח אותם
  if (files.length > 0) {
    return analyzeUploadedFiles(files);
  }
  
  // אחרת - נתח שם קורס
  if (courseName) {
    return analyzeCourseName(courseName, faculty, department);
  }

  // אם אין מידע כלל - החזר ברירת מחדל
  return {
    detectedDomains: [],
    bestMatch: null,
    specificTopics: [],
    researchFocus: 'ניתוח נושאים אקדמיים מתקדמים'
  };
}; 