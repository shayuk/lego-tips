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
}

interface GeneratedAssessment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
}

export const useAssessmentGenerator = ({
  selectedMethods,
  courseParams,
  courseName,
  faculty,
  department,
  courseContent,
}: UseAssessmentGeneratorParams) => {
  const [rubricHtml, setRubricHtml] = useState<string>("");
  const [modelUsed, setModelUsed] = useState<string>("");

  useEffect(() => {
    async function fetchRubric() {
      if (selectedMethods.length === 0) {
        setRubricHtml("");
        setModelUsed("");
        return;
      }
      if (selectedMethods.length > 1) {
        const result = await generateIntegratedAssignment({
          courseName,
          faculty,
          department,
          courseDescription: courseContent || (courseParams ? courseParams.course_type : ""),
          selectedPedagogicalComponents: selectedMethods.map(m => m.title)
        });
        setRubricHtml(result.html);
        setModelUsed(result.modelUsed);
      } else {
        setRubricHtml("");
        setModelUsed("");
      }
    }
    fetchRubric();
  }, [selectedMethods, courseParams, courseName, faculty, department, courseContent]);

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

  return { generatedAssessment, generatedRubric, rubricHtml, modelUsed };
};
