"use strict";
/**
 * Universal Tip→TipSpec Pipeline
 *
 * Provides a unified way to convert any tip (with or without internal spec)
 * into a standardized TipSpecUniversal format, then into implementation blocks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.specToImplementationBlock = exports.normalizeTipToSpec = exports.TipSpecUniversalSchema = void 0;
const zod_1 = require("zod");
const tipImplementation_1 = require("./tipImplementation");
// TipSpecUniversal schema with Zod validation
exports.TipSpecUniversalSchema = zod_1.z.object({
    goal: zod_1.z.string().min(10, 'Goal must be at least 10 characters'),
    learner_actions: zod_1.z.array(zod_1.z.string()).min(3, 'Must have at least 3 learner actions').max(6, 'Must have at most 6 learner actions'),
    deliverables: zod_1.z.array(zod_1.z.string()).min(2, 'Must have at least 2 deliverables'),
    quality_criteria: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        whatToCheck: zod_1.z.string().min(10, 'whatToCheck must be concrete and at least 10 characters')
            .refine((val) => {
            const lower = val.toLowerCase();
            // Reject generic criteria
            const genericPatterns = [
                'quality of content',
                'איכות תוכן',
                'quality of writing',
                'איכות הכתיבה',
                'general quality',
                'איכות כללית'
            ];
            return !genericPatterns.some(pattern => lower.includes(pattern));
        }, { message: 'whatToCheck must be concrete, not generic like "quality of content"' })
    })).min(3, 'Must have at least 3 quality criteria'),
    constraints: zod_1.z.array(zod_1.z.string()).min(2, 'Must have at least 2 constraints'),
    ai_mode: zod_1.z.enum(['optional', 'required', 'comparison', 'reflection']).optional(),
    aiTools: zod_1.z.array(zod_1.z.string()).optional(),
    anti_generic_rules: zod_1.z.array(zod_1.z.string()).min(2, 'Must have at least 2 anti-generic rules').max(3, 'Must have at most 3 anti-generic rules')
});
/**
 * Map existing internal TipImplementationSpec to TipSpecUniversal
 */
function mapInternalSpecToUniversal(internalSpec, tip, context) {
    const goal = `Implement ${tip.title} in the context of ${context.courseName || context.topic || 'the course'}`;
    // Convert requiredSubsections to learner_actions (3-6 items)
    const learner_actions = internalSpec.requiredSubsections.length > 0
        ? internalSpec.requiredSubsections.slice(0, 6).map((sub, idx) => `${idx + 1}. ${sub}`)
        : [
            `1. Review the requirements for ${tip.title}`,
            `2. Prepare necessary materials and resources`,
            `3. Execute the implementation steps`,
            `4. Document the process and outcomes`
        ].slice(0, Math.max(3, Math.min(6, internalSpec.requiredDeliverables.length || 4)));
    // Ensure 3-6 learner actions
    while (learner_actions.length < 3) {
        learner_actions.push(`${learner_actions.length + 1}. Complete additional steps as required`);
    }
    if (learner_actions.length > 6) {
        learner_actions.splice(6);
    }
    // Deliverables from requiredDeliverables (>=2)
    const deliverables = internalSpec.requiredDeliverables.length >= 2
        ? internalSpec.requiredDeliverables
        : [
            ...internalSpec.requiredDeliverables,
            `Documentation of ${tip.title} implementation process`
        ].slice(0, Math.max(2, internalSpec.requiredDeliverables.length));
    // Quality criteria from rubricCriteriaHints (>=3, concrete)
    const quality_criteria = internalSpec.rubricCriteriaHints && internalSpec.rubricCriteriaHints.length >= 3
        ? internalSpec.rubricCriteriaHints.map(hint => ({
            name: hint,
            whatToCheck: `Evaluate ${hint.toLowerCase()} with specific evidence from the implementation, including concrete examples and measurable outcomes`
        }))
        : [
            {
                name: 'Implementation Completeness',
                whatToCheck: `Verify all required steps from ${tip.title} are completed with documented evidence`
            },
            {
                name: 'Quality of Execution',
                whatToCheck: `Assess the depth and accuracy of implementation, checking for specific examples and adherence to guidelines`
            },
            {
                name: 'Documentation Quality',
                whatToCheck: `Review clarity and completeness of documentation, ensuring all deliverables include concrete details and examples`
            }
        ];
    // Constraints (>=2)
    const constraints = [
        `Must follow all requirements specified for ${tip.title}`,
        `Must submit all deliverables by the specified deadline`,
        `Must adhere to academic standards and guidelines`
    ].slice(0, 2);
    // Anti-generic rules (2-3)
    const anti_generic_rules = [
        `Requires at least one concrete example demonstrating application of concepts`,
        `Requires applying at least 2 concepts to a specific case or scenario`
    ];
    return {
        goal,
        learner_actions,
        deliverables,
        quality_criteria,
        constraints,
        ai_mode: internalSpec.aiMode,
        aiTools: internalSpec.aiTools,
        anti_generic_rules
    };
}
/**
 * Call server-side LLM to extract TipSpecUniversal from tip text
 * Returns JSON-only response
 */
async function extractSpecFromLLM(tip, context, llmClient, providerType) {
    const tipText = tip.fullText || tip.description || tip.title;
    const courseContext = context.courseName || context.topic || 'the course';
    const extractionPrompt = `You are a pedagogical expert. Extract a structured specification from the following tip description.

Tip Title: ${tip.title}
Tip Description: ${tipText}
Course Context: ${courseContext}
${context.level ? `Level: ${context.level}` : ''}

Extract and return ONLY a valid JSON object matching this exact schema:
{
  "goal": "string (at least 10 chars, describes the learning objective)",
  "learner_actions": ["string", ...] (3-6 items, specific action steps),
  "deliverables": ["string", ...] (at least 2 items, concrete artifacts),
  "quality_criteria": [
    {
      "name": "string",
      "whatToCheck": "string (at least 10 chars, CONCRETE not generic like 'quality of content')"
    },
    ...
  ] (at least 3 items, each whatToCheck must be specific and concrete),
  "constraints": ["string", ...] (at least 2 items),
  "ai_mode": "optional" | "required" | "comparison" | "reflection" (optional),
  "aiTools": ["string", ...] (optional, if ai_mode is present),
  "anti_generic_rules": ["string", ...] (2-3 items, rules to prevent generic outputs)
}

CRITICAL REQUIREMENTS:
- quality_criteria[].whatToCheck MUST be concrete (e.g., "Check for at least 3 specific examples of X" NOT "quality of content")
- Reject any generic criteria like "quality of content" or "איכות תוכן"
- learner_actions must be 3-6 specific, actionable steps
- deliverables must be concrete artifacts (not abstract concepts)
- anti_generic_rules must include: "requires >=1 concrete example" AND "requires applying >=2 concepts to a case"

Return ONLY the JSON object, no markdown, no explanation, no code blocks.`;
    let responseText = '';
    if (providerType === 'openai') {
        const completion = await llmClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a JSON extraction expert. Return only valid JSON, no markdown, no explanation.' },
                { role: 'user', content: extractionPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2000
        });
        responseText = completion.choices[0].message.content || '';
    }
    else if (providerType === 'claude') {
        const message = await llmClient.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 2000,
            messages: [
                { role: 'user', content: extractionPrompt }
            ]
        });
        responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    }
    // Clean response (remove markdown code blocks if present)
    const cleaned = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    try {
        const parsed = JSON.parse(cleaned);
        return exports.TipSpecUniversalSchema.parse(parsed);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new Error(`LLM extraction validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
}
/**
 * Normalize tip to TipSpecUniversal
 * - If internal spec exists: map directly without LLM
 * - Else: call LLM ONCE to extract JSON TipSpecUniversal
 * - Validate with Zod; if invalid do ONE repair attempt
 */
async function normalizeTipToSpec(tip, context, llmClient, providerType) {
    // Check if internal spec exists
    const internalSpec = (0, tipImplementation_1.getTipSpec)(tip);
    if (internalSpec) {
        // Map internal spec to universal format
        const spec = mapInternalSpecToUniversal(internalSpec, tip, context);
        // Validate mapped spec
        try {
            const validated = exports.TipSpecUniversalSchema.parse(spec);
            return { spec: validated, source: 'internal' };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                // If validation fails, fall through to LLM extraction
                console.warn(`Internal spec validation failed for ${tip.id || tip.title}, falling back to LLM:`, error.errors);
            }
            else {
                throw error;
            }
        }
    }
    // No internal spec or validation failed - use LLM
    if (!llmClient || !providerType) {
        // If no LLM available, return a minimal valid spec based on tip info
        console.warn(`No internal spec found for tip "${tip.title}" and LLM client not provided, using fallback spec`);
        return {
            spec: {
                goal: `Implement ${tip.title} in the context of ${context.courseName || context.topic || 'the course'}`,
                learner_actions: [
                    `1. Review requirements for ${tip.title}`,
                    `2. Prepare necessary materials and resources`,
                    `3. Execute implementation steps`,
                    `4. Document process and outcomes`
                ],
                deliverables: [
                    `Implementation of ${tip.title}`,
                    `Documentation of ${tip.title} process`
                ],
                quality_criteria: [
                    {
                        name: 'Implementation Completeness',
                        whatToCheck: `Verify all required steps from ${tip.title} are completed with documented evidence`
                    },
                    {
                        name: 'Quality of Execution',
                        whatToCheck: `Assess depth and accuracy of implementation, checking for specific examples and adherence to guidelines`
                    },
                    {
                        name: 'Documentation Quality',
                        whatToCheck: `Review clarity and completeness of documentation, ensuring all deliverables include concrete details`
                    }
                ],
                constraints: [
                    `Must follow all requirements specified for ${tip.title}`,
                    `Must submit all deliverables by the specified deadline`
                ],
                anti_generic_rules: [
                    `Requires at least one concrete example demonstrating application of concepts`,
                    `Requires applying at least 2 concepts to a specific case or scenario`
                ]
            },
            source: 'fallback'
        };
    }
    try {
        const spec = await extractSpecFromLLM(tip, context, llmClient, providerType);
        return { spec, source: 'llm' };
    }
    catch (error) {
        // If validation fails, try ONE repair attempt
        if (error.message.includes('validation failed') || error instanceof zod_1.z.ZodError) {
            const repairPrompt = `The previous extraction failed validation. Errors: ${error.message}

Fix the following issues and return ONLY valid JSON:
${JSON.stringify(error instanceof zod_1.z.ZodError ? error.errors : [{ message: error.message }], null, 2)}

Re-extract the specification with these fixes:
- Ensure quality_criteria[].whatToCheck is concrete (e.g., "Check for at least 3 examples of X" NOT "quality of content")
- Ensure learner_actions is 3-6 items
- Ensure deliverables is at least 2 items
- Ensure quality_criteria is at least 3 items
- Ensure constraints is at least 2 items
- Ensure anti_generic_rules is 2-3 items

Return ONLY the corrected JSON object.`;
            let repairResponse = '';
            if (providerType === 'openai') {
                const repairCompletion = await llmClient.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a JSON repair expert. Return only valid JSON, no markdown, no explanation.' },
                        { role: 'user', content: repairPrompt }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                    max_tokens: 2000
                });
                repairResponse = repairCompletion.choices[0].message.content || '';
            }
            else if (providerType === 'claude') {
                const repairMessage = await llmClient.messages.create({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000,
                    messages: [
                        { role: 'user', content: repairPrompt }
                    ]
                });
                repairResponse = repairMessage.content[0].type === 'text' ? repairMessage.content[0].text : '';
            }
            const cleanedRepair = repairResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            try {
                const repaired = JSON.parse(cleanedRepair);
                const validated = exports.TipSpecUniversalSchema.parse(repaired);
                return { spec: validated, source: 'llm-repaired' };
            }
            catch (repairError) {
                throw new Error(`Repair attempt failed: ${repairError}`);
            }
        }
        throw error;
    }
}
exports.normalizeTipToSpec = normalizeTipToSpec;
/**
 * Convert TipSpecUniversal to implementation block (A/B/C/D/E format)
 */
function specToImplementationBlock(spec, tipTitle) {
    const blocks = [];
    // A) Goal
    blocks.push(`A) Goal:`);
    blocks.push(`   ${spec.goal}`);
    // B) Steps (from learner_actions)
    blocks.push(`\nB) Steps:`);
    spec.learner_actions.forEach((action, idx) => {
        blocks.push(`   ${idx + 1}. ${action}`);
    });
    // C) Deliverables
    blocks.push(`\nC) Deliverables:`);
    spec.deliverables.forEach((deliverable, idx) => {
        blocks.push(`   - ${deliverable}`);
    });
    // D) Quality criteria
    blocks.push(`\nD) Quality criteria:`);
    spec.quality_criteria.forEach((criterion, idx) => {
        blocks.push(`   ${idx + 1}. ${criterion.name}: ${criterion.whatToCheck}`);
    });
    // E) Anti-generic checklist
    blocks.push(`\nE) Anti-generic checklist:`);
    spec.anti_generic_rules.forEach((rule, idx) => {
        blocks.push(`   - [ ] ${rule}`);
    });
    // If ai_mode present: require measurable AI deliverable(s)
    if (spec.ai_mode) {
        blocks.push(`\nF) AI Mode Requirements (${spec.ai_mode}):`);
        switch (spec.ai_mode) {
            case 'comparison':
                blocks.push(`   - Must include Prompt A and Prompt B`);
                blocks.push(`   - Must include comparison table`);
                blocks.push(`   - Must include final decision paragraph`);
                if (spec.aiTools && spec.aiTools.length >= 2) {
                    blocks.push(`   - Tools: ${spec.aiTools.join(' and ')}`);
                }
                break;
            case 'reflection':
                blocks.push(`   - Must include critical reflection deliverable`);
                blocks.push(`   - Must document AI interaction (screenshots/transcripts)`);
                blocks.push(`   - Must analyze AI responses critically`);
                break;
            case 'required':
                blocks.push(`   - AI usage is mandatory`);
                blocks.push(`   - Must document AI usage`);
                break;
            case 'optional':
                blocks.push(`   - AI usage is optional`);
                blocks.push(`   - If used, must document and reflect`);
                break;
        }
    }
    // Constraints
    if (spec.constraints.length > 0) {
        blocks.push(`\nConstraints:`);
        spec.constraints.forEach((constraint, idx) => {
            blocks.push(`   ${idx + 1}. ${constraint}`);
        });
    }
    return blocks.join('\n');
}
exports.specToImplementationBlock = specToImplementationBlock;
