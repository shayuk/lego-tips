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
  RubricCriteria,
  assessmentMethods
} from "./assessmentTypes.tsx";

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
} from "../../../helpers/rubricTemplates"; // נתיב מתוקן

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
