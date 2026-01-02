# Enforce Minimum Content Depth and Mandatory AI Prompt Generation - Implementation Report

## Summary

This report documents the implementation of strict validation rules to ensure:
1. **Minimum section depth**: Core sections must contain at least 2 paragraphs (≥3 sentences each)
2. **Mandatory AI prompt generation**: When AI-based tips are selected, concrete prompts must be generated (no placeholders)

## Files Changed

### Modified Files
- `shared/tipImplementation.ts` - Added validation functions and enhanced tip enforcement prompts
- `functions/src/index.ts` - Integrated validation with retry logic
- `server/server.js` - Integrated validation (CJS compatible)
- `src/features/assessmentBuilder/hooks/useAssessmentGenerator.tsx` - Added frontend validation failure handling

### Generated Files
- `shared/lib/tipImplementation.js` - Compiled JavaScript (generated)
- `shared/lib/tipImplementation.d.ts` - TypeScript definitions (generated)

## Validation Rules

### Section Depth Validation

**Required Sections:**
- "מטרת המשימה" (Mission Purpose)
- "תיאור המשימה והוראות" (Task Description and Instructions)
- "דרישות הגשה" (Submission Requirements)

**Requirements:**
- Each section must contain **at least 2 paragraphs**
- Each paragraph must contain **≥3 sentences** (split by `.`, `!`, `?`)
- Bullet points or lists do NOT count as paragraphs

**Validation Function:**
```typescript
validateSectionDepth(structuredAssignment): { ok: boolean; failures: string[] }
```

### AI Prompt Validation

**Trigger Conditions:**
- Any selected tip involves AI usage (reflection, comparison, analysis)

**Requirements:**
- Must include subsection: "פרומפטים לשימוש בכלי AI"
- Must provide concrete prompts (ready to copy-paste)
- Prompts must reference the actual assignment topic
- Prompts must reference uploaded materials or scholarly sources
- Prompts must specify expected output format

**Forbidden:**
- Generic phrases like "השתמשו ב-AI כדי..." without explicit prompts
- Placeholder prompts not tied to the topic

**Validation Function:**
```typescript
validateAiPrompts(structuredAssignment, selectedTips): { ok: boolean; missing: string[] }
```

## Implementation Details

### Step 1: Shared Validation Logic

Added two new validation functions to `shared/tipImplementation.ts`:

1. **`validateSectionDepth()`** - Parses HTML, extracts sections by headings, counts paragraphs, validates sentence count
2. **`validateAiPrompts()`** - Checks for AI prompts section and concrete prompts when AI tips are selected

Enhanced `buildTipEnforcementPrompt()` to include:
- Section depth requirements in enforcement prompt
- AI prompt generation requirements when AI tips are selected

### Step 2: Backend Integration

**functions/src/index.ts:**
- Validation runs AFTER HTML extraction (when `studentInstructionsHtml` is available)
- If validation fails, regenerates ONCE with strict retry prompt
- Stores debug flags: `sectionDepthOkBeforeRetry`, `sectionDepthOkAfterRetry`, `sectionDepthFailures`, `aiPromptsOk`, `aiPromptsFailures`

**server/server.js:**
- Same validation logic (CJS compatible)
- Logs validation failures (retry handled by functions endpoint)

### Step 3: Frontend Validation

**useAssessmentGenerator.tsx:**
- Checks `debug.sectionDepthOkAfterRetry` and `debug.aiPromptsOk`
- If validation failed after retry, throws error with user-friendly message
- Error message: "המערכת לא הצליחה לייצר מטלה שעומדת בדרישות העומק/הפרומפטים. אנא נסו שוב או שנו את בחירת הטיפים."

### Step 4: Word Export

Verified that `exportToWord()` uses `fullAssignmentHtml` (set in `useAssessmentGenerator.tsx` line 264-266), ensuring AI prompts appear in exported documents.

## Debug Flags

Added to `structuredAssignment.debug`:
- `sectionDepthOkBeforeRetry: boolean` - Validation status before retry
- `sectionDepthOkAfterRetry: boolean` - Validation status after retry
- `sectionDepthFailures: string[]` - List of section depth failures
- `aiPromptsOk: boolean` - AI prompts validation status
- `aiPromptsFailures: string[]` - List of AI prompts validation failures

## Example Generated AI Prompts

When AI comparison tip is selected, the assignment must include:

```html
<h3>פרומפטים לשימוש בכלי AI</h3>
<p><strong>Prompt A:</strong> [Full prompt text referencing the assignment topic and materials]</p>
<p><strong>Prompt B:</strong> [Full prompt text with variation, referencing the assignment topic]</p>
<p>השתמשו בשני הפרומפטים בכלי AI שונים והשוו את התוצאות.</p>
```

## Before/After Comparison

### Before
- Sections could be shallow (1 paragraph or bullet points)
- AI tips could include generic "use AI" instructions without concrete prompts
- No validation or retry mechanism

### After
- Sections must have minimum depth (2 paragraphs, ≥3 sentences each)
- AI tips must include concrete, ready-to-use prompts
- Automatic retry with strict instructions if validation fails
- Hard fail in frontend if validation fails after retry

## Build Results

✅ `npm run build:shared` - Success (TypeScript compilation completed)
✅ No linter errors in modified files
✅ All validation functions exported correctly

## Testing Recommendations

1. **Test shallow assignment generation:**
   - Generate assignment with minimal content
   - Verify retry mechanism triggers
   - Verify final output has required depth

2. **Test AI tip selection:**
   - Select AI reflection or comparison tip
   - Verify prompts section appears
   - Verify prompts are concrete (not generic)

3. **Test validation failure:**
   - Mock validation failure in debug flags
   - Verify frontend shows error message
   - Verify assignment is not rendered

## Next Steps

1. Monitor validation failure rates in production
2. Adjust retry prompt if needed based on LLM responses
3. Consider adding more granular validation (e.g., minimum word count per section)

## Commit Information

- **Branch**: `fix/enforce-min-depth-and-ai-prompts`
- **Commit Message**: "Fix: enforce minimum section depth and mandatory AI prompt generation"
- **Files Changed**: 4 modified, 2 generated

