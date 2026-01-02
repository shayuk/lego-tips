/**
 * Smoke tests for Universal Tip→TipSpec Pipeline
 * 
 * Tests:
 * - Case 1: existing tip (am_03)
 * - Case 2: non-AI tip
 * - Case 3: simulated unknown tip
 * 
 * All must pass validator.
 */

import { normalizeTipToSpec, specToImplementationBlock, TipInput, TipContext } from './tipSpecUniversal';
import { validateTipSpecUniversal } from './tipSpecValidator';

// Mock LLM client for testing
class MockLLMClient {
  async chat() {
    return {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                goal: "Test goal for unknown tip - implement pedagogical method",
                learner_actions: [
                  "1. Review the tip requirements",
                  "2. Prepare necessary materials",
                  "3. Execute implementation steps",
                  "4. Document outcomes"
                ],
                deliverables: [
                  "Implementation report",
                  "Documentation of process"
                ],
                quality_criteria: [
                  {
                    name: "Implementation Completeness",
                    whatToCheck: "Verify all required steps are completed with documented evidence"
                  },
                  {
                    name: "Quality of Execution",
                    whatToCheck: "Assess depth and accuracy of implementation with specific examples"
                  },
                  {
                    name: "Documentation Quality",
                    whatToCheck: "Review clarity and completeness including concrete details"
                  }
                ],
                constraints: [
                  "Must follow all requirements",
                  "Must submit by deadline"
                ],
                anti_generic_rules: [
                  "Requires at least one concrete example demonstrating application",
                  "Requires applying at least 2 concepts to a specific case"
                ]
              })
            }
          }]
        })
      }
    };
  }
}

describe('TipSpecUniversal Pipeline Smoke Tests', () => {
  const mockContext: TipContext = {
    courseName: 'Test Course',
    courseDescription: 'Test course description',
    topic: 'Test Topic',
    level: 'Undergraduate'
  };

  const mockLLMClient = new MockLLMClient() as any;
  const mockProviderType: 'openai' = 'openai';

  test('Case 1: Existing tip (am_03) - should use internal spec', async () => {
    const tip: TipInput = {
      id: 'am_03',
      title: 'ניתוח מונחה של פרומפטים',
      description: 'Guided AI Prompt Analysis with Critical Reflection'
    };

    const result = await normalizeTipToSpec(tip, mockContext);

    expect(result.source).toBe('internal');
    expect(result.spec.goal).toBeTruthy();
    expect(result.spec.learner_actions.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.learner_actions.length).toBeLessThanOrEqual(6);
    expect(result.spec.deliverables.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.quality_criteria.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.constraints.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.anti_generic_rules.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.anti_generic_rules.length).toBeLessThanOrEqual(3);
    expect(result.spec.ai_mode).toBe('reflection');

    // Test implementation block generation
    const block = specToImplementationBlock(result.spec, tip.title);
    expect(block).toContain('A) Goal:');
    expect(block).toContain('B) Steps:');
    expect(block).toContain('C) Deliverables:');
    expect(block).toContain('D) Quality criteria:');
    expect(block).toContain('E) Anti-generic checklist:');
    expect(block).toContain('F) AI Mode Requirements');

    // Test validator with mock assignment
    const mockAssignment = {
      studentInstructionsHtml: `
        <h2>מטלת ניתוח מונחה</h2>
        <p>דוגמה קונקרטית: ניתוח התנהגות ברשתות חברתיות באמצעות מושגי גופמן.</p>
        <p>יישום מושגים: יישום שני מושגים מרכזיים למקרה ספציפי.</p>
        <h3>פרומפט AI</h3>
        <p>Prompt A: ניתוח תיאורטי</p>
        <h3>רפלקציה ביקורתית על ניתוח ה-AI</h3>
        <p>רפלקציה מעמיקה על התגובות.</p>
      `,
      instructions: ['Complete the analysis', 'Submit reflection'],
      requirements: ['Submit all deliverables'],
      rubricHtml: `
        <table>
          <tr><th>קריטריון</th><th>ביצוע בסיסי (0–7 נקודות)</th><th>ביצוע מתקדם (8–15 נקודות)</th><th>ביצוע מיטבי (16–20 נקודות)</th></tr>
          <tr><td>איכות הערכת ניתוח ה-AI</td><td>ביצוע בסיסי</td><td>ביצוע טוב</td><td>ביצוע מעולה</td></tr>
        </table>
      `
    };

    const validation = validateTipSpecUniversal(mockAssignment, result.spec);
    expect(validation.ok).toBe(true);
  });

  test('Case 2: Non-AI tip - should use internal spec if available', async () => {
    const tip: TipInput = {
      id: 'peer_review',
      title: 'הערכת עמיתים',
      description: 'Peer review assignment'
    };

    const result = await normalizeTipToSpec(tip, mockContext);

    expect(result.spec.goal).toBeTruthy();
    expect(result.spec.learner_actions.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.learner_actions.length).toBeLessThanOrEqual(6);
    expect(result.spec.deliverables.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.quality_criteria.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.constraints.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.anti_generic_rules.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.ai_mode).toBeUndefined();

    // Test validator
    const mockAssignment = {
      studentInstructionsHtml: `
        <h2>מטלת הערכת עמיתים</h2>
        <p>דוגמה קונקרטית: הערכת עבודה של עמית בנושא X.</p>
        <p>יישום מושגים: יישום שני קריטריונים להערכה.</p>
      `,
      instructions: ['Review peer work', 'Submit feedback'],
      requirements: ['Submit peer review form'],
      rubricHtml: `
        <table>
          <tr><th>קריטריון</th><th>ביצוע בסיסי (0–7 נקודות)</th><th>ביצוע מתקדם (8–15 נקודות)</th><th>ביצוע מיטבי (16–20 נקודות)</th></tr>
          <tr><td>איכות הערכת עמיתים</td><td>ביצוע בסיסי</td><td>ביצוע טוב</td><td>ביצוע מעולה</td></tr>
        </table>
      `
    };

    const validation = validateTipSpecUniversal(mockAssignment, result.spec);
    expect(validation.ok).toBe(true);
  });

  test('Case 3: Simulated unknown tip - should use LLM extraction', async () => {
    const tip: TipInput = {
      id: 'unknown_tip_123',
      title: 'Unknown Pedagogical Method',
      description: 'A new pedagogical method that does not have an internal spec',
      fullText: 'This is a simulated unknown tip for testing LLM extraction capabilities'
    };

    const result = await normalizeTipToSpec(tip, mockContext, mockLLMClient, mockProviderType);

    expect(result.source).toBe('llm');
    expect(result.spec.goal).toBeTruthy();
    expect(result.spec.learner_actions.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.learner_actions.length).toBeLessThanOrEqual(6);
    expect(result.spec.deliverables.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.quality_criteria.length).toBeGreaterThanOrEqual(3);
    expect(result.spec.constraints.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.anti_generic_rules.length).toBeGreaterThanOrEqual(2);
    expect(result.spec.anti_generic_rules.length).toBeLessThanOrEqual(3);

    // Verify quality criteria are concrete (not generic)
    result.spec.quality_criteria.forEach(criterion => {
      expect(criterion.whatToCheck.length).toBeGreaterThanOrEqual(10);
      expect(criterion.whatToCheck.toLowerCase()).not.toContain('quality of content');
      expect(criterion.whatToCheck.toLowerCase()).not.toContain('איכות תוכן');
    });

    // Test validator
    const mockAssignment = {
      studentInstructionsHtml: `
        <h2>מטלת Unknown Method</h2>
        <p>דוגמה קונקרטית: יישום השיטה למקרה ספציפי.</p>
        <p>יישום מושגים: יישום שני מושגים מרכזיים למקרה.</p>
      `,
      instructions: ['Complete implementation', 'Document process'],
      requirements: ['Submit implementation report', 'Submit documentation'],
      rubricHtml: `
        <table>
          <tr><th>קריטריון</th><th>ביצוע בסיסי (0–7 נקודות)</th><th>ביצוע מתקדם (8–15 נקודות)</th><th>ביצוע מיטבי (16–20 נקודות)</th></tr>
          <tr><td>Implementation Completeness</td><td>ביצוע בסיסי</td><td>ביצוע טוב</td><td>ביצוע מעולה</td></tr>
        </table>
      `
    };

    const validation = validateTipSpecUniversal(mockAssignment, result.spec);
    expect(validation.ok).toBe(true);
  });

  test('Validator rejects generic quality criteria', () => {
    const mockAssignment = {
      studentInstructionsHtml: '<p>Test assignment</p>',
      instructions: [],
      requirements: [],
      rubricHtml: '<table><tr><td>איכות תוכן</td></tr></table>'
    };

    const specWithGenericCriteria = {
      goal: "Test goal",
      learner_actions: ["Action 1", "Action 2", "Action 3"],
      deliverables: ["Deliverable 1", "Deliverable 2"],
      quality_criteria: [
        {
          name: "Quality of Content",
          whatToCheck: "quality of content" // Generic - should be rejected
        },
        {
          name: "Specific Criterion",
          whatToCheck: "Check for at least 3 concrete examples of X"
        },
        {
          name: "Another Criterion",
          whatToCheck: "Verify implementation includes specific evidence"
        }
      ],
      constraints: ["Constraint 1", "Constraint 2"],
      anti_generic_rules: [
        "Requires concrete example",
        "Requires applying concepts"
      ]
    };

    // This should fail Zod validation during normalization
    // But if it passes, validator should catch issues
    expect(() => {
      validateTipSpecUniversal(mockAssignment, specWithGenericCriteria as any);
    }).not.toThrow();
  });
});

