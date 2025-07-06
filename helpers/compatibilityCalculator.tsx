import { 
  AssessmentMethod, 
  CourseParameters, 
  TimeInvestment, 
  assessmentMethods,
  AssessmentMethodCategory
} from "./assessmentTypes";

function getTimeCompatibilityScore(methodTime: TimeInvestment, availableTime: TimeInvestment): number {
  const timeValues = { minimal: 1, moderate: 2, substantial: 3, extensive: 4 };
  const methodValue = timeValues[methodTime];
  const availableValue = timeValues[availableTime];
  
  if (methodValue <= availableValue) {
    return 1;
  } else if (methodValue === availableValue + 1) {
    return 0.5;
  } else {
    return 0;
  }
}

export function calculateCompatibilityScore(
  method: AssessmentMethod,
  courseParams: CourseParameters
): number {
  let score = 0;
  let totalWeight = 0;

  // Course type compatibility (25% weight)
  if (method.categories.includes(courseParams.course_type)) {
    score += 25;
  }
  totalWeight += 25;

  // Teaching method compatibility (20% weight)
  if (method.teaching_methods.includes(courseParams.teaching_method)) {
    score += 20;
  }
  totalWeight += 20;

  // Class size compatibility (20% weight)
  if (method.class_size_suitability.includes(courseParams.class_size)) {
    score += 20;
  }
  totalWeight += 20;

  // Subject area compatibility (15% weight)
  if (method.subject_areas.includes(courseParams.subject_area)) {
    score += 15;
  }
  totalWeight += 15;

  // Implementation difficulty vs instructor experience (10% weight)
  const difficultyScore = Math.max(0, 6 - Math.abs(method.implementation_difficulty - courseParams.instructor_experience));
  score += (difficultyScore / 5) * 10;
  totalWeight += 10;

  // Time investment compatibility (10% weight)
  const timeCompatibility = getTimeCompatibilityScore(method.time_investment, courseParams.available_time);
  score += timeCompatibility * 10;
  totalWeight += 10;

  return Math.round((score / totalWeight) * 100);
}

export function getTopCompatibleMethods(
  courseParams: CourseParameters,
  limit: number = 5
): Array<AssessmentMethod & { compatibilityScore: number }> {
  return assessmentMethods
    .map(method => ({
      ...method,
      compatibilityScore: calculateCompatibilityScore(method, courseParams)
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}

export function getMethodsByCategory(category: AssessmentMethodCategory): AssessmentMethod[] {
  return assessmentMethods.filter(method => method.categories.includes(category));
}

export function getMethodsByDifficulty(difficulty: number): AssessmentMethod[] {
  return assessmentMethods.filter(method => method.implementation_difficulty === difficulty);
}

export function getMethodsByTimeInvestment(timeInvestment: TimeInvestment): AssessmentMethod[] {
  return assessmentMethods.filter(method => method.time_investment === timeInvestment);
}
