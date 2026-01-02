/**
 * Universal TipSpec Validator
 *
 * Validates that generated assignments contain all required elements from TipSpecUniversal:
 * - Deliverables (by name)
 * - Rubric table (not only HTML percent table)
 * - Anti-generic rules: requires >=1 concrete example AND requires applying >=2 concepts to a case
 * - AI mode rules (comparison: PromptA/PromptB + comparison table; reflection: critical reflection deliverable)
 */
import { TipSpecUniversal } from './tipSpecUniversal';
export interface ValidationResult {
    ok: boolean;
    missing: string[];
    details?: {
        deliverablesFound: string[];
        rubricIsTable: boolean;
        rubricHasPercentages: boolean;
        hasConcreteExample: boolean;
        hasConceptApplication: boolean;
        aiModeChecks?: {
            hasPromptA?: boolean;
            hasPromptB?: boolean;
            hasComparisonTable?: boolean;
            hasReflectionDeliverable?: boolean;
        };
    };
}
/**
 * Universal validator for TipSpecUniversal compliance
 */
export declare function validateTipSpecUniversal(assignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}, spec: TipSpecUniversal): ValidationResult;
/**
 * Validate with retry - if validation fails, return missing list for retry prompt
 */
export declare function validateWithRetry(assignment: {
    studentInstructionsHtml?: string;
    instructions?: string[];
    requirements?: string[];
    rubricHtml?: string;
}, spec: TipSpecUniversal, retryCount?: number): {
    ok: boolean;
    missing: string[];
    shouldRetry: boolean;
    retryPrompt?: string;
};
