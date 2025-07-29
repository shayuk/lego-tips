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

export interface CourseParameters {
  course_type: string;
  teaching_method: string;
  class_size: string;
  subject_area: string;
  instructor_experience: number;
  available_time: string;
  technology_access: boolean;
}

export type AssessmentMethodCategory = "introduction" | "large" | "advanced";
export type TeachingMethodCompatibility = "lecture" | "seminar" | "workshop" | "lab" | "fieldwork" | "online" | "hybrid";
export type ClassSize = "small" | "medium" | "large" | "very-large";
export type SubjectArea = "humanities" | "social-sciences" | "natural-sciences" | "engineering" | "arts" | "business" | "law" | "medicine" | "education" | "multidisciplinary";
export type TimeInvestment = "minimal" | "moderate" | "substantial" | "extensive";

export interface AssessmentAdvantages {
  pedagogical: string[];
  practical: string[];
  student_engagement: string[];
}

export interface AssessmentDisadvantages {
  challenges: string[];
  limitations: string[];
  resource_requirements: string[];
}

export interface RubricCriteria {
  name: string;
  description: string;
  weight: number;
  levels: {
    excellent: string;
    good: string;
    satisfactory: string;
    needs_improvement: string;
  };
} 