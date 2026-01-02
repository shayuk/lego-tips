"use strict";
/**
 * Universal TipSpec Validator
 *
 * Validates that generated assignments contain all required elements from TipSpecUniversal:
 * - Deliverables (by name)
 * - Rubric table (not only HTML percent table)
 * - Anti-generic rules: requires >=1 concrete example AND requires applying >=2 concepts to a case
 * - AI mode rules (comparison: PromptA/PromptB + comparison table; reflection: critical reflection deliverable)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWithRetry = exports.validateTipSpecUniversal = void 0;
/**
 * Universal validator for TipSpecUniversal compliance
 */
function validateTipSpecUniversal(assignment, spec) {
    const missing = [];
    const details = {
        deliverablesFound: [],
        rubricIsTable: false,
        rubricHasPercentages: false,
        hasConcreteExample: false,
        hasConceptApplication: false
    };
    // Combine all text content
    const allText = [
        assignment.studentInstructionsHtml || '',
        (assignment.instructions || []).join(' '),
        (assignment.requirements || []).join(' ')
    ].join(' ').toLowerCase();
    const rubricText = (assignment.rubricHtml || '').toLowerCase();
    // 1. Check deliverables (by name)
    const deliverablesFound = [];
    spec.deliverables.forEach(deliverable => {
        // Check if deliverable name appears in content (fuzzy match)
        const deliverableLower = deliverable.toLowerCase();
        const deliverableKeywords = deliverableLower.split(/\s+/).filter(w => w.length > 3);
        // Check if at least 50% of keywords appear
        const matchingKeywords = deliverableKeywords.filter(keyword => allText.includes(keyword) || rubricText.includes(keyword));
        if (matchingKeywords.length >= Math.ceil(deliverableKeywords.length * 0.5)) {
            deliverablesFound.push(deliverable);
        }
        else {
            missing.push(`Deliverable not found: "${deliverable}"`);
        }
    });
    details.deliverablesFound = deliverablesFound;
    // 2. Check rubric table (not only HTML percent table)
    const hasTableStructure = rubricText.includes('<table') ||
        rubricText.includes('<tr') ||
        rubricText.includes('טבלה') ||
        rubricText.includes('table');
    const hasPercentages = rubricText.includes('%') ||
        rubricText.includes('90-100') ||
        rubricText.includes('80-89') ||
        rubricText.includes('70-79') ||
        rubricText.includes('60-69');
    const hasPointRanges = rubricText.includes('0–7') ||
        rubricText.includes('0-7') ||
        rubricText.includes('0–10') ||
        rubricText.includes('0-10') ||
        rubricText.includes('0–5') ||
        rubricText.includes('0-5');
    details.rubricIsTable = hasTableStructure;
    details.rubricHasPercentages = hasPercentages;
    if (!hasTableStructure && rubricText.length > 0) {
        missing.push('Rubric must be a table (not only HTML percent table)');
    }
    if (hasPercentages && !hasPointRanges) {
        missing.push('Rubric must use point ranges (0-7, 8-15, 16-20) instead of percentages');
    }
    // 3. Anti-generic rules: requires >=1 concrete example AND requires applying >=2 concepts to a case
    const concreteExamplePatterns = [
        /דוגמה[^.]*קונקרטית/i,
        /concrete example/i,
        /specific example/i,
        /דוגמה ספציפית/i,
        /מקרה[^.]*קונקרטי/i,
        /case study/i,
        /דוגמה[^.]*מפורטת/i
    ];
    const hasConcreteExample = concreteExamplePatterns.some(pattern => pattern.test(allText));
    details.hasConcreteExample = hasConcreteExample;
    if (!hasConcreteExample) {
        missing.push('Assignment must include at least one concrete example');
    }
    // Check for concept application (applying >=2 concepts to a case)
    const conceptApplicationPatterns = [
        /יישום[^.]*מושגים/i,
        /applying.*concepts/i,
        /יישום[^.]*תיאוריה/i,
        /applying.*theory/i,
        /ניתוח[^.]*באמצעות[^.]*מושגים/i,
        /analysis.*using.*concepts/i,
        /השוואה[^.]*מושגים/i,
        /comparing.*concepts/i
    ];
    // Count concept applications
    let conceptApplicationCount = 0;
    conceptApplicationPatterns.forEach(pattern => {
        const matches = allText.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
            conceptApplicationCount += matches.length;
        }
    });
    // Also check for explicit "2 concepts" or "שני מושגים"
    if (allText.includes('2 concepts') || allText.includes('שני מושגים') || allText.includes('שני מושגי')) {
        conceptApplicationCount += 1;
    }
    const hasConceptApplication = conceptApplicationCount >= 1; // At least one mention suggests application
    details.hasConceptApplication = hasConceptApplication;
    if (!hasConceptApplication) {
        missing.push('Assignment must require applying at least 2 concepts to a case');
    }
    // 4. AI mode rules
    if (spec.ai_mode) {
        details.aiModeChecks = {};
        switch (spec.ai_mode) {
            case 'comparison':
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
                    allText.includes('השוואה') ||
                    (allText.includes('טבלה') && allText.includes('השוואה'));
                details.aiModeChecks.hasPromptA = hasPromptA;
                details.aiModeChecks.hasPromptB = hasPromptB;
                details.aiModeChecks.hasComparisonTable = hasComparisonTable;
                if (!hasPromptA) {
                    missing.push('Comparison mode requires Prompt A');
                }
                if (!hasPromptB) {
                    missing.push('Comparison mode requires Prompt B');
                }
                if (!hasComparisonTable) {
                    missing.push('Comparison mode requires comparison table');
                }
                break;
            case 'reflection':
                const hasReflectionDeliverable = allText.includes('רפלקציה') ||
                    allText.includes('reflection') ||
                    allText.includes('critical reflection') ||
                    allText.includes('רפלקציה ביקורתית');
                details.aiModeChecks.hasReflectionDeliverable = hasReflectionDeliverable;
                if (!hasReflectionDeliverable) {
                    missing.push('Reflection mode requires critical reflection deliverable');
                }
                break;
            case 'required':
                // Must document AI usage
                const hasAIDocumentation = allText.includes('תיעוד') ||
                    allText.includes('documentation') ||
                    allText.includes('צילום') ||
                    allText.includes('screenshot');
                if (!hasAIDocumentation) {
                    missing.push('Required AI mode must include AI usage documentation');
                }
                break;
            case 'optional':
                // Optional mode - no strict requirements
                break;
        }
    }
    return {
        ok: missing.length === 0,
        missing,
        details
    };
}
exports.validateTipSpecUniversal = validateTipSpecUniversal;
/**
 * Validate with retry - if validation fails, return missing list for retry prompt
 */
function validateWithRetry(assignment, spec, retryCount = 0) {
    const validation = validateTipSpecUniversal(assignment, spec);
    if (validation.ok) {
        return { ok: true, missing: [], shouldRetry: false };
    }
    // If already retried once, don't retry again
    if (retryCount >= 1) {
        return { ok: false, missing: validation.missing, shouldRetry: false };
    }
    // Build retry prompt with explicit missing list
    const retryPrompt = `**תיקון חובה - יישום TipSpecUniversal:**

המטלה לא עומדת בדרישות הבאות:

${validation.missing.map(m => `- ${m}`).join('\n')}

**הוראות חובה לתיקון:**

1. **Deliverables (חובה):** כל אחד מהדברים הבאים חייב להופיע במטלה:
${spec.deliverables.map(d => `   - ${d}`).join('\n')}

2. **Rubric (חובה):**
   - המחוון חייב להיות טבלה HTML (לא רק טבלת אחוזים)
   - המחוון חייב להשתמש בטווחי נקודות (0–7, 8–15, 16–20) ולא באחוזים

3. **Anti-generic rules (חובה):**
   - המטלה חייבת לכלול לפחות דוגמה קונקרטית אחת
   - המטלה חייבת לדרוש יישום של לפחות 2 מושגים למקרה ספציפי

${spec.ai_mode === 'comparison' ? `4. **AI Comparison Mode (חובה):**
   - חובה לכלול Prompt A ו-Prompt B
   - חובה לכלול טבלת השוואה מפורטת
   - חובה לכלול פסקת החלטה סופית` : ''}

${spec.ai_mode === 'reflection' ? `4. **AI Reflection Mode (חובה):**
   - חובה לכלול deliverable של רפלקציה ביקורתית
   - חובה לכלול תיעוד של שימוש ב-AI (צילומי מסך/transcript)
   - חובה לכלול ניתוח ביקורתי של תגובות ה-AI` : ''}

5. צור מטלה חדשה מלאה שעומדת בכל הדרישות הנ"ל.`;
    return {
        ok: false,
        missing: validation.missing,
        shouldRetry: true,
        retryPrompt
    };
}
exports.validateWithRetry = validateWithRetry;
