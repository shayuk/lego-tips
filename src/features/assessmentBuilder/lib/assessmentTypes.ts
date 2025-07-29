import { v4 as uuidv4 } from 'uuid';

// הוספת התכונה isPrivate לממשק
export interface AssessmentMethod {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  categories: AssessmentMethodCategory[];
  teaching_methods: TeachingMethodCompatibility[];
  class_size_suitability: ClassSize[];
  subject_areas: SubjectArea[];
  implementation_difficulty: number;
  time_investment: TimeInvestment;
  advantages: AssessmentAdvantages;
  disadvantages: AssessmentDisadvantages;
  suggested_tools: string[];
  toolsWithLinks?: { name: string; link: string; description: string }[];
  furtherReading?: { title: string; link: string }[];
  implementation_guidelines: string[];
  rubric_template?: RubricCriteria[];
  isPrivate?: boolean; // הוספת התכונה
} 