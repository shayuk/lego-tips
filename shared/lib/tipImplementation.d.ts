/**
 * Tip Implementation Engine
 *
 * Ensures that every selected pedagogical tip is implemented with:
 * - Dedicated "יישום הטיפ" subsections
 * - Concrete deliverables (artifacts)
 * - For AI comparison tip: explicit Prompt A + Prompt B
 */
export type AiMode = 'optional' | 'required' | 'comparison' | 'reflection';
export interface TipContract {
    requiredSections: string[];
    prohibitedPatterns: string[];
    requiredRubricCriteria: string[];
    intent: string;
}
export interface TipImplementationSpec {
    id?: string;
    titleMatchers: string[];
    requiredSubsections: string[];
    requiredDeliverables: string[];
    promptArtifacts?: {
        label: string;
        promptTemplate: string;
    }[];
    rubricCriteriaHints?: string[];
    involvesAI?: boolean;
    aiMode?: AiMode;
    aiTools?: string[];
    contract?: TipContract;
}
/**
 * Get tip spec by title or id
 */
export declare function getTipSpec(tip: {
    id?: string;
    title: string;
}): TipImplementationSpec | null;
/**
 * Build AI mode-specific addon block for prompt
 */
export declare function buildAiModeAddon(spec: TipImplementationSpec, context: {
    topic?: string;
    course?: string;
}): string;
/**
 * Build enforcement prompt for selected tips
 * Returns both the prompt and AI mode addons separately for debugging
 */
export declare function buildTipEnforcementPrompt(selectedTips: Array<{
    id?: string;
    title: string;
    description?: string;
}>, topic: string): {
    prompt: string;
    aiModeAddons: string;
};
/**
 * Validate that structured assignment complies with tip requirements
 */
export declare function validateTipCompliance(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}, selectedTips: Array<{
    id?: string;
    title: string;
}>): {
    ok: boolean;
    missing: string[];
};
/**
 * Validate tip implementation requirements - stricter validation for post-generation
 * Checks for specific AI mode requirements (reflection, comparison)
 */
export declare function validateTipImplementationRequirements(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}, selectedTips: Array<{
    id?: string;
    title: string;
}>): {
    ok: boolean;
    missing: string[];
};
/**
 * Validate am_03 assignment - enforce strict pedagogical contract
 * The assignment is INVALID if:
 * - No section titled "רפלקציה ביקורתית על ניתוח ה-AI" exists
 * - The reflection does not explicitly reference the AI's analysis
 * - The assignment contains two unrelated analyses (AI + student) without hierarchy
 * - The rubric does NOT contain a criterion evaluating the student's critique of AI
 */
export declare function validateAm03Assignment(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}): {
    ok: boolean;
    missing: string[];
    debug?: {
        hasCriticalReflectionSection: boolean;
        rubricEvaluatesAIReflection: boolean;
        parallelAnalysisDetected: boolean;
    };
};
/**
 * Validate external knowledge application - ensure external theories/concepts are meaningfully applied
 * Checks if external concepts mentioned in assignment have concrete application tasks
 */
export declare function validateExternalKnowledgeApplication(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}): {
    ok: boolean;
    missing: string[];
    externalConcepts: string[];
};
/**
 * Validate section depth - ensure core sections have at least 2 paragraphs with ≥3 sentences each
 */
export declare function validateSectionDepth(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
}): {
    ok: boolean;
    failures: string[];
};
/**
 * Check if a tip involves AI usage
 */
export declare function tipInvolvesAI(tip: {
    id?: string;
    title: string;
}): boolean;
/**
 * Extract tip identifier from an object, checking multiple possible property names
 *
 * @param obj - Object that may contain tip identifier in various properties
 * @returns The first found identifier, or undefined if none found
 */
export declare function getTipIdentifier(obj: unknown): string | undefined;
/**
 * Validate that AI prompts are generated when AI-based tips are selected
 */
export declare function validateAiPrompts(structuredAssignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
}, selectedTips: Array<{
    id?: string;
    title: string;
}>): {
    ok: boolean;
    missing: string[];
};
/**
 * Normalize rubric HTML to use point ranges (0-7, 8-15, 16-20) instead of percentages
 */
export declare function normalizeRubricHtmlToPointRanges(rubricHtml: string): string;
