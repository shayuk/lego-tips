/**
 * Universal Tip→TipSpec Pipeline
 *
 * Provides a unified way to convert any tip (with or without internal spec)
 * into a standardized TipSpecUniversal format, then into implementation blocks.
 */
import { z } from 'zod';
export declare const TipSpecUniversalSchema: z.ZodObject<{
    goal: z.ZodString;
    learner_actions: z.ZodArray<z.ZodString, "many">;
    deliverables: z.ZodArray<z.ZodString, "many">;
    quality_criteria: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        whatToCheck: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        whatToCheck: string;
    }, {
        name: string;
        whatToCheck: string;
    }>, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
    ai_mode: z.ZodOptional<z.ZodEnum<["optional", "required", "comparison", "reflection"]>>;
    aiTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    anti_generic_rules: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    goal: string;
    learner_actions: string[];
    deliverables: string[];
    quality_criteria: {
        name: string;
        whatToCheck: string;
    }[];
    constraints: string[];
    anti_generic_rules: string[];
    ai_mode?: "optional" | "required" | "comparison" | "reflection" | undefined;
    aiTools?: string[] | undefined;
}, {
    goal: string;
    learner_actions: string[];
    deliverables: string[];
    quality_criteria: {
        name: string;
        whatToCheck: string;
    }[];
    constraints: string[];
    anti_generic_rules: string[];
    ai_mode?: "optional" | "required" | "comparison" | "reflection" | undefined;
    aiTools?: string[] | undefined;
}>;
export type TipSpecUniversal = z.infer<typeof TipSpecUniversalSchema>;
/**
 * Input for normalizeTipToSpec
 */
export interface TipInput {
    id?: string;
    title: string;
    description?: string;
    fullText?: string;
}
export interface TipContext {
    courseName?: string;
    courseDescription?: string;
    topic?: string;
    level?: string;
}
/**
 * Normalize tip to TipSpecUniversal
 * - If internal spec exists: map directly without LLM
 * - Else: call LLM ONCE to extract JSON TipSpecUniversal
 * - Validate with Zod; if invalid do ONE repair attempt
 */
export declare function normalizeTipToSpec(tip: TipInput, context: TipContext, llmClient?: any, providerType?: 'openai' | 'claude'): Promise<{
    spec: TipSpecUniversal;
    source: 'internal' | 'llm' | 'llm-repaired' | 'fallback';
}>;
/**
 * Convert TipSpecUniversal to implementation block (A/B/C/D/E format)
 */
export declare function specToImplementationBlock(spec: TipSpecUniversal, tipTitle: string): string;
