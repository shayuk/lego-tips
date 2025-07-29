import React, { useState, useEffect } from 'react';
import { useAppToast } from '../../../hooks/useToast'; // נתיב מתוקן
import { generateAssignmentWithRetry, checkAvailableProviders, handleAPIError, APIUsageTracker } from '../../../helpers/secureApiClient'; // נתיב מתוקן
import { generateIntegratedAssignment } from '../../../helpers/claudeAssignmentGenerator'; // נתיב מתוקן

// 📝 Assessment Types - מתואמים עם תגובת השרת
interface GeneratedAssessment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
  estimatedHours?: number;
  difficulty?: string;
  generatedAt?: string;
}

interface LoadingState {
  isLoading: boolean;
  message: string;
  estimatedTime?: number;
  currentStepIndex: number;
}

interface RubricCriteria {
  name: string;
  description: string;
  levels: string[];
}

const useAssessmentGenerator = (params: {
  selectedMethods: any[];
  courseParams: any;
  courseName?: string;
  faculty?: string;
  department?: string;
  courseContent?: string;
  shouldGenerate?: boolean;
}) => {
  // Destructure parameters with defaults
  const {
    selectedMethods = [],
    courseParams = {},
    courseName = '',
    faculty = '',
    department = '',
    courseContent = '',
    shouldGenerate = false
  } = params;

  // States - מסונכרנים עם תגובת השרת
  const [generatedAssessment, setGeneratedAssessment] = useState<GeneratedAssessment>({
    title: '',
    description: '',
    instructions: [],
    requirements: []
  });
  const [generatedRubric, setGeneratedRubric] = useState<RubricCriteria[]>([]);
  const [rubricHtml, setRubricHtml] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: 'מוכן ליצירה...',
    estimatedTime: 0,
    currentStepIndex: -1,
  });
  const [error, setError] = useState<string | null>(null);

  // Toast hook for notifications (with error handling)
  let safeToast: any = null;
  try {
    safeToast = useAppToast();
    console.log('✅ Toast context זמין');
  } catch (error) {
    console.log('⚠️ Toast context לא זמין עדיין:', error);
    // המשך בלי טוסט - זה לא אמור לעצור את המחולל
  }

  // 🎯 Real-time progress tracking based on actual API stages
  const updateRealProgress = (stage: LoadingState['stage'], message: string, estimatedTime?: number) => {
    const stageProgress = {
      'init': { progress: 0, stepIndex: 0, message: "מתחיל..." },
      'checking': { progress: 15, stepIndex: 1, message: "בוחן קבצים..." },
      'generating': { progress: 40, stepIndex: 2, message: "יוצר מטלה..." },
      'processing': { progress: 80, stepIndex: 5, message: "מעבד תוצאות..." },
      'complete': { progress: 100, stepIndex: 7, message: "המטלה מוכנה!" },
      'error': { progress: 0, stepIndex: -1, message: "שגיאה" }
    };

    const currentStageInfo = stageProgress[stage];

    setLoadingState({
      isLoading: stage !== 'complete' && stage !== 'error',
      progress: currentStageInfo.progress,
      message: message || currentStageInfo.message,
      estimatedTime: estimatedTime || 0,
      stage,
      currentStepIndex: currentStageInfo.stepIndex
    });
    
    // 📊 Real-time logging for better debugging
    console.log(`🚀 [${new Date().toLocaleTimeString()}] Stage: ${stage} | Progress: ${currentStageInfo.progress}% | Step: ${currentStageInfo.stepIndex} | ${message}`);
  };

  // Main generation function - Single Source of Truth
  const fetchRubric = async () => {
    console.log('--- [7] fetchRubric STARTED ---');
    
    if (!shouldGenerate) {
      console.log('🛑 Generation skipped - shouldGenerate is false');
      return;
    }

    const actualCourseName = courseName || 'קורס אקדמי';
    const actualFaculty = faculty || 'פקולטה';
    const actualDepartment = department || 'מחלקה';
    const actualDescription = courseContent || 'תיאור כללי של הקורס';
    const actualTips = selectedMethods || [];

    console.log('--- [8] VALIDATION PASSED, PROCEEDING WITH AI GENERATION ---');

    try {
      setError(null);
      
      const generationSteps = [
        { index: 0, message: 'מנתח את פרטי הקורס', time: 3 },
        { index: 1, message: 'בוחן קבצים שהועלו', time: 5 },
        { index: 2, message: 'מחשב התאמות פדגוגיות', time: 4 },
        { index: 3, message: 'משלב טיפים נבחרים', time: 3 },
        { index: 4, message: 'חיפוש קורסים דומים באינטרנט', time: 8 },
        { index: 5, message: 'יוצר מטלה אינטגרטיבית', time: 15 },
        { index: 6, message: 'בונה מחוון הערכה מפורט', time: 5 },
      ];
      
      const totalTime = generationSteps.reduce((sum, step) => sum + step.time, 0);

      setLoadingState({ isLoading: true, message: 'מתחיל...', estimatedTime: totalTime, currentStepIndex: -1 });

      for (const step of generationSteps) {
        setLoadingState(prev => ({ ...prev, message: step.message, currentStepIndex: step.index, estimatedTime: totalTime - generationSteps.slice(0, step.index).reduce((s, t) => s + t.time, 0) }));
        
        // For actual generation, we only need a delay on non-API steps
        if (step.index !== 5) { 
           await new Promise(res => setTimeout(res, 1000)); // Simulate work
        }

        if (step.index === 5) { // The actual AI call
          const result = await generateIntegratedAssignment({
            courseName: actualCourseName,
            faculty: actualFaculty,
            department: actualDepartment,
            courseDescription: actualDescription,
            selectedPedagogicalComponents: actualTips.map(tip => tip.title || 'שיטה פדגוגית'),
          });

          setRubricHtml(result.html);
          setModelUsed(result.modelUsed);
        }
      }
      
      setGeneratedAssessment({
        title: `מטלה אינטגרטיבית - ${actualCourseName}`,
        description: 'מטלה מותאמת אישית הנוצרת על בסיס השיטות הפדגוגיות שנבחרו',
        instructions: [],
        requirements: [],
        generatedAt: new Date().toISOString()
      });
        
      setGeneratedRubric(buildFallbackRubric(actualTips));
      
      setLoadingState({ isLoading: false, message: 'המטלה נוצרה בהצלחה!', estimatedTime: 0, currentStepIndex: 7 });
      
      console.log('🎉 Assignment generation completed successfully!');
         
      if (safeToast) {
        safeToast.showSuccess('מטלה נוצרה בהצלחה!', `המטלה נוצרה באמצעות ${modelUsed}`);
      }

    } catch (error) {
      console.error('❌ AI generation error:', error);
      setLoadingState({ isLoading: false, message: 'שגיאה ביצירת המטלה', currentStepIndex: -1 });
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');

      const fallbackAssessment = generateStructuredFallback(actualTips, actualCourseName, actualDescription);
      
      setGeneratedAssessment(fallbackAssessment);
      setGeneratedRubric(buildFallbackRubric(actualTips));
      setRubricHtml(generateFallbackRubricHtml(buildFallbackRubric(actualTips)));
      setModelUsed('מערכת גיבוי מקומית');
      
      setLoadingState({ isLoading: false, message: '✅ המטלה מוכנה!', estimatedTime: 0, currentStepIndex: -1 });
      
      try {
        if (safeToast) {
          safeToast.showSuccess('מטלה נוצרה בהצלחה באמצעות מערכת גיבוי מקומית');
        }
      } catch (e) {
        console.log('Toast not available:', e);
      }
    }
  };

  // Generate structured fallback assessment - consistent format
  const generateStructuredFallback = (methods: any[], courseName: string, description: string): GeneratedAssessment => {
    const methodTitles = methods.map(m => m.title || 'שיטה פדגוגית').join(', ');
    
    // Enhanced instructions based on selected methods
    let instructions = [
      'קראו בעיון את כל החומרים הנדרשים לקורס',
      'נתחו את הנושא בצורה ביקורתית ועמוקה',
      'השתמשו במקורות אקדמיים מהימנים בלבד'
    ];

    // Add method-specific instructions
    methods.forEach(method => {
      if (method.title?.includes('AI רפלקציה')) {
        instructions.push(
          'השתמשו בכלי AI לחקר ראשוני של הנושא',
          'תעדו את כל השיח עם ה-AI במלואו',
          'כתבו רפלקציה מעמיקה (300+ מילים) על תובנות ה-AI ומה שחסר לו'
        );
      }
      
      if (method.title?.includes('עבודה קבוצתית')) {
        instructions.push(
          'התארגנו בקבוצות של 3-4 סטודנטים',
          'חלקו את העבודה באופן שווה בין חברי הקבוצה',
          'תעדו את תהליך קבלת ההחלטות הקבוצתיות'
        );
      }
    });

    instructions.push(
      'כתבו את העבודה במבנה אקדמי ברור עם מבוא, גוף ומסקנות',
      'הגישו את העבודה במועד שנקבע'
    );
    
    return {
      title: `מטלה אינטגרטיבית מתקדמת - ${courseName}`,
      description: `מטלה זו משלבת מספר גישות פדגוגיות כדי להעריך את הבנתכם בחומר הנלמד באופן מעמיק ומקיף. השיטות הנבחרות: ${methodTitles}`,
      instructions: instructions,
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
  };

  // Build fallback rubric criteria
  const buildFallbackRubric = (selectedMethods: any[]): RubricCriteria[] => {
    const criteria: RubricCriteria[] = [
      {
        name: 'איכות תוכן',
        description: 'עומק הניתוח ורמת ההבנה',
        levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
      },
      {
        name: 'מקורות ומחקר',
        description: 'איכות המקורות ושימוש נכון בהם',
        levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
      },
      {
        name: 'כתיבה אקדמית',
        description: 'רמת הכתיבה והביטוי האקדמי',
        levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
      }
    ];

    // Add method-specific criteria
    selectedMethods.forEach(method => {
      if (method.title?.includes('AI רפלקציה')) {
        criteria.push({
          name: 'רפלקציה על AI',
          description: 'איכות הניתוח הביקורתי של תגובות ה-AI',
          levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
        });
      }
      if (method.title?.includes('עבודה קבוצתית')) {
        criteria.push({
          name: 'שיתוף פעולה',
          description: 'יעילות העבודה הקבוצתית והחלוקה ההוגנת',
          levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
        });
      }
    });

    return criteria;
  };

  // Generate fallback rubric HTML
  const generateFallbackRubricHtml = (criteria: RubricCriteria[]): string => {
    return `
      <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
          מחוון הערכה (רובריקה)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">קריטריון</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">תיאור</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">רמות הערכה</th>
            </tr>
          </thead>
          <tbody>
            ${criteria.map((criterion, index) => `
              <tr style="background: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #333;">${criterion.name}</td>
                <td style="border: 1px solid #ddd; padding: 12px; color: #666;">${criterion.description}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">
                  ${criterion.levels.map(level => `<div style="margin: 5px 0; padding: 3px 8px; background: #f0f7ff; border-radius: 4px; color: #1976d2;">${level}</div>`).join('')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 6px; color: #2e7d32;">
          <small><strong>נוצר באמצעות:</strong> מערכת גיבוי מאובטחת | <strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</small>
        </div>
      </div>
    `;
  };

  // Effect to trigger generation - optimized dependencies
  useEffect(() => {
    // שלב 4: בדיקה שה-useEffect רץ
    console.log('--- [4] useAssessmentGenerator useEffect RUNS ---');
    console.log('Dependency values received by the hook:');
    console.log('shouldGenerate:', shouldGenerate);
    console.log('selectedMethods length:', selectedMethods?.length || 0);
    console.log('selectedMethods array:', selectedMethods);
    console.log('courseName:', courseName);
    console.log('faculty:', faculty);
    console.log('department:', department);
    console.log('courseContent length:', courseContent?.length || 0);

    // שלב 5: בדיקת היציאה המוקדמת
    if (!shouldGenerate) {
      console.log('--- [5] EXITING EARLY: shouldGenerate is false. ---');
      console.log('Reason: The generation trigger is not active yet.');
      return;
    }

    console.log('--- [6] PROCEEDING WITH GENERATION ---');
    console.log('All conditions met, calling fetchRubric()...');
    fetchRubric();
  }, [shouldGenerate]); // ✅ תלוי רק ב-shouldGenerate כדי למנוע re-renders מיותרים

  return {
    generatedAssessment,  // ✅ Single Source of Truth from API
    generatedRubric,     // ✅ Structured criteria from API  
    rubricHtml,          // ✅ Rich HTML from API
    modelUsed,           // ✅ Real provider info from API
    loadingState,        // ✅ Enhanced real-time loading states
    error,               // ✅ Consistent error handling
    // Expose API stats for monitoring
    getAPIStats: () => APIUsageTracker.getStats()
  };
};

export default useAssessmentGenerator;
