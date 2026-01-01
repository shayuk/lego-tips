/**
 * Local Fallback Module for Assignment Generation
 * 
 * This module provides a safe, structured fallback assignment when server-side
 * AI generation fails entirely (network errors, all providers down, etc.).
 * 
 * This is ONLY used as a last resort when:
 * - Server call fails after retries (transient network failures)
 * - All AI providers on server are unavailable
 * - Complete server failure
 */

export interface FallbackAssignment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
  estimatedHours?: number;
  difficulty?: string;
  generatedAt: string;
}

export interface FallbackRubricCriteria {
  name: string;
  description: string;
  levels: string[];
}

export interface FallbackResult {
  assignment: FallbackAssignment;
  rubricCriteria: FallbackRubricCriteria[];
  rubricHtml: string;
}

/**
 * Build a structured fallback assignment when server generation fails
 * 
 * @param courseName - Name of the course
 * @param faculty - Faculty name (optional)
 * @param department - Department name (optional)
 * @param selectedMethods - Array of selected pedagogical methods
 * @param reason - Reason for fallback (for logging/debugging)
 * @returns Structured fallback assignment with rubric
 */
export function buildLocalFallbackAssignment(
  courseName: string,
  faculty: string | undefined,
  department: string | undefined,
  selectedMethods: Array<{ title?: string; description?: string }>,
  reason: string = 'Server generation failed'
): FallbackResult {
  const methodTitles = selectedMethods.map(m => m.title || 'שיטה פדגוגית').join(', ');
  
  // Enhanced instructions based on selected methods
  const instructions: string[] = [
    'קראו בעיון את כל החומרים הנדרשים לקורס',
    'נתחו את הנושא בצורה ביקורתית ועמוקה',
    'השתמשו במקורות אקדמיים מהימנים בלבד'
  ];

  // Add method-specific instructions
  selectedMethods.forEach(method => {
    if (method.title?.includes('AI רפלקציה')) {
      instructions.push(
        'השתמשו בכלי AI לחקר ראשוני של הנושא',
        'תעדו את כל השיח עם ה-AI במלואו',
        'כתבו רפלקציה מעמיקה (300+ מילים) על תובנות ה-AI ומה שחסר לו'
      );
    }
    
    if (method.title?.includes('עבודה קבוצתית') || method.title?.includes('עבודה בקבוצות')) {
      instructions.push(
        'התארגנו בקבוצות של 3-4 סטודנטים',
        'חלקו את העבודה באופן שווה בין חברי הקבוצה',
        'תעדו את תהליך קבלת ההחלטות הקבוצתיות'
      );
    }

    if (method.title?.includes('הערכת עמיתים')) {
      instructions.push(
        'העריכו את עבודות העמיתים לפי המחוון המסופק',
        'ספקו משוב בונה ומפורט',
        'התייחסו לכל הקריטריונים במחוון'
      );
    }

    if (method.title?.includes('רפלקציה')) {
      instructions.push(
        'כתבו רפלקציה אישית על תהליך הלמידה',
        'קשרו את החוויה למטרות הקורס',
        'השתמשו בשאלות מנחות מהקורס'
      );
    }
  });

  instructions.push(
    'כתבו את העבודה במבנה אקדמי ברור עם מבוא, גוף ומסקנות',
    'הגישו את העבודה במועד שנקבע'
  );

  const assignment: FallbackAssignment = {
    title: `מטלה אינטגרטיבית מתקדמת - ${courseName}`,
    description: `מטלה זו משלבת מספר גישות פדגוגיות כדי להעריך את הבנתכם בחומר הנלמד באופן מעמיק ומקיף. השיטות הנבחרות: ${methodTitles}`,
    instructions,
    requirements: [
      'אורך: 8-12 עמודים',
      'גופן: David או Arial, גודל 12',
      'לפחות 8 מקורות אקדמיים',
      'ציטוט לפי תקן APA',
      'הגשה עד לתאריך הנקוב'
    ],
    estimatedHours: 25,
    difficulty: 'בינוני',
    generatedAt: new Date().toISOString()
  };

  const rubricCriteria = buildFallbackRubric(selectedMethods);
  const rubricHtml = generateFallbackRubricHtml(rubricCriteria);

  console.log(`[Local Fallback] Generated fallback assignment for ${courseName}. Reason: ${reason}`);

  return {
    assignment,
    rubricCriteria,
    rubricHtml
  };
}

/**
 * Build fallback rubric criteria based on selected methods
 */
export function buildFallbackRubric(
  selectedMethods: Array<{ title?: string; description?: string }>
): FallbackRubricCriteria[] {
  const criteria: FallbackRubricCriteria[] = [
    {
      name: 'איכות תוכן',
      description: 'עומק הניתוח ורמת ההבנה',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    },
    {
      name: 'מקורות ומחקר',
      description: 'איכות המקורות ושימוש נכון בהם',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    },
    {
      name: 'כתיבה אקדמית',
      description: 'רמת הכתיבה והביטוי האקדמי',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    }
  ];

  // Add method-specific criteria
  selectedMethods.forEach(method => {
    if (method.title?.includes('AI רפלקציה')) {
      criteria.push({
        name: 'רפלקציה על AI',
        description: 'איכות הניתוח הביקורתי של תגובות ה-AI',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
    if (method.title?.includes('עבודה קבוצתית') || method.title?.includes('עבודה בקבוצות')) {
      criteria.push({
        name: 'שיתוף פעולה',
        description: 'יעילות העבודה הקבוצתית והחלוקה ההוגנת',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
    if (method.title?.includes('הערכת עמיתים')) {
      criteria.push({
        name: 'איכות הערכת עמיתים',
        description: 'מקצועיות ההערכה והמשוב הבונה',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
    if (method.title?.includes('רפלקציה')) {
      criteria.push({
        name: 'רפלקציה אישית',
        description: 'עומק הרפלקציה והקישור האישי',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
  });

  return criteria;
}

/**
 * Generate HTML for fallback rubric
 */
export function generateFallbackRubricHtml(criteria: FallbackRubricCriteria[]): string {
  return `
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
        <small><strong>נוצר באמצעות:</strong> מערכת גיבוי מאובטחת | <strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</small>
      </div>
    </div>
  `;
}

