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
exports.normalizeRubricHtmlToPointRanges = exports.validateTipCompliance = exports.buildTipEnforcementPrompt = void 0;
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
        rubricCriteriaHints: ['רפלקציה על AI', 'איכות הניתוח הביקורתי', 'תיעוד השיח']
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
        rubricCriteriaHints: ['השוואה בין תוצרים', 'ניתוח ביקורתי', 'זיהוי הטיות', 'איכות השאילתות']
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
/**
 * Build enforcement prompt for selected tips
 */
function buildTipEnforcementPrompt(selectedTips, topic) {
    if (selectedTips.length === 0) {
        return '';
    }
    const sections = [];
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
                spec.promptArtifacts.forEach((artifact, idx) => {
                    sections.push(`   - ${artifact.label}: ${artifact.promptTemplate}`);
                });
                sections.push(`   הסטודנטים חייבים להריץ את שני ה-prompts בכלי AI שונים ולהשוות את התוצאות.`);
                sections.push(`   המטלה חייבת לכלול טבלת השוואה וניתוח ביקורתי של ההבדלים.`);
            }
        }
        else {
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
    return sections.join('\n');
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
    const criterionRegex = /<td[^>]*>([^<]+)<\/td>/g;
    let match;
    let currentCriterion = {};
    let cellIndex = 0;
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
