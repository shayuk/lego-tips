import { useMemo, useState, useEffect } from 'react';
import { AssessmentMethod, CourseParameters, RubricCriteria } from './assessmentTypes';
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

export const useAssessmentGenerator = ({
  selectedMethods,
  courseParams,
  courseName,
  faculty,
  department,
  courseContent,
  shouldGenerate = false,
}: UseAssessmentGeneratorParams) => {
  const [rubricHtml, setRubricHtml] = useState<string>("");
  const [modelUsed, setModelUsed] = useState<string>("");
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    estimatedTime: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 useAssessmentGenerator useEffect נקרא עם:', {
      selectedMethodsLength: selectedMethods.length,
      shouldGenerate,
      courseName,
      courseContentLength: courseContent?.length || 0
    });

    async function fetchRubric() {
      if (selectedMethods.length === 0) {
        console.log('🔍 אין שיטות נבחרות - יוצא');
        setRubricHtml("");
        setModelUsed("");
        setLoadingState({ isLoading: false, progress: 0, message: '' });
        setError(null);
        return;
      }
      
      if (selectedMethods.length >= 1 && shouldGenerate) {
        console.log('🚀 מתחיל ליצור מטלה!');
        setError(null);
        setLoadingState({
          isLoading: true,
          progress: 10,
          message: 'מתחיל לנתח את תכני הקורס...',
          estimatedTime: 45
        });

        try {
          // Debug: Log the course content being sent to AI
          console.log('🔍 תוכן הקורס שנשלח ל-AI:', courseContent);
          console.log('🔍 אורך התוכן:', courseContent?.length || 0, 'תווים');
          console.log('🔍 שיטות פדגוגיות נבחרו:', selectedMethods.map(m => m.title));
          
          // Additional debug for separators
          const hasSeparators = courseContent?.includes('--- תוכן') || false;
          console.log('🔍 מכיל סמני קבצים:', hasSeparators ? 'כן' : 'לא');
          
          if (courseContent && courseContent.includes('--- תוכן המאמר ---')) {
            const articleIndex = courseContent.indexOf('--- תוכן המאמר ---');
            const articleContent = courseContent.substring(articleIndex + 20, articleIndex + 200); // First 200 chars after separator
            console.log('🔍 תחילת תוכן המאמר:', articleContent + '...');
          }
          
          // אם אין תוכן ספציפי, ה-AI יחפש תוכן רלוונטי בעצמו
          console.log('🔍 בודק תוכן הקורס:', {
            hasContent: !!courseContent,
            contentLength: courseContent?.length || 0,
            isPlaceholder: courseContent?.includes('לא הועלה תוכן קורס ספציפי')
          });

          // Check API keys availability early
          const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
          
          if (!claudeKey && !openaiKey) {
            throw new Error(`🔑 לא הוגדרו מפתחות API. אנא צור קובץ .env עם המפתחות הנדרשים:

VITE_CLAUDE_API_KEY=המפתח_שלך_מ_Claude
VITE_OPENAI_API_KEY=המפתח_שלך_מ_OpenAI

קבלת מפתחות:
• Claude: https://console.anthropic.com/
• OpenAI: https://platform.openai.com/api-keys

לאחר יצירת הקובץ, רענן את הדפדפן.`);
          }

          // שלב 1: ניתוח תוכן
          setLoadingState({
            isLoading: true,
            progress: 25,
            message: 'בוחן שיטות הערכה מתאימות...',
            estimatedTime: 35
          });

          // שלב 2: בחירת שיטות
          setTimeout(() => {
            setLoadingState({
              isLoading: true,
              progress: 50,
              message: 'יוצר מטלה מותאמת אישית...',
              estimatedTime: 25
            });
          }, 2000);

          // שלב 3: התחלת קריאה ל-API
          setTimeout(() => {
            setLoadingState({
              isLoading: true,
              progress: 75,
              message: 'מכין מחוון הערכה מפורט...',
              estimatedTime: 30 // הגדלתי את הזמן המשוער
            });
          }, 4000);

          console.log('🚀 מתחיל קריאה ל-API...');
          const apiStartTime = Date.now();
          
          const result = await Promise.race([
            generateIntegratedAssignment({
              courseName,
              faculty,
              department,
              courseDescription: courseContent || (courseParams ? courseParams.course_type : ""),
              selectedPedagogicalComponents: selectedMethods.map(m => m.title)
            }),
            // Timeout after 60 seconds
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('פג זמן ההמתנה לתשובה מהשרת (60 שניות). אנא נסה שוב.')), 60000)
            )
          ]);

          const apiEndTime = Date.now();
          console.log('✅ API הושלם בהצלחה בזמן:', (apiEndTime - apiStartTime) / 1000, 'שניות');

          // שלב 4: השלמה
          setLoadingState({
            isLoading: true,
            progress: 90,
            message: 'מסיים עיצוב המטלה...',
            estimatedTime: 5
          });

          setTimeout(() => {
            setRubricHtml(result.html);
            setModelUsed(result.modelUsed);
            setLoadingState({
              isLoading: false,
              progress: 100,
              message: 'המטלה מוכנה!',
              estimatedTime: 0
            });
          }, 1000);

        } catch (err) {
          console.error('❌ שגיאה ביצירת המטלה:', err);
          
          // הודעות שגיאה מותאמות לבעיות נפוצות
          let userFriendlyMessage = 'שגיאה לא צפויה ביצירת המטלה. אנא נסה שוב.';
          
          if (err instanceof Error) {
            const errorMessage = err.message;
            
            if (errorMessage.includes('60 שניות') || errorMessage.includes('timeout')) {
              userFriendlyMessage = '⏰ פג זמן ההמתנה לתשובה מהשרת. השרת עשוי להיות עמוס. אנא נסה שוב.';
            } else if (errorMessage.includes('API') || errorMessage.includes('Claude') || errorMessage.includes('OpenAI')) {
              userFriendlyMessage = '🔌 בעיה בחיבור לשרת ה-AI. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
            } else if (errorMessage.includes('מפתח')) {
              userFriendlyMessage = '🔑 בעיה במפתחות ה-API. אנא צור קשר עם מנהל המערכת.';
            } else if (errorMessage.includes('תוכן הקורס')) {
              userFriendlyMessage = '📝 ' + errorMessage; // Keep the original message for content issues
            } else {
              userFriendlyMessage = `שגיאה ביצירת המטלה: ${errorMessage}`;
            }
          }
          
          setError(userFriendlyMessage);
          setLoadingState({
            isLoading: false,
            progress: 0,
            message: 'שגיאה - נסה שוב',
            estimatedTime: 0
          });
        }
      } else {
        console.log('🔍 לא מתחיל ליצור מטלה. תנאים:', {
          methodsLength: selectedMethods.length,
          shouldGenerate,
          meetsCriteria: selectedMethods.length >= 1 && shouldGenerate
        });
        setRubricHtml("");
        setModelUsed("");
        setLoadingState({ isLoading: false, progress: 0, message: '' });
        setError(null);
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
    const allCriteria = selectedMethods.flatMap(m => m.rubric_template || []);
    if (allCriteria.length === 0) {
        // Fallback if no methods have rubrics
        return [{
            name: "הערכה כללית",
            description: "הערכה כוללת של איכות העבודה",
            levels: {
                excellent: "עבודה מצוינת העונה על כל הדרישות ומעבר להן.",
                good: "עבודה טובה העונה על רוב הדרישות.",
                satisfactory: "עבודה מספקת עם מספר ליקויים.",
                needs_improvement: "עבודה חלשה הדורשת שיפור משמעותי."
            },
            weight: 1
        }];
    }
    // Deduplicate criteria by name, preferring the first one encountered
    const uniqueCriteria: RubricCriteria[] = [];
    const names = new Set<string>();
    allCriteria.forEach(criterion => {
        if (!names.has(criterion.name)) {
            uniqueCriteria.push(criterion);
            names.add(criterion.name);
        }
    });
    const totalWeight = uniqueCriteria.reduce((sum, c) => sum + c.weight, 0);
    // Normalize weights to sum to 1
    const normalizedRubric = uniqueCriteria.map(c => ({
      ...c,
      weight: totalWeight > 0 ? c.weight / totalWeight : 1 / uniqueCriteria.length,
    }));
    return normalizedRubric;
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
