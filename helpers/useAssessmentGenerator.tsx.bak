import { useEffect, useMemo, useState } from 'react';

import { useAppToast } from '../components/AppLayout';
import { TOAST_MESSAGES } from './useToast';

import {
  AssessmentMethod,
  CourseParameters,
  RubricCriteria,
} from './assessmentTypes';
import { generateIntegratedAssignment } from './claudeAssignmentGenerator';

interface UseAssessmentGeneratorParams {
  selectedMethods: AssessmentMethod[];
  courseParams: CourseParameters;
  courseName?: string;
  faculty?: string;
  department?: string;
  courseContent?: string;
  shouldGenerate?: boolean; // הוספת פרמטר לשליטה על הפעלה
}

interface GeneratedAssessment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  estimatedTime?: number;
}

interface UseAssessmentGeneratorReturn {
  generatedAssessment: GeneratedAssessment;
  generatedRubric: RubricCriteria[];
  rubricHtml: string;
  modelUsed: string;
  loadingState: LoadingState;
  error: string | null;
}

/**
 * Normalize rubric criteria by removing duplicates and
 * scaling weights so that their sum equals 1.
 */
const normalizeRubricCriteria = (
  criteria: RubricCriteria[]
): RubricCriteria[] => {
  const unique: RubricCriteria[] = [];
  const names = new Set<string>();
  criteria.forEach((c) => {
    if (!names.has(c.name)) {
      unique.push(c);
      names.add(c.name);
    }
  });
  const totalWeight = unique.reduce((sum, c) => sum + c.weight, 0);
  return unique.map((c) => ({
    ...c,
    weight: totalWeight > 0 ? c.weight / totalWeight : 1 / unique.length,
  }));
};

/** Call AI service with a timeout to prevent hanging */
const callAssignmentService = async (params: Parameters<
  typeof generateIntegratedAssignment
>[0]): Promise<{ html: string; modelUsed: string }> => {
  return Promise.race([
    generateIntegratedAssignment(params),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('פג זמן ההמתנה לתשובה מהשרת (60 שניות). אנא נסה שוב.')),
        60000
      )
    ),
  ]);
};

/**
 * Translate an error into a user-friendly Hebrew message,
 * update local state and notify the user via toast.
 */
const handleGenerationError = (
  err: unknown,
  setError: (msg: string) => void,
  setLoadingState: (state: LoadingState) => void,
  toast: ReturnType<typeof useAppToast>
) => {
  console.error('❌ שגיאה ביצירת המטלה:', err);

  let userMessage = 'שגיאה לא צפויה ביצירת המטלה. אנא נסה שוב.';
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('60 שניות') || msg.includes('timeout')) {
      userMessage = '⏰ פג זמן ההמתנה לתשובה מהשרת. השרת עשוי להיות עמוס. אנא נסה שוב.';
    } else if (msg.includes('API') || msg.includes('Claude') || msg.includes('OpenAI')) {
      userMessage = '🔌 בעיה בחיבור לשרת ה-AI. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
    } else if (msg.includes('מפתח')) {
      userMessage = '🔑 בעיה במפתחות ה-API. אנא צור קשר עם מנהל המערכת.';
    } else if (msg.includes('תוכן הקורס')) {
      userMessage = `📝 ${msg}`;
    } else {
      userMessage = `שגיאה ביצירת המטלה: ${msg}`;
    }
  }

  setError(userMessage);
  setLoadingState({ isLoading: false, progress: 0, message: 'שגיאה - נסה שוב' });
  toast.showError(
    TOAST_MESSAGES.ASSESSMENT_GENERATION_ERROR(userMessage).title,
    userMessage,
    true
  );
};

/**
 * Main hook responsible for orchestrating the assessment and rubric generation
 * process. It calls the AI service and manages progress and error states.
 */
export const useAssessmentGenerator = ({
  selectedMethods,
  courseParams,
  courseName,
  faculty,
  department,
  courseContent,
  shouldGenerate = false,
}: UseAssessmentGeneratorParams): UseAssessmentGeneratorReturn => {
  const [rubricHtml, setRubricHtml] = useState<string>("");
  const [modelUsed, setModelUsed] = useState<string>("");
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    estimatedTime: 0
  });
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();

  useEffect(() => {
    console.log('🔍 useAssessmentGenerator useEffect נקרא עם:', {
      selectedMethodsLength: selectedMethods.length,
      shouldGenerate,
      courseName,
      courseContentLength: courseContent?.length || 0
    });

    async function fetchRubric() {
      if (selectedMethods.length === 0 || !shouldGenerate) {
        setRubricHtml('');
        setModelUsed('');
        setLoadingState({ isLoading: false, progress: 0, message: '' });
        setError(null);
        return;
      }

      toast.showInfo(
        TOAST_MESSAGES.ASSESSMENT_GENERATION_START.title,
        TOAST_MESSAGES.ASSESSMENT_GENERATION_START.message
      );
      setError(null);
      setLoadingState({
        isLoading: true,
        progress: 10,
        message: 'מתחיל לנתח את תכני הקורס...',
        estimatedTime: 45,
      });

      try {
        const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!claudeKey && !openaiKey) {
          throw new Error(
            `🔑 לא הוגדרו מפתחות API. אנא צור קובץ .env עם המפתחות הנדרשים:\n\nVITE_CLAUDE_API_KEY=המפתח_שלך_מ_Claude\nVITE_OPENAI_API_KEY=המפתח_שלך_מ_OpenAI\n\nקבלת מפתחות:\n• Claude: https://console.anthropic.com/\n• OpenAI: https://platform.openai.com/api-keys\n\nלאחר יצירת הקובץ, רענן את הדפדפן.`
          );
        }

        setLoadingState({
          isLoading: true,
          progress: 25,
          message: 'בוחן שיטות הערכה מתאימות...',
          estimatedTime: 35,
        });

        setTimeout(() => {
          setLoadingState({
            isLoading: true,
            progress: 50,
            message: 'יוצר מטלה מותאמת אישית...',
            estimatedTime: 25,
          });
        }, 2000);

        setTimeout(() => {
          setLoadingState({
            isLoading: true,
            progress: 75,
            message: 'מכין מחוון הערכה מפורט...',
            estimatedTime: 30,
          });
        }, 4000);

        const apiStartTime = Date.now();
        const result = await callAssignmentService({
          courseName,
          faculty,
          department,
          courseDescription: courseContent || (courseParams ? courseParams.course_type : ''),
          selectedPedagogicalComponents: selectedMethods.map((m) => m.title),
        });
        const apiEndTime = Date.now();
        console.log('✅ API הושלם בהצלחה בזמן:', (apiEndTime - apiStartTime) / 1000, 'שניות');

        setLoadingState({
          isLoading: true,
          progress: 90,
          message: 'מסיים עיצוב המטלה...',
          estimatedTime: 5,
        });

        setTimeout(() => {
          setRubricHtml(result.html);
          setModelUsed(result.modelUsed);
          setLoadingState({ isLoading: false, progress: 100, message: 'המטלה מוכנה!' });
          toast.showSuccess(
            TOAST_MESSAGES.ASSESSMENT_GENERATION_SUCCESS.title,
            TOAST_MESSAGES.ASSESSMENT_GENERATION_SUCCESS.message
          );
        }, 1000);
      } catch (err) {
        handleGenerationError(err, (msg) => setError(msg), setLoadingState, toast);
      }
    }
    
    // Safe execution with error boundary
    fetchRubric().catch((error) => {
      console.error('❌ שגיאה קריטית ב-fetchRubric:', error);
      setError('שגיאה לא צפויה במערכת. אנא רענן את הדפדפן ונסה שוב.');
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: 'שגיאה במערכת',
        estimatedTime: 0
      });
    });
  }, [selectedMethods, courseParams, courseName, faculty, department, courseContent, shouldGenerate]);

  // הגנרציה הגנרית נשארת כ-fallback
  const generatedAssessment = useMemo<GeneratedAssessment>(() => {
    if (selectedMethods.length === 0) {
      return {
        title: '',
        description: '',
        instructions: [],
        requirements: [],
      };
    }

    const title = selectedMethods.map(m => m.title).join(' בשילוב ');
    const description = `מטלה זו משלבת מספר גישות פדגוגיות כדי להעריך את הבנתכם בחומר הנלמד באופן מעמיק ומקיף. המטרה היא לבחון לא רק את הידע שרכשתם, אלא גם את יכולתכם ליישם אותו, לחשוב באופן ביקורתי ולהתמודד עם אתגרים מורכבים. המטלה משלבת את הנושאים הבאים: ${selectedMethods.map(m => m.title.toLowerCase()).join(', ')}.`;
    const instructions = selectedMethods.flatMap(m => m.implementation_guidelines);
    const uniqueInstructions = [...new Set(instructions)];
    const requirements = [
      'אורך המטלה: יש לעמוד בדרישות האורך כפי שפורטו בהנחיות הספציפיות.',
      'פורמט הגשה: קובץ DOCX או PDF, אלא אם צוין אחרת.',
      'גופן: Heebo, גודל 12, רווח כפול.',
      'יש לכלול דף שער עם שם הקורס, שם המרצה, שמכם המלא ומספר ת.ז.',
      'הגשה תתבצע דרך מערכת ה-Moodle של הקורס עד לתאריך היעד.',
    ];
    return {
      title,
      description,
      instructions: uniqueInstructions,
      requirements,
    };
  }, [selectedMethods]);

  const generatedRubric = useMemo<RubricCriteria[]>(() => {
    if (selectedMethods.length === 0) {
      return [];
    }
    const allCriteria = selectedMethods.flatMap((m) => m.rubric_template || []);
    if (allCriteria.length === 0) {
      return [
        {
          name: 'הערכה כללית',
          description: 'הערכה כוללת של איכות העבודה',
          levels: {
            excellent: 'עבודה מצוינת העונה על כל הדרישות ומעבר להן.',
            good: 'עבודה טובה העונה על רוב הדרישות.',
            satisfactory: 'עבודה מספקת עם מספר ליקויים.',
            needs_improvement: 'עבודה חלשה הדורשת שיפור משמעותי.',
          },
          weight: 1,
        },
      ];
    }
    return normalizeRubricCriteria(allCriteria);
  }, [selectedMethods]);

  return { 
    generatedAssessment, 
    generatedRubric, 
    rubricHtml, 
    modelUsed, 
    loadingState, 
    error
  };
};
