/**
 * Tip Implementation Engine
 * 
 * Ensures that every selected pedagogical tip is implemented with:
 * - Dedicated "יישום הטיפ" subsections
 * - Concrete deliverables (artifacts)
 * - For AI comparison tip: explicit Prompt A + Prompt B
 */

export type AiMode = 'optional' | 'required' | 'comparison' | 'reflection';

export interface TipImplementationSpec {
  id?: string;
  titleMatchers: string[]; // Strings to match tip titles if id missing
  requiredSubsections: string[]; // Headings that MUST appear in studentInstructionsHtml
  requiredDeliverables: string[]; // Bullet items that MUST appear
  promptArtifacts?: { label: string; promptTemplate: string }[]; // For AI comparison, etc.
  rubricCriteriaHints?: string[]; // Optional hints for rubric criteria wording
  involvesAI?: boolean; // Explicit flag for AI involvement (optional, supports gradual migration)
  aiMode?: AiMode; // AI integration mode: optional, required, comparison, reflection
  aiTools?: string[]; // List of AI tools to use (e.g., ['ChatGPT', 'Claude'])
}

/**
 * Tip specifications - single source of truth for all tips
 */
const TIP_SPECS: TipImplementationSpec[] = [
  {
    id: 'am_13',
    titleMatchers: ['רפלקציה', 'רפלקציה על שימוש ב-AI', 'Reflective Writing', 'מטלות רפלקציה'],
    requiredSubsections: [
      'יישום הטיפ: רפלקציה על שימוש ב-AI',
      'תיעוד השיח עם ה-AI',
      'רפלקציה מעמיקה'
    ],
    requiredDeliverables: [
      'יומן שיח מלא עם ה-AI (צילומי מסך או transcript)',
      'רפלקציה כתובה (300+ מילים) על התובנות והחסרונות',
      'ניתוח ביקורתי של בחירות ה-AI'
    ],
    rubricCriteriaHints: ['רפלקציה על AI', 'איכות הניתוח הביקורתי', 'תיעוד השיח'],
    involvesAI: true,
    aiMode: 'reflection',
    aiTools: ['ChatGPT']
  },
  {
    id: 'ai_comparison',
    titleMatchers: ['השוואה וניתוח ביקורתי', 'AI השוואה', 'comparison', 'ביקורתי של תוצרי AI'],
    requiredSubsections: [
      'יישום הטיפ: השוואה וניתוח ביקורתי של תוצרי AI',
      'השוואת תוצרי AI',
      'ניתוח ביקורתי'
    ],
    requiredDeliverables: [
      'תוצר מ-Prompt A (כלי AI ראשון)',
      'תוצר מ-Prompt B (כלי AI שני)',
      'טבלת השוואה מפורטת',
      'ניתוח ביקורתי של ההבדלים והטיות'
    ],
    promptArtifacts: [
      {
        label: 'Prompt A',
        promptTemplate: 'הזן את הנושא שלך כאן. בנה שאילתה מפורטת שתבקש מה-AI לנתח/להסביר/לבצע: [נושא המטלה]'
      },
      {
        label: 'Prompt B',
        promptTemplate: 'הזן את אותו הנושא לכלי AI שונה. השתמש בשאילתה דומה אך עם שינוי קל (למשל: הוסף הקשר נוסף או בקש גישה שונה): [נושא המטלה]'
      }
    ],
    rubricCriteriaHints: ['השוואה בין תוצרים', 'ניתוח ביקורתי', 'זיהוי הטיות', 'איכות השאילתות'],
    involvesAI: true,
    aiMode: 'comparison',
    aiTools: ['ChatGPT', 'Claude']
  },
  {
    id: 'peer_review',
    titleMatchers: ['הערכת עמיתים', 'peer review', 'ביקורת עמיתים'],
    requiredSubsections: [
      'יישום הטיפ: הערכת עמיתים',
      'תהליך הערכת עמיתים',
      'משוב בונה'
    ],
    requiredDeliverables: [
      'טופס הערכת עמיתים ממולא',
      'משוב כתוב מפורט לכל קריטריון',
      'תיעוד תהליך ההערכה'
    ],
    rubricCriteriaHints: ['איכות הערכת עמיתים', 'מקצועיות המשוב', 'הקפדה על קריטריונים']
  },
  {
    id: 'group_work',
    titleMatchers: ['עבודה קבוצתית', 'עבודה בקבוצות', 'group work', 'collaboration'],
    requiredSubsections: [
      'יישום הטיפ: עבודה קבוצתית',
      'ארגון הקבוצה',
      'חלוקת תפקידים'
    ],
    requiredDeliverables: [
      'תיעוד חלוקת התפקידים והאחריות',
      'לוח זמנים קבוצתי',
      'רפלקציה על תהליך העבודה הקבוצתית'
    ],
    rubricCriteriaHints: ['שיתוף פעולה', 'יעילות העבודה הקבוצתית', 'חלוקה הוגנת']
  }
];

/**
 * Get tip spec by title or id
 */
function getTipSpec(tip: { id?: string; title: string }): TipImplementationSpec | null {
  // Try by id first
  if (tip.id) {
    const byId = TIP_SPECS.find(spec => spec.id === tip.id);
    if (byId) return byId;
  }

  // Try by title matchers
  const titleLower = tip.title.toLowerCase();
  for (const spec of TIP_SPECS) {
    if (spec.titleMatchers.some(matcher => titleLower.includes(matcher.toLowerCase()))) {
      return spec;
    }
  }

  return null;
}

/**
 * Build AI mode-specific addon block for prompt
 */
export function buildAiModeAddon(
  spec: TipImplementationSpec,
  context: { topic?: string; course?: string }
): string {
  if (!spec.aiMode) {
    return '';
  }

  const topic = context.topic || context.course || 'הנושא של המטלה';
  const tools = spec.aiTools || ['ChatGPT', 'Claude'];

  switch (spec.aiMode) {
    case 'reflection': {
      return `
**הוראות שילוב AI - רפלקציה:**

המטלה כוללת שימוש בכלי AI כחלק מתהליך הלמידה. הסטודנטים נדרשים:

1. **תיעוד השימוש ב-AI:**
   - צילומי מסך או transcript מלא של כל השיחות עם כלי ה-AI
   - תיעוד הפרומפטים ששימשו והתשובות שהתקבלו
   - ציון תאריכים ושעות השימוש

2. **רפלקציה מעמיקה (300+ מילים) הכוללת:**
   - מה למדתי מהשימוש בכלי ה-AI?
   - אילו תובנות חדשות קיבלתי על הנושא?
   - מה היו המגבלות והחסרונות של התשובות שקיבלתי?
   - איך השימוש ב-AI שינה את הבנתי את ${topic}?
   - מה הייתי עושה אחרת בפעם הבאה?

3. **ניתוח ביקורתי:**
   - זיהוי נקודות חוזק וחולשה בתשובות ה-AI
   - הערכת אמינות ודיוק המידע שקיבלתי
   - השוואה בין מה שלמדתי מה-AI לבין מה שלמדתי מהקורס

**דרישות הגשה:**
- יומן שיח מלא עם ה-AI (צילומי מסך או transcript)
- רפלקציה כתובה (מינימום 300 מילים)
- ניתוח ביקורתי של בחירות ה-AI והתשובות שקיבלת`;
    }

    case 'comparison': {
      const tool1 = tools[0] || 'ChatGPT';
      const tool2 = tools[1] || 'Claude';
      
      return `
**הוראות שילוב AI - השוואה בין כלים:**

המטלה כוללת השוואה בין שני כלי AI שונים. הסטודנטים נדרשים:

1. **יצירת שני פרומפטים:**

   **Prompt A (${tool1}):**
   בנה שאילתה מפורטת שתבקש מ-${tool1} לנתח/להסביר/לבצע: ${topic}
   
   דוגמה לפרומפט:
   "אני לומד/ת על ${topic}. אנא הסבר/י את המושגים המרכזיים, ספק/י דוגמאות רלוונטיות, וציין/י את המגבלות או נקודות חשובות שיש לקחת בחשבון."

   **Prompt B (${tool2}):**
   בנה שאילתה דומה אך עם שינוי קל (למשל: הוסף הקשר נוסף או בקש גישה שונה) עבור ${tool2}:
   ${topic}
   
   דוגמה לפרומפט:
   "אני לומד/ת על ${topic} כחלק מקורס אקדמי. אנא ספק/י ניתוח מעמיק הכולל: (1) הגדרות מדויקות, (2) הקשר היסטורי/תיאורטי, (3) דוגמאות מהשדה, (4) ביקורת על הגישה, (5) השוואה לגישות חלופיות."

2. **הרצת שני הפרומפטים והשוואה:**

   הסטודנטים חייבים להריץ את שני ה-prompts בכלי AI שונים ולהשוות את התוצאות.

3. **טבלת השוואה מפורטת** הכוללת:
   - דיוק: איזו תשובה הייתה מדויקת יותר?
   - עומק: איזו תשובה הייתה מעמיקה יותר?
   - הטיות: אילו הטיות זיהית בכל תשובה?
   - ציטוטים: איזו תשובה כללה ציטוטים ומקורות טובים יותר?
   - בחירה סופית: איזו תשובה הייתה טובה יותר ולמה?

4. **ניתוח ביקורתי של ההבדלים:**
   - מה היו ההבדלים המרכזיים בין התשובות?
   - מה הסיבות להבדלים אלה?
   - איך זה משפיע על השימוש בכלי AI בעתיד?

**דרישות הגשה:**
- תוצר מ-Prompt A (${tool1}) - צילום מסך או העתקה של התשובה המלאה
- תוצר מ-Prompt B (${tool2}) - צילום מסך או העתקה של התשובה המלאה
- טבלת השוואה מפורטת עם כל הקריטריונים לעיל
- ניתוח ביקורתי של ההבדלים והטיות (200+ מילים)`;
    }

    case 'required': {
      return `
**הוראות שילוב AI - חובה:**

השימוש בכלי AI הוא **חובה** במטלה זו. הסטודנטים נדרשים:

1. **שימוש בכלי AI** כחלק אינטגרלי מהמטלה
2. **תיעוד מלא** של השימוש (צילומי מסך או transcript)
3. **ציון מפורש** של איך השתמשו ב-AI ומה למדו ממנו

**דרישות הגשה:**
- עדות לשימוש ב-AI (צילומי מסך או transcript)
- הסבר על איך השתמשת ב-AI במטלה
- ניתוח של התרומה של ה-AI לתהליך הלמידה`;
    }

    case 'optional': {
      return `
**הוראות שילוב AI - אופציונלי:**

הסטודנטים יכולים להשתמש בכלי AI כסיוע במטלה, אך יש לקחת בחשבון:

1. **שימוש זהיר:**
   - וודא/י שהמידע שקיבלת מה-AI נכון ומדויק
   - אל תעתיק ישירות - השתמש ב-AI ככלי עזר לחשיבה, לא כתחליף לחשיבה עצמאית
   - ציין/י אם השתמשת ב-AI ובאיזה הקשר

2. **מה להיזהר:**
   - AI יכול לטעות - תמיד בדוק/י את העובדות
   - AI יכול להמציא מקורות - אל תסמוך/י על ציטוטים ללא בדיקה
   - AI לא מבין הקשר - התאם/י את התשובות להקשר הספציפי של המטלה

3. **אם בחרת להשתמש ב-AI:**
   - ציין/י זאת במפורש במטלה
   - הסבר/י איך השתמשת ב-AI
   - צרף/י צילומי מסך או transcript של השימוש

**חשוב:** שימוש ב-AI הוא אופציונלי. המטלה יכולה להיעשות גם ללא שימוש ב-AI.`;
    }

    default:
      return '';
  }
}

/**
 * Build enforcement prompt for selected tips
 */
export function buildTipEnforcementPrompt(
  selectedTips: Array<{ id?: string; title: string; description?: string }>,
  topic: string
): string {
  if (selectedTips.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push('\n**דרישות חובה - יישום טיפים פדגוגיים (NON-NEGOTIABLE):**\n');

  selectedTips.forEach((tip, index) => {
    const spec = getTipSpec(tip);
    
    if (spec) {
      // Specific tip spec
      sections.push(`\n**טיפ ${index + 1}: ${tip.title}**`);
      sections.push(`\nחובה לכלול במטלה:`);
      sections.push(`1. סעיף "יישום הטיפ: ${tip.title}" עם הוראות מפורטות ופעילותיות`);
      
      if (spec.requiredSubsections.length > 0) {
        sections.push(`2. תת-סעיפים הבאים (כל אחד ככותרת h3 או h4):`);
        spec.requiredSubsections.forEach(sub => {
          sections.push(`   - ${sub}`);
        });
      }

      sections.push(`3. רשימת "מה צריך להגיש" הכוללת:`);
      spec.requiredDeliverables.forEach(deliverable => {
        sections.push(`   - ${deliverable}`);
      });

      // Special handling for AI comparison tip
      if (spec.promptArtifacts && spec.promptArtifacts.length > 0) {
        sections.push(`\n4. **חובה מוחלטת - יצירת שני prompts מפורשים:**`);
        spec.promptArtifacts.forEach((artifact) => {
          sections.push(`   - ${artifact.label}: ${artifact.promptTemplate}`);
        });
        sections.push(`   הסטודנטים חייבים להריץ את שני ה-prompts בכלי AI שונים ולהשוות את התוצאות.`);
        sections.push(`   המטלה חייבת לכלול טבלת השוואה וניתוח ביקורתי של ההבדלים.`);
      }
    } else {
      // Default spec for unknown tips
      sections.push(`\n**טיפ ${index + 1}: ${tip.title}**`);
      sections.push(`\nחובה לכלול במטלה:`);
      sections.push(`1. סעיף "יישום הטיפ: ${tip.title}" עם הוראות מפורטות`);
      sections.push(`2. רשימת "מה צריך להגיש" עם לפחות פריט אחד קונקרטי הקשור לטיפ זה`);
      sections.push(`3. הוראות פעילותיות (לא רק אזכור כללי) שמסבירות איך ליישם את הטיפ במסגרת המטלה`);
    }
  });

  sections.push(`\n**חשוב מאוד:**`);
  sections.push(`- כל טיפ שנבחר חייב לקבל יישום קונקרטי במטלה, לא רק אזכור`);
  sections.push(`- כל טיפ חייב לכלול לפחות deliverable אחד ספציפי`);
  sections.push(`- אין להסתפק בהזכרת הטיפ - יש לשלב אותו באופן פעיל במטלה`);

  // Add section depth requirements
  sections.push(`\n**דרישות עומק חובה (NON-NEGOTIABLE):**`);
  sections.push(`- הסעיף "מטרת המשימה" חייב לכלול לפחות שני פסקאות מלאות (כל פסקה ≥3 משפטים)`);
  sections.push(`- הסעיף "תיאור המשימה והוראות" חייב לכלול לפחות שני פסקאות מלאות (כל פסקה ≥3 משפטים)`);
  sections.push(`- הסעיף "דרישות הגשה" חייב לכלול לפחות שני פסקאות מלאות (כל פסקה ≥3 משפטים)`);
  sections.push(`- אסור להשתמש בנקודות או רשימות במקום פסקאות - כל סעיף חייב להכיל פסקאות מלאות`);

  // Add AI prompt generation requirements
  const hasAiTip = selectedTips.some(tip => tipInvolvesAI(tip));
  if (hasAiTip) {
    sections.push(`\n**חובה מוחלטת - יצירת פרומפטים ל-AI:**`);
    sections.push(`- אם נבחר טיפ הקשור ל-AI, חובה לכלול סעיף: "פרומפטים לשימוש בכלי AI"`);
    sections.push(`- בתוך הסעיף, חובה לספק פרומפטים מוכנים לשימוש (לא רק הוראה "השתמשו ב-AI")`);
    sections.push(`- הפרומפטים חייבים להתייחס לנושא המטלה הספציפי ולחומרים שהועלו`);
    sections.push(`- הפרומפטים חייבים לכלול פורמט פלט צפוי (אורך, מבנה, קריטריונים)`);
    sections.push(`- אסור להשתמש בביטויים כמו "השתמשו ב-AI כדי..." ללא פרומפט מפורש`);
  }

  // Collect AI mode addons from selected tips
  const aiModeAddons: string[] = [];
  selectedTips.forEach(tip => {
    const spec = getTipSpec(tip);
    if (spec?.aiMode) {
      const addon = buildAiModeAddon(spec, { topic });
      if (addon) {
        aiModeAddons.push(addon);
      }
    }
  });

  // Append AI mode addons if any
  if (aiModeAddons.length > 0) {
    sections.push(`\n**הוראות שילוב AI (בהתבסס על הטיפים שנבחרו):**`);
    sections.push(...aiModeAddons);
  }

  return sections.join('\n');
}

/**
 * Validate that structured assignment complies with tip requirements
 */
export function validateTipCompliance(
  structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
  },
  selectedTips: Array<{ id?: string; title: string }>
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  const allText = [
    structuredAssignment.studentInstructionsHtml || '',
    (structuredAssignment.instructions || []).join(' '),
    (structuredAssignment.requirements || []).join(' ')
  ].join(' ').toLowerCase();

  selectedTips.forEach(tip => {
    const spec = getTipSpec(tip);
    const tipTitleLower = tip.title.toLowerCase();

    // Check for "יישום הטיפ" section
    if (!allText.includes('יישום הטיפ') && !allText.includes(tipTitleLower)) {
      missing.push(`Missing "יישום הטיפ" section for: ${tip.title}`);
    }

    if (spec) {
      // Check required subsections
      spec.requiredSubsections.forEach(sub => {
        if (!allText.includes(sub.toLowerCase())) {
          missing.push(`Missing subsection "${sub}" for tip: ${tip.title}`);
        }
      });

      // Check required deliverables
      const hasAnyDeliverable = spec.requiredDeliverables.some(deliverable =>
        allText.includes(deliverable.toLowerCase().substring(0, 20))
      );
      if (!hasAnyDeliverable) {
        missing.push(`Missing deliverables for tip: ${tip.title}`);
      }

      // Special check for AI comparison: must have Prompt A and Prompt B
      if (spec.promptArtifacts && spec.promptArtifacts.length > 0) {
        const hasPromptA = allText.includes('prompt a') || allText.includes('prompt א') || 
                          allText.includes('שאילתה א') || allText.includes('שאילתה ראשונה');
        const hasPromptB = allText.includes('prompt b') || allText.includes('prompt ב') ||
                          allText.includes('שאילתה ב') || allText.includes('שאילתה שנייה');
        const hasComparison = allText.includes('השוואה') || allText.includes('comparison');

        if (!hasPromptA) {
          missing.push(`Missing Prompt A for AI comparison tip: ${tip.title}`);
        }
        if (!hasPromptB) {
          missing.push(`Missing Prompt B for AI comparison tip: ${tip.title}`);
        }
        if (!hasComparison) {
          missing.push(`Missing comparison requirement for AI comparison tip: ${tip.title}`);
        }
      }
    } else {
      // Default validation for unknown tips
      if (!allText.includes(tipTitleLower)) {
        missing.push(`Tip "${tip.title}" not found in assignment content`);
      }
    }
  });

  return {
    ok: missing.length === 0,
    missing
  };
}

/**
 * Validate section depth - ensure core sections have at least 2 paragraphs with ≥3 sentences each
 */
export function validateSectionDepth(structuredAssignment: {
  studentInstructionsHtml?: string;
  instructions?: string[];
  requirements?: string[];
}): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  const html = structuredAssignment.studentInstructionsHtml || '';
  
  // Required sections to validate
  const requiredSections = [
    { heading: 'מטרת המשימה', minParagraphs: 2 },
    { heading: 'תיאור המשימה והוראות', minParagraphs: 2 },
    { heading: 'דרישות הגשה', minParagraphs: 2 }
  ];

  requiredSections.forEach(section => {
    // Find section by heading (h2, h3, h4)
    const headingRegex = new RegExp(`<h[234][^>]*>.*?${section.heading}.*?</h[234]>`, 'i');
    const headingMatch = html.match(headingRegex);
    
    if (!headingMatch) {
      failures.push(`Section "${section.heading}" not found`);
      return;
    }

    // Extract content after the heading until next heading or end
    const headingIndex = html.indexOf(headingMatch[0]);
    const afterHeading = html.substring(headingIndex + headingMatch[0].length);
    
    // Find next heading or end of document
    const nextHeadingMatch = afterHeading.match(/<h[234][^>]*>/i);
    const sectionContent = nextHeadingMatch 
      ? afterHeading.substring(0, afterHeading.indexOf(nextHeadingMatch[0]))
      : afterHeading;

    // Extract paragraphs (<p> tags)
    const paragraphMatches = sectionContent.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    
    // Count valid paragraphs (≥3 sentences each)
    let validParagraphCount = 0;
    paragraphMatches.forEach(para => {
      // Remove HTML tags to get text
      const text = para.replace(/<[^>]+>/g, '').trim();
      
      // Split by sentence terminators (. ! ?)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length >= 3) {
        validParagraphCount++;
      }
    });

    if (validParagraphCount < section.minParagraphs) {
      failures.push(
        `Section "${section.heading}" has only ${validParagraphCount} valid paragraph(s) ` +
        `(minimum ${section.minParagraphs} required, each with ≥3 sentences)`
      );
    }
  });

  return {
    ok: failures.length === 0,
    failures
  };
}

/**
 * Check if a tip involves AI usage
 */
export function tipInvolvesAI(tip: { id?: string; title: string }): boolean {
  const spec = getTipSpec(tip);

  // If we have a spec, treat it as the source of truth.
  if (spec) {
    // Prefer explicit flag if present (supports gradual migration).
    if (typeof spec.involvesAI === 'boolean') return spec.involvesAI;

    // Infer ONLY from explicit structured AI artifacts.
    if (Array.isArray(spec.promptArtifacts) && spec.promptArtifacts.length > 0) return true;

    // Legacy explicit exception (keep tiny and documented).
    if (spec.id === 'am_13') return true;

    return false;
  }

  // No spec (unknown tip): safe fallback via explicit AI keywords only.
  const title = tip.title || '';
  const t = title.toLowerCase();

  return (
    t.includes('ai') ||
    t.includes('chatgpt') ||
    t.includes('gpt') ||
    t.includes('claude') ||
    t.includes('gemini') ||
    t.includes('copilot') ||
    title.includes('בינה מלאכותית')
  );
}

/**
 * Extract tip identifier from an object, checking multiple possible property names
 * 
 * @param obj - Object that may contain tip identifier in various properties
 * @returns The first found identifier, or undefined if none found
 */
export function getTipIdentifier(obj: unknown): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const o = obj as Record<string, unknown>;
  const raw =
    o?.id ??
    o?.key ??
    o?.slug ??
    o?.methodId ??
    o?.tipId ??
    o?.specId ??
    o?.code;

  // Convert to string safely, trim whitespace, and reject empty values.
  if (raw === null || raw === undefined) return undefined;

  const s = String(raw).trim();
  return s.length > 0 ? s : undefined;
}

/**
 * Validate that AI prompts are generated when AI-based tips are selected
 */
export function validateAiPrompts(
  structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
  },
  selectedTips: Array<{ id?: string; title: string }>
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Check if any selected tip involves AI
  const aiTips = selectedTips.filter(tip => tipInvolvesAI(tip));
  
  if (aiTips.length === 0) {
    return { ok: true, missing: [] }; // No AI tips, validation passes
  }

  const allText = [
    structuredAssignment.studentInstructionsHtml || '',
    (structuredAssignment.instructions || []).join(' '),
    (structuredAssignment.requirements || []).join(' ')
  ].join(' ').toLowerCase();

  // Check for AI prompts section
  const hasAiPromptsSection = 
    allText.includes('פרומפטים לשימוש בכלי ai') ||
    allText.includes('פרומפטים לשימוש ב-ai') ||
    allText.includes('prompt a') ||
    allText.includes('prompt א') ||
    allText.includes('שאילתה א') ||
    allText.includes('שאילתה ראשונה');

  if (!hasAiPromptsSection) {
    missing.push('Missing "פרומפטים לשימוש בכלי AI" section');
  }

  // Check for concrete prompts (not just instructions to use AI)
  const hasGenericInstruction = 
    allText.includes('השתמשו ב-ai') ||
    allText.includes('השתמשו בai') ||
    allText.includes('use ai');
  
  const hasConcretePrompt = 
    allText.includes('prompt a:') ||
    allText.includes('prompt א:') ||
    allText.includes('שאילתה א:') ||
    allText.includes('שאילתה ראשונה:') ||
    (allText.includes('prompt a') && allText.includes('prompt b')) ||
    (allText.includes('prompt א') && allText.includes('prompt ב'));

  if (hasGenericInstruction && !hasConcretePrompt) {
    missing.push('Found generic "use AI" instruction but no concrete prompts provided');
  }

  // For AI comparison tip, must have both Prompt A and Prompt B
  const hasComparisonTip = aiTips.some(tip => {
    const spec = getTipSpec(tip);
    return spec?.promptArtifacts && spec.promptArtifacts.length > 0;
  });

  if (hasComparisonTip) {
    const hasPromptA = 
      allText.includes('prompt a') ||
      allText.includes('prompt א') ||
      allText.includes('שאילתה א') ||
      allText.includes('שאילתה ראשונה');
    
    const hasPromptB = 
      allText.includes('prompt b') ||
      allText.includes('prompt ב') ||
      allText.includes('שאילתה ב') ||
      allText.includes('שאילתה שנייה');

    if (!hasPromptA) {
      missing.push('Missing Prompt A for AI comparison tip');
    }
    if (!hasPromptB) {
      missing.push('Missing Prompt B for AI comparison tip');
    }
  }

  return {
    ok: missing.length === 0,
    missing
  };
}

/**
 * Normalize rubric HTML to use point ranges (0-7, 8-15, 16-20) instead of percentages
 */
export function normalizeRubricHtmlToPointRanges(rubricHtml: string): string {
  // Check if already has correct format
  const hasCorrectHeaders = rubricHtml.includes('ביצוע בסיסי (0–7 נקודות)') ||
                            rubricHtml.includes('ביצוע בסיסי (0-7 נקודות)');
  const hasPercentages = rubricHtml.includes('%') || 
                         rubricHtml.includes('90-100') || 
                         rubricHtml.includes('80-89') ||
                         rubricHtml.includes('70-79') ||
                         rubricHtml.includes('60-69');

  if (hasCorrectHeaders && !hasPercentages) {
    return rubricHtml; // Already correct
  }

  // Extract criteria from existing HTML if possible
  const criteria: Array<{ name: string; description: string }> = [];

  // Try to parse existing table structure
  const rows = rubricHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  rows.forEach((row, rowIdx) => {
    if (rowIdx === 0) return; // Skip header row
    
    const cells = row.match(/<t[dh][^>]*>([^<]+)<\/t[dh]>/gi) || [];
    if (cells.length >= 2 && cells[0] && cells[1]) {
      const name = cells[0].replace(/<[^>]+>/g, '').trim();
      const desc = cells[1].replace(/<[^>]+>/g, '').trim();
      if (name && desc) {
        criteria.push({ name, description: desc });
      }
    }
  });

  // If no criteria extracted, use defaults
  if (criteria.length === 0) {
    criteria.push(
      { name: 'איכות תוכן', description: 'עומק הניתוח ורמת ההבנה' },
      { name: 'מקורות ומחקר', description: 'איכות המקורות ושימוש נכון בהם' },
      { name: 'כתיבה אקדמית', description: 'רמת הכתיבה והביטוי האקדמי' }
    );
  }

  // Build new rubric HTML with point ranges
  const rubricHtmlNew = `
    <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
        מחוון הערכה (רובריקה)
      </h3>
      <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">קריטריון</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע בסיסי (0–7 נקודות)</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מתקדם (8–15 נקודות)</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מיטבי (16–20 נקודות)</th>
          </tr>
        </thead>
        <tbody>
          ${criteria.map((criterion, index) => `
            <tr style="background: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
              <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #333;">${criterion.name}</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע חלקי או לא מספק של הדרישות</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע טוב של רוב הדרישות</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע מעולה ומקיף של כל הדרישות</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 6px; color: #2e7d32;">
        <small><strong>נוצר באמצעות:</strong> מערכת ייצור מטלות | <strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</small>
      </div>
    </div>
  `;

  return rubricHtmlNew;
}

