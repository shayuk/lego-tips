import { 
  AssessmentMethod, 
  CourseParameters, 
  TimeInvestment, 
  assessmentMethods,
  AssessmentMethodCategory
} from "../features/assessmentBuilder/lib/assessmentTypes";

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

/**
 * Enhanced time compatibility calculation with better granularity
 * @param methodTime - Time investment required by the method
 * @param availableTime - Available time for the course
 * @returns Compatibility score between 0 and 1
 */
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
    // Perfect match or method requires less time than available
    return 1.0;
  } else if (methodValue === availableValue + 1) {
    // One level higher - partial compatibility
    return 0.6;
  } else if (methodValue === availableValue + 2) {
    // Two levels higher - low compatibility
    return 0.3;
  } else {
    // Too much time required
    return 0.0;
  }
}

/**
 * Calculate difficulty compatibility based on instructor experience
 * @param methodDifficulty - Method implementation difficulty (1-5)
 * @param instructorExperience - Instructor experience level (1-5)
 * @returns Compatibility score between 0 and 1
 */
function calculateDifficultyCompatibilityScore(
  methodDifficulty: number,
  instructorExperience: number
): number {
  const difference = Math.abs(methodDifficulty - instructorExperience);

  if (difference === 0) {
    return 1.0; // Perfect match
  } else if (difference === 1) {
    return 0.8; // Very good match
  } else if (difference === 2) {
    return 0.5; // Moderate match
  } else if (difference === 3) {
    return 0.2; // Low match
  } else {
    return 0.0; // Poor match
  }
}

/**
 * Check if method is suitable for large classes (>100 students)
 * @param method - Assessment method to check
 * @returns True if suitable for large classes
 */
function isSuitableForLargeClass(method: AssessmentMethod): boolean {
  return method.class_size_suitability.includes('large') ||
         method.class_size_suitability.includes('very-large');
}

/**
 * Check if method is suitable for small classes (<20 students)
 * @param method - Assessment method to check
 * @returns True if suitable for small classes
 */
function isSuitableForSmallClass(method: AssessmentMethod): boolean {
  return method.class_size_suitability.includes('small') ||
         method.class_size_suitability.includes('medium');
}

/**
 * Calculate base compatibility score for categorical matches
 * @param method - Assessment method
 * @param courseParams - Course parameters
 * @returns Base score breakdown
 */
function calculateBaseScore(
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  let courseTypeScore = 0;
  let teachingMethodScore = 0;
  let classSizeScore = 0;
  let subjectAreaScore = 0;

  // Course type compatibility with enhanced matching
  if (method.categories.includes(courseParams.course_type)) {
    courseTypeScore = COMPATIBILITY_WEIGHTS.course_type;
  } else {
    // Partial match for related categories
    const relatedCategories = getRelatedCategories(courseParams.course_type);
    if (method.categories.some((cat: AssessmentMethodCategory) => relatedCategories.includes(cat))) {
      courseTypeScore = COMPATIBILITY_WEIGHTS.course_type * 0.5;
    }
  }

  // Teaching method compatibility with partial matching
  if (method.teaching_methods.includes(courseParams.teaching_method)) {
    teachingMethodScore = COMPATIBILITY_WEIGHTS.teaching_method;
  } else {
    // Check for compatible teaching methods
    const compatibleMethods = getCompatibleTeachingMethods(courseParams.teaching_method);
    if (method.teaching_methods.some((method: string) => compatibleMethods.includes(method))) {
      teachingMethodScore = COMPATIBILITY_WEIGHTS.teaching_method * 0.7;
    }
  }

  // Class size compatibility with enhanced logic
  if (method.class_size_suitability.includes(courseParams.class_size)) {
    classSizeScore = COMPATIBILITY_WEIGHTS.class_size;
  } else {
    // Special handling for edge cases based on class size categories
    if (courseParams.class_size === 'very-large' && isSuitableForLargeClass(method)) {
      classSizeScore = COMPATIBILITY_WEIGHTS.class_size * 0.8;
    } else if (courseParams.class_size === 'small' && isSuitableForSmallClass(method)) {
      classSizeScore = COMPATIBILITY_WEIGHTS.class_size * 0.8;
    }
  }

  // Subject area compatibility with related subjects
  if (method.subject_areas.includes(courseParams.subject_area)) {
    subjectAreaScore = COMPATIBILITY_WEIGHTS.subject_area;
  } else {
    // Check for related subject areas
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
    difficulty_match: 0, // Will be calculated separately
    time_investment: 0, // Will be calculated separately
    total: 0,
    percentage: 0
  };
}

/**
 * Apply advanced weighting based on delivery method and context
 * @param baseScore - Base compatibility score
 * @param method - Assessment method
 * @param courseParams - Course parameters
 * @returns Weighted score
 */
function applyAdvancedWeighting(
  baseScore: ScoreBreakdown,
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  // Calculate difficulty compatibility
  const difficultyScore = calculateDifficultyCompatibilityScore(
    method.implementation_difficulty,
    courseParams.instructor_experience
  );
  baseScore.difficulty_match = difficultyScore * COMPATIBILITY_WEIGHTS.difficulty_match;

  // Calculate time investment compatibility
  const timeScore = calculateTimeCompatibilityScore(
    method.time_investment,
    courseParams.available_time
  );
  baseScore.time_investment = timeScore * COMPATIBILITY_WEIGHTS.time_investment;

  return baseScore;
}

/**
 * Normalize and finalize the compatibility score
 * @param scoreBreakdown - Detailed score breakdown
 * @returns Final normalized score (0-100)
 */
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

  // Ensure we don't divide by zero
  if (totalPossibleScore === 0) {
    return 0;
  }

  const percentage = Math.round((totalScore / totalPossibleScore) * 100);

  // Ensure score is within valid range
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Get related categories for partial matching
 * @param category - Primary category
 * @returns Array of related categories
 */
function getRelatedCategories(category: AssessmentMethodCategory): AssessmentMethodCategory[] {
  const categoryRelations: Record<AssessmentMethodCategory, AssessmentMethodCategory[]> = {
    'introduction': ['large'],
    'large': ['introduction', 'advanced'],
    'advanced': ['large']
  };

  return categoryRelations[category] || [];
}

/**
 * Get compatible teaching methods for partial matching
 * @param method - Primary teaching method
 * @returns Array of compatible methods
 */
function getCompatibleTeachingMethods(method: string): string[] {
  const methodCompatibility: Record<string, string[]> = {
    'lecture': ['seminar', 'workshop'],
    'seminar': ['lecture', 'discussion'],
    'workshop': ['hands_on', 'practical'],
    'online': ['hybrid', 'blended'],
    'hybrid': ['online', 'blended'],
    'hands_on': ['workshop', 'practical'],
    'discussion': ['seminar', 'collaborative'],
    'practical': ['hands_on', 'workshop'],
    'collaborative': ['discussion', 'group_work'],
    'individual': ['self_paced', 'independent']
  };

  return methodCompatibility[method] || [];
}

/**
 * Get related subjects for partial matching
 * @param subject - Primary subject area
 * @returns Array of related subjects
 */
function getRelatedSubjects(subject: string): string[] {
  const subjectRelations: Record<string, string[]> = {
    'computer_science': ['engineering', 'mathematics'],
    'engineering': ['computer_science', 'mathematics', 'physics'],
    'mathematics': ['computer_science', 'engineering', 'physics'],
    'physics': ['engineering', 'mathematics', 'chemistry'],
    'chemistry': ['physics', 'biology', 'materials'],
    'biology': ['chemistry', 'medicine', 'psychology'],
    'psychology': ['biology', 'sociology', 'education'],
    'sociology': ['psychology', 'anthropology', 'political_science'],
    'history': ['political_science', 'sociology', 'literature'],
    'literature': ['history', 'philosophy', 'languages'],
    'philosophy': ['literature', 'psychology', 'theology'],
    'business': ['economics', 'management', 'marketing'],
    'economics': ['business', 'mathematics', 'political_science'],
    'education': ['psychology', 'sociology', 'management']
  };

  return subjectRelations[subject] || [];
}

/**
 * Main compatibility calculation function with improved logic
 * @param method - Assessment method to evaluate
 * @param courseParams - Course parameters for comparison
 * @returns Compatibility score (0-100) with detailed breakdown
 */
export function calculateCompatibilityScore(
  method: AssessmentMethod,
  courseParams: CourseParameters
): number {
  // Validate input parameters
  if (!method || !courseParams) {
    console.warn('Invalid parameters provided to calculateCompatibilityScore');
    return 0;
  }

  // Calculate base compatibility score
  let scoreBreakdown = calculateBaseScore(method, courseParams);

  // Apply advanced weighting
  scoreBreakdown = applyAdvancedWeighting(scoreBreakdown, method, courseParams);

  // Normalize and return final score
  const finalScore = normalizeFinalScore(scoreBreakdown);

  // Debug logging for troubleshooting
  if (typeof window !== 'undefined' && window.localStorage?.getItem('debug') === 'true') {
    console.log(`🔍 Compatibility Score for "${method.title}":`, {
      courseParams: {
        course_type: courseParams.course_type,
        teaching_method: courseParams.teaching_method,
        class_size: courseParams.class_size,
        subject_area: courseParams.subject_area,
        instructor_experience: courseParams.instructor_experience,
        available_time: courseParams.available_time
      },
      methodProperties: {
        categories: method.categories,
        teaching_methods: method.teaching_methods,
        class_size_suitability: method.class_size_suitability,
        subject_areas: method.subject_areas,
        implementation_difficulty: method.implementation_difficulty,
        time_investment: method.time_investment
      },
      breakdown: scoreBreakdown,
      finalScore: finalScore
    });
  }

  return finalScore;
}

/**
 * Enhanced function to get top compatible methods with better scoring
 * @param courseParams - Course parameters
 * @param limit - Maximum number of methods to return
 * @returns Array of methods with compatibility scores, sorted by score
 */
export function getTopCompatibleMethods(
  courseParams: CourseParameters,
  limit: number = 5
): Array<AssessmentMethod & { compatibilityScore: number }> {
  if (!courseParams) {
    console.warn('No course parameters provided to getTopCompatibleMethods');
    return [];
  }

  const scoredMethods = assessmentMethods
    .map((method: AssessmentMethod) => {
      const compatibilityScore = calculateCompatibilityScore(method, courseParams);
      return {
        ...method,
        compatibilityScore
      };
    })
    .filter((method: AssessmentMethod & { compatibilityScore: number }) => method.compatibilityScore > 0) // Filter out completely incompatible methods
    .sort((a: AssessmentMethod & { compatibilityScore: number }, b: AssessmentMethod & { compatibilityScore: number }) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);

  // Log results for debugging
  if (typeof window !== 'undefined' && window.localStorage?.getItem('debug') === 'true') {
    console.log('Top Compatible Methods:', scoredMethods.map((m: AssessmentMethod & { compatibilityScore: number }) => ({
      title: m.title,
      score: m.compatibilityScore
    })));
  }

  return scoredMethods;
}

/**
 * Enhanced method filtering by category with compatibility scoring
 * @param category - Assessment method category
 * @returns Array of methods in the category
 */
export function getMethodsByCategory(category: AssessmentMethodCategory): AssessmentMethod[] {
  return assessmentMethods.filter((method: AssessmentMethod) => 
    method.categories.includes(category)
  );
}

/**
 * Enhanced method filtering by difficulty with range support
 * @param difficulty - Implementation difficulty (1-5)
 * @param tolerance - Allowed difficulty range (default: 0 for exact match)
 * @returns Array of methods matching difficulty criteria
 */
export function getMethodsByDifficulty(
  difficulty: number, 
  tolerance: number = 0
): AssessmentMethod[] {
  return assessmentMethods.filter((method: AssessmentMethod) => 
    Math.abs(method.implementation_difficulty - difficulty) <= tolerance
  );
}

/**
 * Enhanced method filtering by time investment with related levels
 * @param timeInvestment - Required time investment
 * @param includeRelated - Whether to include related time levels
 * @returns Array of methods matching time criteria
 */
export function getMethodsByTimeInvestment(
  timeInvestment: TimeInvestment,
  includeRelated: boolean = false
): AssessmentMethod[] {
  if (!includeRelated) {
    return assessmentMethods.filter((method: AssessmentMethod) => 
      method.time_investment === timeInvestment
    );
  }

  const timeHierarchy = ['minimal', 'moderate', 'substantial', 'extensive'];
  const currentIndex = timeHierarchy.indexOf(timeInvestment);
  const relatedLevels = timeHierarchy.slice(
    Math.max(0, currentIndex - 1),
    Math.min(timeHierarchy.length, currentIndex + 2)
  );

  return assessmentMethods.filter((method: AssessmentMethod) => 
    relatedLevels.includes(method.time_investment)
  );
}

/**
 * New utility function to get detailed compatibility breakdown
 * @param method - Assessment method
 * @param courseParams - Course parameters
 * @returns Detailed score breakdown for debugging
 */
export function getCompatibilityBreakdown(
  method: AssessmentMethod,
  courseParams: CourseParameters
): ScoreBreakdown {
  let scoreBreakdown = calculateBaseScore(method, courseParams);
  scoreBreakdown = applyAdvancedWeighting(scoreBreakdown, method, courseParams);

  const totalScore =
    scoreBreakdown.course_type +
    scoreBreakdown.teaching_method +
    scoreBreakdown.class_size +
    scoreBreakdown.subject_area +
    scoreBreakdown.difficulty_match +
    scoreBreakdown.time_investment;

  scoreBreakdown.total = totalScore;
  scoreBreakdown.percentage = normalizeFinalScore(scoreBreakdown);

  return scoreBreakdown;
}
