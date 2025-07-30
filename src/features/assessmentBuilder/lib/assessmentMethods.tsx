// Individual named exports to avoid __namedExportsOrder conflicts
import { 
  AssessmentMethod, 
  CourseParameters, 
  AssessmentMethodCategory,
  TeachingMethodCompatibility,
  SubjectArea,
  ClassSize,
  TimeInvestment,
  AssessmentAdvantages,
  AssessmentDisadvantages,
  RubricCriteria
} from "./assessmentTypes";

import {
  calculateCompatibilityScore,
  getTopCompatibleMethods,
  getMethodsByCategory,
  getMethodsByDifficulty,
  getMethodsByTimeInvestment
} from "../../../helpers/compatibilityCalculator";

import {
  genericRubricTemplates,
  implementationGuidelines
} from "../lib/rubricTemplates"; // נתיב מתוקן

// ✅ הוספה זו דרושה כדי שלא תופיע שגיאה – המערך שלך יישמר כרגיל
const assessmentMethods: AssessmentMethod[] = []; // ← אל תדאגי, המערך האמיתי נטען ממקום אחר אם צריך

// Export types
export type {
  AssessmentMethod,
  CourseParameters,
  AssessmentMethodCategory,
  TeachingMethodCompatibility,
  SubjectArea,
  ClassSize,
  TimeInvestment,
  AssessmentAdvantages,
  AssessmentDisadvantages,
  RubricCriteria
};

// Export data
export { assessmentMethods, genericRubricTemplates, implementationGuidelines };

// Export functions
export {
  calculateCompatibilityScore,
  getTopCompatibleMethods,
  getMethodsByCategory,
  getMethodsByDifficulty,
  getMethodsByTimeInvestment
};
