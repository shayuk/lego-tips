import React, { useState, useEffect } from 'react';
import { useToast } from '../../../helpers/useToast';
import { generateAssignmentWithRetry, checkAvailableProviders, handleAPIError, APIUsageTracker, checkServerHealth, isProduction, ScholarlySource, MaterialQualityReport } from '../../../helpers/secureApiClient';
import { buildLocalFallbackAssignment, buildFallbackRubric, generateFallbackRubricHtml } from '../lib/localFallback';

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
  progress: number;
  stage: 'init' | 'checking' | 'generating' | 'processing' | 'complete' | 'error';
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
  const [groundingMode, setGroundingMode] = useState<"uploaded" | "web" | "hybrid" | undefined>(undefined);
  const [sourcesUsed, setSourcesUsed] = useState<ScholarlySource[]>([]);
  const [apa7References, setApa7References] = useState<string[]>([]);
  const [materialQualityReport, setMaterialQualityReport] = useState<MaterialQualityReport | undefined>(undefined);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: 'מוכן ליצירה...',
    estimatedTime: 0,
    currentStepIndex: -1,
    progress: 0,
    stage: 'init',
  });
  const [error, setError] = useState<string | null>(null);

  // Toast hook for notifications
  const safeToast = useToast();

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

  // Main generation function - Using Secure Backend Proxy
  const fetchRubric = async () => {
    console.log('--- [7] fetchRubric STARTED (Secure Backend Proxy) ---');
    
    if (!shouldGenerate) {
      console.log('🛑 Generation skipped - shouldGenerate is false');
      return;
    }

    const actualCourseName = courseName || 'קורס אקדמי';
    const actualFaculty = faculty || 'פקולטה';
    const actualDepartment = department || 'מחלקה';
    const actualDescription = courseContent || 'תיאור כללי של הקורס';
    const actualTips = selectedMethods || [];

    console.log('--- [8] VALIDATION PASSED, PROCEEDING WITH SECURE AI GENERATION ---');

    try {
      setError(null);
      
      // Step 1: Check server health (ONLY in development - NEVER in production)
      // In production, Firebase Functions are used directly, no health check needed
      if (!isProduction()) {
        updateRealProgress('checking', 'בודק חיבור לשרת המאובטח על פורט 3001...', 5);
        try {
          const health = await checkServerHealth();
          console.log('✅ Server health check passed:', health);
        } catch (healthError) {
          console.warn('⚠️ Server health check failed, but continuing...', healthError);
          // Use the error message from secureApiClient which includes helpful instructions
          const errorMsg = healthError instanceof Error 
            ? healthError.message 
            : 'השרת המאובטח לא זמין. ודא שהשרת פועל על פורט 3001. הרץ: cd server && npm start';
          setError(errorMsg);
          if (safeToast) {
            safeToast.showError('בעיית חיבור', errorMsg);
          }
          // Continue with fallback
          throw new Error(errorMsg);
        }
      } else {
        // In production, NEVER call checkServerHealth() - Firebase Functions don't need health checks
        console.log('Production mode: using Firebase Functions (no localhost health check)');
      }

      // Step 2: Check available providers
      updateRealProgress('checking', isProduction() ? 'בודק זמינות שירותי Firebase Functions...' : 'בודק זמינות שירותי AI על פורט 3001...', 10);
      const providers = await checkAvailableProviders();
      console.log('📊 Available providers:', providers);
      
      if (!providers.openai && !providers.claude) {
        const errorMsg = isProduction()
          ? 'שירותי AI לא זמינים ב-Firebase Functions. אנא ודא שמפתחות OPENAI_KEY או CLAUDE_API_KEY הוגדרו ב-Firebase Functions.'
          : 'שירותי AI לא זמינים. אנא ודא שמפתחות OPENAI_KEY או CLAUDE_API_KEY הוגדרו בשרת על פורט 3001.';
        throw new Error(errorMsg);
      }

      // Step 3: Prepare generation parameters
      updateRealProgress('generating', 'מכין פרמטרים ליצירת מטלה...', 20);
      
      const generationParams = {
        courseName: actualCourseName,
        faculty: actualFaculty,
        department: actualDepartment,
        courseDescription: actualDescription,
        selectedMethods: actualTips.map(tip => ({
          title: tip.title || 'שיטה פדגוגית',
          description: tip.description || ''
        })),
        preferredProvider: 'openai' as 'openai'
      };

      // Step 4: Generate assignment via secure backend (Firebase Functions)
      updateRealProgress('generating', isProduction() ? 'יוצר מטלה באמצעות Firebase Functions...' : 'יוצר מטלה באמצעות Firebase Functions (פיתוח)...', 50);
      
      // Log AI generation event (non-blocking)
      import("../../../analytics/analyticsLogger").then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent("ai_generate", {
          courseName: actualCourseName,
          faculty: actualFaculty,
          department: actualDepartment,
          tipCount: actualTips.length,
          provider: generationParams.preferredProvider,
        });
      }).catch((logError) => {
        console.warn("Failed to log AI generation event:", logError);
      });

      const result = await generateAssignmentWithRetry(generationParams, 2);
      
      // Step 5: Process structured response
      updateRealProgress('processing', 'מעבד את התוצאות...', 80);
      
      if (!result.success || !result.data) {
        throw new Error('תגובה לא תקינה מהשרת');
      }

      const assignmentData = result.data;
      
      // Set structured assessment data
      setGeneratedAssessment({
        title: assignmentData.title || `מטלה אינטגרטיבית - ${actualCourseName}`,
        description: assignmentData.description || 'מטלה מותאמת אישית',
        instructions: assignmentData.instructions || [],
        requirements: assignmentData.requirements || [],
        estimatedHours: assignmentData.estimatedHours,
        difficulty: assignmentData.difficulty,
        generatedAt: assignmentData.generatedAt || new Date().toISOString()
      });

      // Set rubric data
      if (assignmentData.rubricCriteria && assignmentData.rubricCriteria.length > 0) {
        setGeneratedRubric(assignmentData.rubricCriteria);
      } else {
        setGeneratedRubric(buildFallbackRubric(actualTips));
      }

      // Set rubric HTML
      if (assignmentData.rubricHtml) {
        setRubricHtml(assignmentData.rubricHtml);
      } else {
        setRubricHtml(generateFallbackRubricHtml(assignmentData.rubricCriteria || buildFallbackRubric(actualTips)));
      }

      // Set model used (use providerUsed if available, fallback to provider for backward compatibility)
      const providerName = result.providerUsed || result.provider || assignmentData.modelUsed || 'Unknown';
      setModelUsed(providerName);

      // Set grounding metadata
      if (assignmentData.groundingMode) {
        setGroundingMode(assignmentData.groundingMode);
      }
      if (assignmentData.sourcesUsed && assignmentData.sourcesUsed.length > 0) {
        setSourcesUsed(assignmentData.sourcesUsed);
      }
      if (assignmentData.apa7References && assignmentData.apa7References.length > 0) {
        setApa7References(assignmentData.apa7References);
      }
      if (assignmentData.materialQualityReport) {
        setMaterialQualityReport(assignmentData.materialQualityReport);
      }

      // Track successful API call
      APIUsageTracker.track('/api/generate-assignment', true, providerName);

      updateRealProgress('complete', 'המטלה נוצרה בהצלחה!', 100);
      
      console.log('🎉 Assignment generation completed successfully!', {
        providerUsed: providerName,
        attempts: result.attempts,
        requestId: result.requestId,
        title: assignmentData.title,
        instructionsCount: assignmentData.instructions?.length || 0
      });
         
      if (safeToast) {
        safeToast.showSuccess('מטלה נוצרה בהצלחה!', `המטלה נוצרה באמצעות ${providerName}`);
      }

    } catch (error) {
      console.error('❌ AI generation error:', error);
      
      // Track failed API call
      APIUsageTracker.track('/api/generate-assignment', false);

      // Log error to analytics (non-blocking)
      import("../../../analytics/analyticsLogger").then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent("error", {
          message: error instanceof Error ? error.message : 'שגיאה לא ידועה',
          context: "ai_generation",
          courseName: actualCourseName,
        });
      }).catch((logError) => {
        console.warn("Failed to log error:", logError);
      });

      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      updateRealProgress('error', 'שגיאה ביצירת המטלה', 0);

      // Use modular local fallback (last resort when server fails)
      const fallbackReason = error instanceof Error ? error.message : 'Unknown error';
      const fallbackResult = buildLocalFallbackAssignment(
        actualCourseName,
        actualFaculty,
        actualDepartment,
        actualTips,
        fallbackReason
      );
      
      setGeneratedAssessment(fallbackResult.assignment);
      setGeneratedRubric(fallbackResult.rubricCriteria);
      setRubricHtml(fallbackResult.rubricHtml);
      setModelUsed('מערכת גיבוי מקומית');
      
      updateRealProgress('complete', '✅ המטלה מוכנה (מערכת גיבוי)', 100);
      
      try {
        if (safeToast) {
          safeToast.showWarning(
            'מערכת גיבוי', 
            'המטלה נוצרה באמצעות מערכת גיבוי מקומית. נסה שוב ליצור מטלה עם AI.'
          );
        }
      } catch (e) {
        console.log('Toast not available:', e);
      }
    }
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
    groundingMode,       // ✅ Grounding mode (uploaded/web/hybrid)
    sourcesUsed,         // ✅ Scholarly sources used
    apa7References,      // ✅ APA7 formatted references
    materialQualityReport, // ✅ Material quality assessment
    // Expose API stats for monitoring
    getAPIStats: () => APIUsageTracker.getStats()
  };
};

export default useAssessmentGenerator;
