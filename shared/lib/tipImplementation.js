"use strict";
/**
 * Tip Implementation Engine
 *
 * Ensures that every selected pedagogical tip is implemented with:
 * - Dedicated "יישום הטיפ" subsections
 * - Concrete deliverables (artifacts)
 * - For AI comparison tip: explicit Prompt A + Prompt B
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRubricHtmlToPointRanges = exports.validateAiPrompts = exports.getTipIdentifier = exports.tipInvolvesAI = exports.validateSectionDepth = exports.validateExternalKnowledgeApplication = exports.validateAm03Assignment = exports.validateTipImplementationRequirements = exports.validateTipCompliance = exports.buildTipEnforcementPrompt = exports.buildAiModeAddon = exports.getTipSpec = void 0;
/**
 * Tip specifications - single source of truth for all tips
 */
const TIP_SPECS = [
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
    },
    {
        id: 'am_03',
        titleMatchers: ['ניתוח מונחה של פרומפטים', 'Guided AI Prompt Analysis', 'Critical Reflection on AI'],
        requiredSubsections: [
            'יישום הטיפ: ניתוח מונחה של פרומפטים',
            'פרומפט AI',
            'סיכום ניתוח AI',
            'רפלקציה ביקורתית על ניתוח ה-AI'
        ],
        requiredDeliverables: [
            'פרומפט AI מוכן לשימוש',
            'סיכום תמציתי של ניתוח ה-AI',
            'רפלקציה ביקורתית כתובה (400+ מילים) על ניתוח ה-AI'
        ],
        rubricCriteriaHints: [
            'הבנת המסגרת התיאורטית',
            'איכות הערכת ניתוח ה-AI',
            'עומק ההנמקה הרפלקטיבית'
        ],
        involvesAI: true,
        aiMode: 'reflection',
        aiTools: ['ChatGPT', 'Claude'],
        contract: {
            requiredSections: [
                'פרומפט AI',
                'סיכום ניתוח AI',
                'רפלקציה ביקורתית על ניתוח ה-AI'
            ],
            prohibitedPatterns: [
                'ניתוח עצמאי של סטודנט שאינו קשור במפורש לתוצר ה-AI',
                'ניתוח מקביל ללא היררכיה'
            ],
            requiredRubricCriteria: [
                'הבנת המסגרת התיאורטית',
                'איכות הערכת ניתוח ה-AI',
                'עומק ההנמקה הרפלקטיבית'
            ],
            intent: 'הסטודנט אינו מתחרה עם ה-AI. הסטודנט מעריך, מבקר ומשפר את ההנמקה של ה-AI.'
        }
    }
];
/**
 * Get tip spec by title or id
 */
function getTipSpec(tip) {
    // Try by id first
    if (tip.id) {
        const byId = TIP_SPECS.find(spec => spec.id === tip.id);
        if (byId)
            return byId;
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
exports.getTipSpec = getTipSpec;
/**
 * Build AI mode-specific addon block for prompt
 */
function buildAiModeAddon(spec, context) {
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

1. **תיעוד השימוש ב-AI (קל ומהיר - לא transcript מלא):**
   - 2 צילומי מסך של שיחות עם כלי ה-AI
   - העתקה של 2 פרומפטים מרכזיים ששימשו
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

**דרישות הגשה (חובה):**
- 2 צילומי מסך + העתקה של 2 פרומפטים מרכזיים
- רפלקציה כתובה (מינימום 300 מילים)
- ניתוח ביקורתי של בחירות ה-AI והתשובות שקיבלת`;
        }
        case 'comparison': {
            const tool1 = tools[0] || 'ChatGPT';
            const tool2 = tools[1] || 'Claude';
            return `
**הוראות שילוב AI - השוואה בין כלים:**

המטלה כוללת השוואה בין שני כלי AI שונים. הסטודנטים נדרשים:

1. **יצירת שני פרומפטים מפורשים (חובה):**

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

3. **טבלת השוואה מפורטת (חובה)** הכוללת:
   - דיוק: איזו תשובה הייתה מדויקת יותר?
   - עומק: איזו תשובה הייתה מעמיקה יותר?
   - הטיות: אילו הטיות זיהית בכל תשובה?
   - ציטוטים: איזו תשובה כללה ציטוטים ומקורות טובים יותר?
   - בחירה סופית: איזו תשובה הייתה טובה יותר ולמה?

4. **ניתוח ביקורתי של ההבדלים:**
   - מה היו ההבדלים המרכזיים בין התשובות?
   - מה הסיבות להבדלים אלה?
   - איך זה משפיע על השימוש בכלי AI בעתיד?

5. **פסקת החלטה סופית (חובה):**
   - פסקה אחת (100+ מילים) המסבירה איזו תשובה הייתה טובה יותר ולמה
   - כוללת נימוק מפורט המבוסס על הטבלה

**דרישות הגשה (חובה):**
- תוצר מ-Prompt A (${tool1}) - צילום מסך או העתקה של התשובה המלאה
- תוצר מ-Prompt B (${tool2}) - צילום מסך או העתקה של התשובה המלאה
- טבלת השוואה מפורטת עם כל הקריטריונים לעיל
- ניתוח ביקורתי של ההבדלים והטיות (200+ מילים)
- פסקת החלטה סופית (100+ מילים)`;
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
exports.buildAiModeAddon = buildAiModeAddon;
/**
 * Build enforcement prompt for selected tips
 * Returns both the prompt and AI mode addons separately for debugging
 */
function buildTipEnforcementPrompt(selectedTips, topic) {
    if (selectedTips.length === 0) {
        return { prompt: '', aiModeAddons: '' };
    }
    const sections = [];
    sections.push('\n**דרישות חובה - יישום טיפים פדגוגיים (NON-NEGOTIABLE):**\n');
    selectedTips.forEach((tip, index) => {
        const spec = getTipSpec(tip);
        const tipId = getTipIdentifier(tip) || `tip_${index + 1}`;
        // Build strict Implementation Block for each tip
        sections.push(`\n## Tip Implementation: ${tip.title} (id: ${tipId})`);
        if (spec) {
            // A) Steps (must be included in final assignment)
            sections.push(`\nA) Steps (must be included in final assignment):`);
            if (spec.requiredSubsections.length > 0) {
                spec.requiredSubsections.forEach((sub, idx) => {
                    sections.push(`   ${idx + 1}. ${sub}`);
                });
            }
            else {
                sections.push(`   1. Create a dedicated section "יישום הטיפ: ${tip.title}"`);
                sections.push(`   2. Provide detailed, actionable instructions for implementing this tip`);
                sections.push(`   3. Integrate the tip into the assignment workflow`);
            }
            // B) Required deliverables (must appear in "What to submit")
            sections.push(`\nB) Required deliverables (must appear in "What to submit"):`);
            spec.requiredDeliverables.forEach((deliverable, idx) => {
                // Extract format/length hints if present
                sections.push(`   - Deliverable ${idx + 1}: ${deliverable}`);
            });
            // C) Assessment criteria (must be included in rubric)
            sections.push(`\nC) Assessment criteria (must be included in rubric):`);
            if (spec.rubricCriteriaHints && spec.rubricCriteriaHints.length > 0) {
                spec.rubricCriteriaHints.forEach((hint, idx) => {
                    sections.push(`   - Criterion ${idx + 1}: ${hint} (0–10 scoring range description)`);
                });
            }
            else {
                sections.push(`   - Criterion 1: Quality of ${tip.title} implementation (0–10 scoring range description)`);
                sections.push(`   - Criterion 2: Depth and completeness of ${tip.title} application (0–10 scoring range description)`);
            }
            // D) Checklist (must be included as bullets)
            sections.push(`\nD) Checklist (must be included as bullets):`);
            sections.push(`   - [ ] Students must complete all steps listed in section A`);
            sections.push(`   - [ ] Students must submit all deliverables listed in section B`);
            sections.push(`   - [ ] Students must meet all criteria listed in section C`);
            // Special handling for AI comparison tip
            if (spec.promptArtifacts && spec.promptArtifacts.length > 0) {
                sections.push(`   - [ ] Students must create and use Prompt A: ${spec.promptArtifacts[0]?.promptTemplate || 'First AI prompt'}`);
                if (spec.promptArtifacts[1]) {
                    sections.push(`   - [ ] Students must create and use Prompt B: ${spec.promptArtifacts[1]?.promptTemplate || 'Second AI prompt'}`);
                }
                sections.push(`   - [ ] Students must create a comparison table`);
                sections.push(`   - [ ] Students must write a final decision paragraph`);
            }
            // HARD implementation block for am_03 (Guided AI Prompt Analysis with Critical Reflection)
            if (spec.id === 'am_03' && spec.contract) {
                sections.push(`\n**⚠️ CRITICAL PEDAGOGICAL CONTRACT FOR am_03 (NON-NEGOTIABLE):**`);
                sections.push(`\nThe generated assignment MUST include:`);
                sections.push(`\nA) Mandatory section titled exactly:`);
                sections.push(`   "רפלקציה ביקורתית על ניתוח ה-AI"`);
                sections.push(`\nB) Explicit instructions stating:`);
                sections.push(`   - The AI-generated analysis is NOT authoritative.`);
                sections.push(`   - The student must identify:`);
                sections.push(`     • what the AI did well,`);
                sections.push(`     • what was superficial,`);
                sections.push(`     • what was missing,`);
                sections.push(`     • where the AI misunderstood or oversimplified the theory.`);
                sections.push(`   - The student must explain how the analysis should be improved`);
                sections.push(`     to meet academic standards.`);
                sections.push(`\nC) Prohibit:`);
                sections.push(`   - Parallel "independent analysis" sections that are not framed`);
                sections.push(`     as a response to the AI analysis.`);
                sections.push(`   - Student analysis that does not explicitly reference and critique`);
                sections.push(`     the AI's output.`);
                sections.push(`\nD) Rubric enforcement:`);
                sections.push(`   - Rubric MUST be tabular.`);
                sections.push(`   - Each criterion MUST include content-specific descriptions.`);
                sections.push(`   - Generic labels like "Quality of content" WITHOUT explanation are INVALID.`);
                sections.push(`   - Required rubric criteria examples:`);
                sections.push(`     • "יישום [תיאוריה X] בהערכת ניתוח ה-AI"`);
                sections.push(`     • "זיהוי פערים מושגיים או פשטות יתר בתוצר ה-AI"`);
                sections.push(`     • "עומק ועקביות ההנמקה הרפלקטיבית"`);
                sections.push(`   - Each level (Excellent / Good / Basic / Weak) MUST describe:`);
                sections.push(`     • what the student actually demonstrates,`);
                sections.push(`     • in relation to the specific theory and case.`);
                sections.push(`\n**Intent:** ${spec.contract.intent}`);
            }
        }
        else {
            // Default spec for unknown tips
            sections.push(`\nA) Steps (must be included in final assignment):`);
            sections.push(`   1. Create a dedicated section "יישום הטיפ: ${tip.title}"`);
            sections.push(`   2. Provide detailed, actionable instructions`);
            sections.push(`   3. Integrate the tip into the assignment workflow`);
            sections.push(`\nB) Required deliverables (must appear in "What to submit"):`);
            sections.push(`   - Deliverable 1: Concrete artifact related to ${tip.title} (format, length)`);
            sections.push(`\nC) Assessment criteria (must be included in rubric):`);
            sections.push(`   - Criterion 1: Quality of ${tip.title} implementation (0–10 scoring range description)`);
            sections.push(`\nD) Checklist (must be included as bullets):`);
            sections.push(`   - [ ] Students must complete all implementation steps`);
            sections.push(`   - [ ] Students must submit required deliverables`);
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
    // Collect AI mode addons from selected tips (separate from main prompt)
    const aiModeAddons = [];
    selectedTips.forEach(tip => {
        const spec = getTipSpec(tip);
        if (spec?.aiMode) {
            const addon = buildAiModeAddon(spec, { topic });
            if (addon) {
                aiModeAddons.push(addon);
            }
        }
    });
    const aiModeAddonsText = aiModeAddons.length > 0
        ? `\n**הוראות שילוב AI (בהתבסס על הטיפים שנבחרו):**\n${aiModeAddons.join('\n\n')}`
        : '';
    // Append AI mode addons to main prompt
    if (aiModeAddonsText) {
        sections.push(aiModeAddonsText);
    }
    return {
        prompt: sections.join('\n'),
        aiModeAddons: aiModeAddonsText
    };
}
exports.buildTipEnforcementPrompt = buildTipEnforcementPrompt;
/**
 * Validate that structured assignment complies with tip requirements
 */
function validateTipCompliance(structuredAssignment, selectedTips) {
    const missing = [];
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
            const hasAnyDeliverable = spec.requiredDeliverables.some(deliverable => allText.includes(deliverable.toLowerCase().substring(0, 20)));
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
        }
        else {
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
exports.validateTipCompliance = validateTipCompliance;
/**
 * Validate tip implementation requirements - stricter validation for post-generation
 * Checks for specific AI mode requirements (reflection, comparison)
 */
function validateTipImplementationRequirements(structuredAssignment, selectedTips) {
    const missing = [];
    const allText = [
        structuredAssignment.studentInstructionsHtml || '',
        (structuredAssignment.instructions || []).join(' '),
        (structuredAssignment.requirements || []).join(' ')
    ].join(' ').toLowerCase();
    // Check rubric has point ranges (0-10 or 0-5) instead of percentages
    const rubricText = structuredAssignment.rubricHtml || '';
    const hasPointRanges = rubricText.includes('0–10') ||
        rubricText.includes('0-10') ||
        rubricText.includes('0–7') ||
        rubricText.includes('0-7') ||
        rubricText.includes('0–5') ||
        rubricText.includes('0-5');
    if (!hasPointRanges && rubricText.length > 0) {
        // Check if it has percentages to provide better error message
        const hasPercentages = rubricText.includes('%') ||
            rubricText.includes('90-100') ||
            rubricText.includes('80-89') ||
            rubricText.includes('70-79');
        missing.push(`Rubric must use point ranges (0–10 or 0–5) instead of ${hasPercentages ? 'percentages' : 'current format'}`);
    }
    // Check for generic rubric criteria (איכות תוכן without content-specific descriptors)
    const genericCriteriaPatterns = [
        /איכות תוכן[^<]*<\/t[dh]>/i,
        /quality of content[^<]*<\/t[dh]>/i,
        /איכות הכתיבה[^<]*<\/t[dh]>/i,
        /quality of writing[^<]*<\/t[dh]>/i
    ];
    // Check if rubric contains generic criteria without specific descriptors
    const hasGenericCriteria = genericCriteriaPatterns.some(pattern => {
        const match = rubricText.match(pattern);
        if (match) {
            // Check if the next cell(s) contain only generic descriptions (numeric ranges without "what student demonstrates")
            const criterionIndex = rubricText.indexOf(match[0]);
            const afterCriterion = rubricText.substring(criterionIndex + match[0].length, criterionIndex + 500);
            // Check if levels only contain numeric ranges without content-specific descriptions
            const hasOnlyNumericLevels = /(0[–-]\d+|90[–-]100|80[–-]89|70[–-]79)/i.test(afterCriterion) &&
                !/(מיישם|מציג|מנתח|מסביר|מדגים|demonstrates|applies|analyzes|explains|shows)/i.test(afterCriterion);
            return hasOnlyNumericLevels;
        }
        return false;
    });
    if (hasGenericCriteria) {
        missing.push(`Rubric contains generic criteria ("איכות תוכן" or "Quality of content") without content-specific descriptors. Each criterion must describe what the student demonstrates, not just numeric ranges.`);
    }
    // Check rubric levels have content-specific descriptions (not just numeric ranges)
    const rubricLevelCells = rubricText.match(/<t[dh][^>]*>([^<]+)<\/t[dh]>/gi) || [];
    const hasOnlyNumericLevels = rubricLevelCells.some(cell => {
        const cellText = cell.replace(/<[^>]+>/g, '').trim();
        // Check if cell contains only numeric ranges without descriptive text
        return /^(0[–-]\d+|90[–-]100|80[–-]89|70[–-]79|ביצוע|performance|excellent|good|basic|weak)[\s]*$/i.test(cellText) &&
            !/(מיישם|מציג|מנתח|מסביר|מדגים|demonstrates|applies|analyzes|explains|shows|מה|what|how)/i.test(cellText);
    });
    if (hasOnlyNumericLevels && rubricText.length > 0) {
        missing.push(`Rubric levels contain only numeric ranges without descriptions of what the student demonstrates. Each level must describe specific performance indicators.`);
    }
    selectedTips.forEach(tip => {
        const spec = getTipSpec(tip);
        if (spec?.aiMode === 'reflection') {
            // Must contain AI Reflection section + required deliverables
            const hasReflectionSection = allText.includes('רפלקציה') ||
                allText.includes('reflection') ||
                allText.includes('ai reflection');
            const hasRequiredDeliverables = (allText.includes('צילום') || allText.includes('screenshot')) &&
                (allText.includes('פרומפט') || allText.includes('prompt')) &&
                (allText.includes('רפלקציה') || allText.includes('reflection'));
            if (!hasReflectionSection) {
                missing.push(`Missing "AI Reflection" section for tip: ${tip.title}`);
            }
            if (!hasRequiredDeliverables) {
                missing.push(`Missing required deliverables for reflection tip: 2 screenshots + 2 prompts + reflection`);
            }
        }
        if (spec?.aiMode === 'comparison') {
            // Must contain Prompt A, Prompt B, Comparison Table, Final Choice
            const hasPromptA = allText.includes('prompt a') ||
                allText.includes('prompt א') ||
                allText.includes('שאילתה א') ||
                allText.includes('שאילתה ראשונה');
            const hasPromptB = allText.includes('prompt b') ||
                allText.includes('prompt ב') ||
                allText.includes('שאילתה ב') ||
                allText.includes('שאילתה שנייה');
            const hasComparisonTable = allText.includes('טבלת השוואה') ||
                allText.includes('comparison table') ||
                allText.includes('השוואה');
            const hasFinalChoice = allText.includes('החלטה סופית') ||
                allText.includes('final decision') ||
                allText.includes('בחירה סופית') ||
                (allText.includes('פסקה') && allText.includes('החלטה'));
            if (!hasPromptA) {
                missing.push(`Missing Prompt A for comparison tip: ${tip.title}`);
            }
            if (!hasPromptB) {
                missing.push(`Missing Prompt B for comparison tip: ${tip.title}`);
            }
            if (!hasComparisonTable) {
                missing.push(`Missing comparison table for comparison tip: ${tip.title}`);
            }
            if (!hasFinalChoice) {
                missing.push(`Missing final decision paragraph for comparison tip: ${tip.title}`);
            }
        }
    });
    return {
        ok: missing.length === 0,
        missing
    };
}
exports.validateTipImplementationRequirements = validateTipImplementationRequirements;
/**
 * Validate am_03 assignment - enforce strict pedagogical contract
 * The assignment is INVALID if:
 * - No section titled "רפלקציה ביקורתית על ניתוח ה-AI" exists
 * - The reflection does not explicitly reference the AI's analysis
 * - The assignment contains two unrelated analyses (AI + student) without hierarchy
 * - The rubric does NOT contain a criterion evaluating the student's critique of AI
 */
function validateAm03Assignment(structuredAssignment) {
    const missing = [];
    const allText = [
        structuredAssignment.studentInstructionsHtml || '',
        (structuredAssignment.instructions || []).join(' '),
        (structuredAssignment.requirements || []).join(' ')
    ].join(' ').toLowerCase();
    const rubricText = (structuredAssignment.rubricHtml || '').toLowerCase();
    // Check 1: Must have critical reflection section
    const criticalReflectionSectionPatterns = [
        'רפלקציה ביקורתית על ניתוח ה-ai',
        'רפלקציה ביקורתית על ניתוח ai',
        'ביקורת על ניתוח ה-ai',
        'הערכת ניתוח ה-ai',
        'critical reflection on ai analysis',
        'critical reflection on the ai'
    ];
    const hasCriticalReflectionSection = criticalReflectionSectionPatterns.some(pattern => allText.includes(pattern.toLowerCase()));
    if (!hasCriticalReflectionSection) {
        missing.push('Missing mandatory section "רפלקציה ביקורתית על ניתוח ה-AI"');
    }
    // Check 2: Reflection must explicitly reference AI's analysis
    const aiReferencePatterns = [
        'ניתוח ה-ai',
        'תשובת ה-ai',
        'תוצר ה-ai',
        'הניתוח של ה-ai',
        'ai analysis',
        'ai response',
        'ai output',
        'the ai\'s analysis',
        'the ai\'s reasoning'
    ];
    // Find reflection section and check if it references AI
    let reflectionReferencesAI = false;
    if (hasCriticalReflectionSection) {
        // Look for reflection section and check nearby context
        const reflectionSectionIndex = criticalReflectionSectionPatterns.findIndex(pattern => allText.includes(pattern.toLowerCase()));
        if (reflectionSectionIndex >= 0) {
            const pattern = criticalReflectionSectionPatterns[reflectionSectionIndex];
            const patternIndex = allText.indexOf(pattern.toLowerCase());
            // Check 500 characters after the section title
            const reflectionContext = allText.substring(patternIndex, patternIndex + 500);
            reflectionReferencesAI = aiReferencePatterns.some(aiPattern => reflectionContext.includes(aiPattern.toLowerCase()));
        }
    }
    if (hasCriticalReflectionSection && !reflectionReferencesAI) {
        missing.push('Critical reflection section does not explicitly reference the AI\'s analysis');
    }
    // Check 3: Detect parallel analysis (two unrelated analyses without hierarchy)
    // Look for patterns suggesting independent student analysis not tied to AI
    const independentAnalysisPatterns = [
        /ניתוח עצמאי[^.]*בלי.*ai/i,
        /ניתוח[^.]*מקביל[^.]*ללא.*קשר.*ai/i,
        /independent analysis[^.]*without.*ai/i,
        /parallel analysis[^.]*not.*related.*ai/i
    ];
    const parallelAnalysisDetected = independentAnalysisPatterns.some(pattern => pattern.test(allText));
    // Also check if there are two separate analysis sections without clear hierarchy
    const analysisSectionCount = (allText.match(/ניתוח|analysis/gi) || []).length;
    const aiAnalysisMentioned = aiReferencePatterns.some(pattern => allText.includes(pattern.toLowerCase()));
    const studentAnalysisMentioned = allText.includes('ניתוח הסטודנט') || allText.includes('student analysis');
    // If both AI and student analyses are mentioned but reflection section doesn't connect them
    if (aiAnalysisMentioned && studentAnalysisMentioned && !reflectionReferencesAI && analysisSectionCount >= 2) {
        missing.push('Assignment contains parallel analyses (AI + student) without clear hierarchy - student analysis must critique AI analysis');
    }
    // Check 4: Rubric must evaluate student's critique of AI
    const rubricAIReflectionPatterns = [
        'הערכת ניתוח ה-ai',
        'ביקורת על ניתוח ה-ai',
        'רפלקציה על ניתוח ה-ai',
        'evaluation of ai analysis',
        'critique of ai',
        'reflection on ai',
        'assessing ai',
        'critically evaluating ai'
    ];
    const rubricEvaluatesAIReflection = rubricAIReflectionPatterns.some(pattern => rubricText.includes(pattern.toLowerCase()));
    // Also check for required rubric criteria from contract
    const requiredRubricCriteria = [
        'הבנת המסגרת התיאורטית',
        'איכות הערכת ניתוח ה-ai',
        'עומק ההנמקה הרפלקטיבית',
        'understanding.*theoretical',
        'quality.*evaluation.*ai',
        'depth.*reflective'
    ];
    const hasRequiredRubricCriteria = requiredRubricCriteria.some(criterion => rubricText.includes(criterion.toLowerCase()));
    if (!rubricEvaluatesAIReflection && !hasRequiredRubricCriteria && rubricText.length > 0) {
        missing.push('Rubric does not contain a criterion evaluating the student\'s critique of AI analysis');
    }
    // Check 5: Rubric must be tabular (check for table structure)
    const hasTableStructure = rubricText.includes('<table') || rubricText.includes('<tr') ||
        rubricText.includes('טבלה') || rubricText.includes('table');
    if (rubricText.length > 0 && !hasTableStructure) {
        missing.push('Rubric must be in tabular format');
    }
    // Check 6: Rubric criteria must have content-specific descriptions (not generic)
    const genericCriteria = [
        'איכות תוכן',
        'quality of content',
        'איכות הכתיבה',
        'quality of writing'
    ];
    const hasOnlyGenericCriteria = genericCriteria.some(generic => rubricText.includes(generic.toLowerCase()) &&
        !rubricText.includes('ai') &&
        !rubricText.includes('רפלקציה') &&
        !rubricText.includes('reflection'));
    if (hasOnlyGenericCriteria && rubricText.length > 0) {
        missing.push('Rubric contains only generic criteria without content-specific descriptions related to AI reflection');
    }
    return {
        ok: missing.length === 0,
        missing,
        debug: {
            hasCriticalReflectionSection,
            rubricEvaluatesAIReflection: rubricEvaluatesAIReflection || hasRequiredRubricCriteria,
            parallelAnalysisDetected: parallelAnalysisDetected || (aiAnalysisMentioned && studentAnalysisMentioned && !reflectionReferencesAI)
        }
    };
}
exports.validateAm03Assignment = validateAm03Assignment;
/**
 * Validate external knowledge application - ensure external theories/concepts are meaningfully applied
 * Checks if external concepts mentioned in assignment have concrete application tasks
 */
function validateExternalKnowledgeApplication(structuredAssignment) {
    const missing = [];
    const externalConcepts = [];
    const allText = [
        structuredAssignment.studentInstructionsHtml || '',
        (structuredAssignment.instructions || []).join(' '),
        (structuredAssignment.requirements || []).join(' ')
    ].join(' ').toLowerCase();
    const rubricText = (structuredAssignment.rubricHtml || '').toLowerCase();
    // Common external academic theories/authors (expandable list)
    const externalTheoryPatterns = [
        // Sociology/Psychology
        { name: 'גופמן', patterns: ['גופמן', 'goffman'], concepts: ['הצגת העצמי', 'presentation of self', 'קדמת הבמה', 'frontstage', 'מאחורי הקלעים', 'backstage', 'הגדרת המצב', 'definition of the situation'] },
        { name: 'בורדייה', patterns: ['בורדייה', 'bourdieu'], concepts: ['הון תרבותי', 'cultural capital', 'הון חברתי', 'social capital', 'הביטוס', 'habitus'] },
        { name: 'פוקו', patterns: ['פוקו', 'foucault'], concepts: ['שיח', 'discourse', 'כוח', 'power', 'דיסציפלינה', 'discipline'] },
        { name: 'בולבי', patterns: ['בולבי', 'bowlby'], concepts: ['התקשרות', 'attachment', 'תיאוריית ההתקשרות'] },
        { name: 'סקינר', patterns: ['סקינר', 'skinner'], concepts: ['התניה אופרנטית', 'operant conditioning', 'חיזוק', 'reinforcement'] },
        { name: 'פבלוב', patterns: ['פבלוב', 'pavlov'], concepts: ['התניה קלאסית', 'classical conditioning'] },
        // Add more as needed
    ];
    // Check for external theories mentioned
    externalTheoryPatterns.forEach(theory => {
        const isMentioned = theory.patterns.some(pattern => allText.includes(pattern.toLowerCase()));
        if (isMentioned) {
            externalConcepts.push(theory.name);
            // Check if theory concepts are applied (not just mentioned)
            const hasConceptApplication = theory.concepts.some(concept => {
                const conceptLower = concept.toLowerCase();
                // Check for application indicators: "יישום", "נתח", "השווה", "הסבר", "דוגמה", "מקרה"
                const applicationKeywords = ['יישום', 'application', 'נתח', 'analyze', 'השווה', 'compare', 'הסבר', 'explain', 'דוגמה', 'example', 'מקרה', 'case', 'באמצעות', 'using', 'בעזרת', 'with'];
                return applicationKeywords.some(keyword => allText.includes(keyword.toLowerCase()) &&
                    (allText.indexOf(keyword.toLowerCase()) < allText.indexOf(conceptLower) + 200 ||
                        allText.indexOf(conceptLower) < allText.indexOf(keyword.toLowerCase()) + 200));
            });
            // Check if rubric includes application quality criteria for this theory
            const hasRubricCriteria = rubricText.includes(theory.name.toLowerCase()) ||
                theory.concepts.some(concept => rubricText.includes(concept.toLowerCase()));
            if (!hasConceptApplication && !hasRubricCriteria) {
                missing.push(`תיאוריה חיצונית "${theory.name}" מוזכרת אך לא מיושמת משמעותית. המטלה חייבת לכלול משימת יישום קונקרטית (דוגמה, ניתוח, השוואה) או קריטריון במחוון לאיכות היישום.`);
            }
            else if (!hasConceptApplication) {
                missing.push(`תיאוריה חיצונית "${theory.name}" מוזכרת במחוון אך לא במשימות היישום. המטלה חייבת לכלול משימת יישום קונקרטית.`);
            }
            else if (!hasRubricCriteria) {
                // Application exists but no rubric criteria - this is acceptable but could be improved
                // Don't fail validation, but could add to missing as a suggestion
            }
        }
    });
    // Also check for generic external theory mentions without specific application
    // Look for patterns like "תיאוריה של X" or "על פי X" without follow-up application
    const theoryMentionPatterns = [
        /תיאוריה של ([^.\s]+)/gi,
        /על פי ([^.\s]+)/gi,
        /לפי ([^.\s]+)/gi,
        /בהתאם ל([^.\s]+)/gi
    ];
    theoryMentionPatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
            matches.forEach(match => {
                // Check if there's application within reasonable distance (500 chars)
                const matchIndex = allText.indexOf(match.toLowerCase());
                const contextAfter = allText.substring(matchIndex, matchIndex + 500);
                const hasApplication = ['יישום', 'application', 'נתח', 'analyze', 'דוגמה', 'example', 'מקרה', 'case'].some(keyword => contextAfter.includes(keyword.toLowerCase()));
                if (!hasApplication && matchIndex > 0) {
                    // Don't add to missing if it's already in our known theories list
                    const theoryName = match.replace(/תיאוריה של |על פי |לפי |בהתאם ל/gi, '').trim();
                    if (!externalTheoryPatterns.some(t => t.patterns.some(p => theoryName.includes(p)))) {
                        // Generic theory mention - could be a problem, but be lenient
                        // Only flag if it's clearly a theory name (capitalized or known pattern)
                    }
                }
            });
        }
    });
    return {
        ok: missing.length === 0,
        missing,
        externalConcepts
    };
}
exports.validateExternalKnowledgeApplication = validateExternalKnowledgeApplication;
/**
 * Validate section depth - ensure core sections have at least 2 paragraphs with ≥3 sentences each
 */
function validateSectionDepth(structuredAssignment) {
    const failures = [];
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
            failures.push(`Section "${section.heading}" has only ${validParagraphCount} valid paragraph(s) ` +
                `(minimum ${section.minParagraphs} required, each with ≥3 sentences)`);
        }
    });
    return {
        ok: failures.length === 0,
        failures
    };
}
exports.validateSectionDepth = validateSectionDepth;
/**
 * Check if a tip involves AI usage
 */
function tipInvolvesAI(tip) {
    const spec = getTipSpec(tip);
    // If we have a spec, treat it as the source of truth.
    if (spec) {
        // Prefer explicit flag if present (supports gradual migration).
        if (typeof spec.involvesAI === 'boolean')
            return spec.involvesAI;
        // Infer ONLY from explicit structured AI artifacts.
        if (Array.isArray(spec.promptArtifacts) && spec.promptArtifacts.length > 0)
            return true;
        // Legacy explicit exception (keep tiny and documented).
        if (spec.id === 'am_13')
            return true;
        return false;
    }
    // No spec (unknown tip): safe fallback via explicit AI keywords only.
    const title = tip.title || '';
    const t = title.toLowerCase();
    return (t.includes('ai') ||
        t.includes('chatgpt') ||
        t.includes('gpt') ||
        t.includes('claude') ||
        t.includes('gemini') ||
        t.includes('copilot') ||
        title.includes('בינה מלאכותית'));
}
exports.tipInvolvesAI = tipInvolvesAI;
/**
 * Extract tip identifier from an object, checking multiple possible property names
 *
 * @param obj - Object that may contain tip identifier in various properties
 * @returns The first found identifier, or undefined if none found
 */
function getTipIdentifier(obj) {
    if (!obj || typeof obj !== 'object')
        return undefined;
    const o = obj;
    const raw = o?.id ??
        o?.key ??
        o?.slug ??
        o?.methodId ??
        o?.tipId ??
        o?.specId ??
        o?.code;
    // Convert to string safely, trim whitespace, and reject empty values.
    if (raw === null || raw === undefined)
        return undefined;
    const s = String(raw).trim();
    return s.length > 0 ? s : undefined;
}
exports.getTipIdentifier = getTipIdentifier;
/**
 * Validate that AI prompts are generated when AI-based tips are selected
 */
function validateAiPrompts(structuredAssignment, selectedTips) {
    const missing = [];
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
    const hasAiPromptsSection = allText.includes('פרומפטים לשימוש בכלי ai') ||
        allText.includes('פרומפטים לשימוש ב-ai') ||
        allText.includes('prompt a') ||
        allText.includes('prompt א') ||
        allText.includes('שאילתה א') ||
        allText.includes('שאילתה ראשונה');
    if (!hasAiPromptsSection) {
        missing.push('Missing "פרומפטים לשימוש בכלי AI" section');
    }
    // Check for concrete prompts (not just instructions to use AI)
    const hasGenericInstruction = allText.includes('השתמשו ב-ai') ||
        allText.includes('השתמשו בai') ||
        allText.includes('use ai');
    const hasConcretePrompt = allText.includes('prompt a:') ||
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
        const hasPromptA = allText.includes('prompt a') ||
            allText.includes('prompt א') ||
            allText.includes('שאילתה א') ||
            allText.includes('שאילתה ראשונה');
        const hasPromptB = allText.includes('prompt b') ||
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
exports.validateAiPrompts = validateAiPrompts;
/**
 * Normalize rubric HTML to use point ranges (0-7, 8-15, 16-20) instead of percentages
 */
function normalizeRubricHtmlToPointRanges(rubricHtml) {
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
    const criteria = [];
    // Try to parse existing table structure
    const rows = rubricHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
    rows.forEach((row, rowIdx) => {
        if (rowIdx === 0)
            return; // Skip header row
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
        criteria.push({ name: 'איכות תוכן', description: 'עומק הניתוח ורמת ההבנה' }, { name: 'מקורות ומחקר', description: 'איכות המקורות ושימוש נכון בהם' }, { name: 'כתיבה אקדמית', description: 'רמת הכתיבה והביטוי האקדמי' });
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
exports.normalizeRubricHtmlToPointRanges = normalizeRubricHtmlToPointRanges;
