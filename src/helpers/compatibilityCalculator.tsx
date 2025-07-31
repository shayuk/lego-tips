import {
  AssessmentMethod,
  CourseParameters,
  TimeInvestment,
  AssessmentMethodCategory
} from "../features/assessmentBuilder/lib/assessmentTypes";

import { assessmentMethods } from "../features/assessmentBuilder/lib/assessmentMethods";

/**
 * Enhanced TypeScript interfaces for better type safety
 */
interface CompatibilityWeights {
  course_type: number;
  teaching_method: number;
  class_size: number;
  subject_area: number;
  difficulty_match: number;
  time_investment: number;
}

interface ScoreBreakdown {
  course_type: number;
  teaching_method: number;
  class_size: number;
  subject_area: number;
  difficulty_match: number;
  time_investment: number;
  total: number;
  percentage: number;
}

/**
 * Configuration for compatibility scoring weights
 * Total should equal 100 for proper percentage calculation
 */
const COMPATIBILITY_WEIGHTS: CompatibilityWeights = {
  course_type: 25,
  teaching_method: 20,
  class_size: 20,
  subject_area: 15,
  difficulty_match: 10,
  time_investment: 10
};

function calculateTimeCompatibilityScore(
  methodTime: TimeInvestment,
  availableTime: TimeInvestment
): number {
  const timeValues: Record<TimeInvestment, number> = {
    minimal: 1,
    moderate: 2,
    substantial: 3,
    extensive: 4
  };

  const methodValue = timeValues[methodTime];
  const availableValue = timeValues[availableTime];

  if (methodValue <= availableValue) {
    return 1.0;
  } else if (methodValue === availableValue + 1) {
    return 0.6;
  } else if (methodValue === availableValue + 2) {
    return 0.3;
  } else {
    return 0.0;
  }
}

function calculateDifficultyCompatibilityScore(
  methodDifficulty: number,
  instructorExperience: number
): number {
  const difference = Math.abs(methodDifficulty - instructorExperience);

  if (difference === 0) return 1.0;
  else if (difference === 1) return 0.8;
  else if (difference === 2) return 0.5;
  else if (difference === 3) return 0.2;
  else return 0.0;
}

function isSuitableForLargeClass(method: AssessmentMethod): boolean {
  return method.class_size_suitability.includes("large") ||
    method.class_size_suitability.includes("very-large");
}

function isSuitableForSmallClass(method: AssessmentMethod): boolean {
  return method.class_size_suitability.includes("small") ||
    method.class_size_suitability.includes("medium");
}

function calculateBaseScore(
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  let courseTypeScore = 0;
  let teachingMethodScore = 0;
  let classSizeScore = 0;
  let subjectAreaScore = 0;

  if (method.categories.includes(courseParams.course_type)) {
    courseTypeScore = COMPATIBILITY_WEIGHTS.course_type;
  } else {
    const relatedCategories = getRelatedCategories(courseParams.course_type);
    if (method.categories.some((cat: AssessmentMethodCategory) => relatedCategories.includes(cat))) {
      courseTypeScore = COMPATIBILITY_WEIGHTS.course_type * 0.5;
    }
  }

  if (method.teaching_methods.includes(courseParams.teaching_method)) {
    teachingMethodScore = COMPATIBILITY_WEIGHTS.teaching_method;
  } else {
    const compatibleMethods = getCompatibleTeachingMethods(courseParams.teaching_method);
    if (method.teaching_methods.some((m: string) => compatibleMethods.includes(m))) {
      teachingMethodScore = COMPATIBILITY_WEIGHTS.teaching_method * 0.7;
    }
  }

  if (method.class_size_suitability.includes(courseParams.class_size)) {
    classSizeScore = COMPATIBILITY_WEIGHTS.class_size;
  } else {
    if (courseParams.class_size === "very-large" && isSuitableForLargeClass(method)) {
      classSizeScore = COMPATIBILITY_WEIGHTS.class_size * 0.8;
    } else if (courseParams.class_size === "small" && isSuitableForSmallClass(method)) {
      classSizeScore = COMPATIBILITY_WEIGHTS.class_size * 0.8;
    }
  }

  if (method.subject_areas.includes(courseParams.subject_area)) {
    subjectAreaScore = COMPATIBILITY_WEIGHTS.subject_area;
  } else {
    const relatedSubjects = getRelatedSubjects(courseParams.subject_area);
    if (method.subject_areas.some((subject: string) => relatedSubjects.includes(subject))) {
      subjectAreaScore = COMPATIBILITY_WEIGHTS.subject_area * 0.6;
    }
  }

  return {
    course_type: courseTypeScore,
    teaching_method: teachingMethodScore,
    class_size: classSizeScore,
    subject_area: subjectAreaScore,
    difficulty_match: 0,
    time_investment: 0,
    total: 0,
    percentage: 0
  };
}

function applyAdvancedWeighting(
  baseScore: ScoreBreakdown,
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  const difficultyScore = calculateDifficultyCompatibilityScore(
    method.implementation_difficulty,
    courseParams.instructor_experience
  );
  baseScore.difficulty_match = difficultyScore * COMPATIBILITY_WEIGHTS.difficulty_match;

  const timeScore = calculateTimeCompatibilityScore(
    method.time_investment,
    courseParams.available_time
  );
  baseScore.time_investment = timeScore * COMPATIBILITY_WEIGHTS.time_investment;

  return baseScore;
}

function normalizeFinalScore(scoreBreakdown: ScoreBreakdown): number {
  const totalScore =
    scoreBreakdown.course_type +
    scoreBreakdown.teaching_method +
    scoreBreakdown.class_size +
    scoreBreakdown.subject_area +
    scoreBreakdown.difficulty_match +
    scoreBreakdown.time_investment;

  const totalPossibleScore =
    COMPATIBILITY_WEIGHTS.course_type +
    COMPATIBILITY_WEIGHTS.teaching_method +
    COMPATIBILITY_WEIGHTS.class_size +
    COMPATIBILITY_WEIGHTS.subject_area +
    COMPATIBILITY_WEIGHTS.difficulty_match +
    COMPATIBILITY_WEIGHTS.time_investment;

  if (totalPossibleScore === 0) return 0;

  const percentage = Math.round((totalScore / totalPossibleScore) * 100);
  return Math.max(0, Math.min(100, percentage));
}

function getRelatedCategories(category: AssessmentMethodCategory): AssessmentMethodCategory[] {
  const categoryRelations: Record<AssessmentMethodCategory, AssessmentMethodCategory[]> = {
    introduction: ["large"],
    large: ["introduction", "advanced"],
    advanced: ["large"]
  };
  return categoryRelations[category] || [];
}

function getCompatibleTeachingMethods(method: string): string[] {
  const methodCompatibility: Record<string, string[]> = {
    lecture: ["seminar", "workshop"],
    seminar: ["lecture", "discussion"],
    workshop: ["hands_on", "practical"],
    online: ["hybrid", "blended"],
    hybrid: ["online", "blended"],
    hands_on: ["workshop", "practical"],
    discussion: ["seminar", "collaborative"],
    practical: ["hands_on", "workshop"],
    collaborative: ["discussion", "group_work"],
    individual: ["self_paced", "independent"]
  };
  return methodCompatibility[method] || [];
}

function getRelatedSubjects(subject: string): string[] {
  const subjectRelations: Record<string, string[]> = {
    computer_science: ["engineering", "mathematics"],
    engineering: ["computer_science", "mathematics", "physics"],
    mathematics: ["computer_science", "engineering", "physics"],
    physics: ["engineering", "mathematics", "chemistry"],
    chemistry: ["physics", "biology", "materials"],
    biology: ["chemistry", "medicine", "psychology"],
    psychology: ["biology", "sociology", "education"],
    sociology: ["psychology", "anthropology", "political_science"],
    history: ["political_science", "sociology", "literature"],
    literature: ["history", "philosophy", "languages"],
    philosophy: ["literature", "psychology", "theology"],
    business: ["economics", "management", "marketing"],
    economics: ["business", "mathematics", "political_science"],
    education: ["psychology", "sociology", "management"]
  };
  return subjectRelations[subject] || [];
}

export function calculateCompatibilityScore(
  method: AssessmentMethod,
  courseParams: CourseParameters
): number {
  if (!method || !courseParams) {
    console.warn("Invalid parameters provided to calculateCompatibilityScore");
    return 0;
  }

  let scoreBreakdown = calculateBaseScore(method, courseParams);
  scoreBreakdown = applyAdvancedWeighting(scoreBreakdown, method, courseParams);
  const finalScore = normalizeFinalScore(scoreBreakdown);

  if (typeof window !== "undefined" && window.localStorage?.getItem("debug") === "true") {
    console.log(`🔍 Compatibility Score for "${method.title}":`, {
      courseParams,
      methodProperties: method,
      breakdown: scoreBreakdown,
      finalScore
    });
  }

  return finalScore;
}

export function getTopCompatibleMethods(
  courseParams: CourseParameters,
  limit: number = 5,
  methodsToUse?: AssessmentMethod[]
): Array<AssessmentMethod & { compatibilityScore: number }> {
  if (!courseParams) {
    console.warn("No course parameters provided to getTopCompatibleMethods");
    return [];
  }

  const methods = methodsToUse || assessmentMethods;

  return methods
    .map((method: AssessmentMethod) => {
      const compatibilityScore = calculateCompatibilityScore(method, courseParams);
      return { ...method, compatibilityScore };
    })
    .filter((method: AssessmentMethod & { compatibilityScore: number }) => method.compatibilityScore > 0)
    .sort((a: AssessmentMethod & { compatibilityScore: number }, b: AssessmentMethod & { compatibilityScore: number }) =>
      b.compatibilityScore - a.compatibilityScore
    )
    .slice(0, limit);
}

export function getMethodsByCategory(category: AssessmentMethodCategory): AssessmentMethod[] {
  return assessmentMethods.filter((method: AssessmentMethod) => method.categories.includes(category));
}

export function getMethodsByDifficulty(
  difficulty: number,
  tolerance: number = 0
): AssessmentMethod[] {
  return assessmentMethods.filter(
    (method: AssessmentMethod) => Math.abs(method.implementation_difficulty - difficulty) <= tolerance
  );
}

export function getMethodsByTimeInvestment(
  timeInvestment: TimeInvestment,
  includeRelated: boolean = false
): AssessmentMethod[] {
  if (!includeRelated) {
    return assessmentMethods.filter((method: AssessmentMethod) => method.time_investment === timeInvestment);
  }

  const timeHierarchy = ["minimal", "moderate", "substantial", "extensive"];
  const currentIndex = timeHierarchy.indexOf(timeInvestment);
  const relatedLevels = timeHierarchy.slice(
    Math.max(0, currentIndex - 1),
    Math.min(timeHierarchy.length, currentIndex + 2)
  );

  return assessmentMethods.filter((method: AssessmentMethod) =>
    relatedLevels.includes(method.time_investment)
  );
}

export function getCompatibilityBreakdown(
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  let scoreBreakdown = calculateBaseScore(method, courseParams);
  scoreBreakdown = applyAdvancedWeighting(scoreBreakdown, method, courseParams);

  scoreBreakdown.total =
    scoreBreakdown.course_type +
    scoreBreakdown.teaching_method +
    scoreBreakdown.class_size +
    scoreBreakdown.subject_area +
    scoreBreakdown.difficulty_match +
    scoreBreakdown.time_investment;

  scoreBreakdown.percentage = normalizeFinalScore(scoreBreakdown);

  return scoreBreakdown;
}

// ✨ ייצוא בשם נוסף – CompatibilityScore
export { calculateCompatibilityScore as CompatibilityScore };
