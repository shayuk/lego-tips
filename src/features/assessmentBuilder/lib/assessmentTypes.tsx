export type AssessmentMethodCategory = "introduction" | "large" | "advanced";

export type TeachingMethodCompatibility = 
  | "lecture" 
  | "seminar" 
  | "workshop" 
  | "lab" 
  | "fieldwork" 
  | "online" 
  | "hybrid";

export type SubjectArea = 
  | "humanities" 
  | "social-sciences" 
  | "natural-sciences" 
  | "engineering" 
  | "arts" 
  | "business" 
  | "law" 
  | "medicine" 
  | "education" 
  | "multidisciplinary";

export type ClassSize = "small" | "medium" | "large" | "very-large";

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
  levels: {
    excellent: string;
    good: string;
    satisfactory: string;
    needs_improvement: string;
  };
  weight: number;
}

export interface AssessmentMethod {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;     // ✅ נוספה
  createdAt?: string;            // ✅ נוספה
  fullDescription?: string;
  categories: AssessmentMethodCategory[];
  teaching_methods: TeachingMethodCompatibility[];
  class_size_suitability: ClassSize[];
  subject_areas: SubjectArea[];
  implementation_difficulty: 1 | 2 | 3 | 4 | 5;
  advantages: AssessmentAdvantages;
  disadvantages: AssessmentDisadvantages;
  suggested_tools: string[];
  toolsWithLinks?: { name: string; description: string; link: string; }[];
  time_investment: TimeInvestment;
  rubric_template?: RubricCriteria[];
  implementation_guidelines: string[];
  furtherReading?: { title: string; link: string; }[];
  isPrivate?: boolean;
}

export interface CourseParameters {
  course_type: AssessmentMethodCategory;
  teaching_method: TeachingMethodCompatibility;
  class_size: ClassSize;
  subject_area: SubjectArea;
  instructor_experience: 1 | 2 | 3 | 4 | 5;
  available_time: TimeInvestment;
  technology_access: boolean;
}
