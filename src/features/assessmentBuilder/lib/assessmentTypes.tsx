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
  categories: AssessmentMethodCategory[];
  teaching_methods: TeachingMethodCompatibility[];
  class_size_suitability: ClassSize[];
  subject_areas: SubjectArea[];
  implementation_difficulty: 1 | 2 | 3 | 4 | 5;
  advantages: AssessmentAdvantages;
  disadvantages: AssessmentDisadvantages;
  suggested_tools: string[];
  time_investment: TimeInvestment;
  rubric_template?: RubricCriteria[];
  implementation_guidelines: string[];
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

export const assessmentMethods: AssessmentMethod[] = [
  {
    id: "am_01",
    title: "מבחנים קצרים ומוגבלים בזמן",
    description: "מבחנים עם מגבלת זמן דרסטית המונעת חיפוש תשובות ומעודדת שליפה מהירה של ידע.",
    categories: ["introduction", "large"],
    teaching_methods: ["lecture", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["humanities", "social-sciences", "natural-sciences", "multidisciplinary"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מעודד שינון וחזרה", "בודק זכירה מהירה", "מקטין רמאות"],
      practical: ["קל ליישום", "חסכוני בזמן", "מתאים לכיתות גדולות"],
      student_engagement: ["יוצר תחושת דחיפות", "מחזק מוטיבציה ללמידה פעילה"]
    },
    disadvantages: {
      challenges: ["לא בודק הבנה עמוקה", "יוצר לחץ על תלמידים"],
      limitations: ["מתמקד בזכירה בלבד", "לא מתאים לכל סוגי הידע"],
      resource_requirements: ["דורש פלטפורמה דיגיטלית", "צריך מאגר שאלות גדול"]
    },
    suggested_tools: ["Moodle Quiz", "Google Forms", "Kahoot", "מערכת LMS של האוניברסיטה"],
    time_investment: "minimal",
    rubric_template: [
      {
        name: "דיוק תשובות",
        description: "רמת הדיוק והנכונות של התשובות",
        levels: {
          excellent: "95-100% תשובות נכונות",
          good: "85-94% תשובות נכונות",
          satisfactory: "70-84% תשובות נכונות",
          needs_improvement: "פחות מ-70% תשובות נכונות"
        },
        weight: 0.8
      },
      {
        name: "זמן השלמה",
        description: "יכולת להשלים במגבלת הזמן",
        levels: {
          excellent: "השלמה בזמן עם בדיקה חוזרת",
          good: "השלמה בזמן ללא בדיקה",
          satisfactory: "השלמה עם עיכוב קל",
          needs_improvement: "לא הספיק להשלים"
        },
        weight: 0.2
      }
    ],
    implementation_guidelines: [
      "קבעו מגבלת זמן של 1-2 דקות לשאלה",
      "השתמשו בשאלות ברירה מרובה או שאלות קצרות",
      "הכינו מאגר שאלות גדול למניעת זיכרון",
      "בדקו את הפלטפורמה הטכנית מראש",
      "הודיעו לתלמידים על הפורמט מראש"
    ]
  },
  {
    id: "am_02",
    title: "מטלות 'התחכמות' (Obfuscation)",
    description: "שימוש בתכנים ספציפיים ונישתיים מהקורס שקשה למצוא במנועי חיפוש כלליים. כגון: הקלטות פרטיות של דיונים, חומרים שהוצגו רק בכיתה, או מקורות יחודיים שלא פורסמו באינטרנט.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מעודד למידה מעמיקה", "מחזק הבנה של חומר נישתי", "מפתח חשיבה ביקורתית"],
      practical: ["מקטין העתקה", "מבדיל בין תלמידים איכותיים"],
      student_engagement: ["מעודד מעורבות אמיתית", "מתגמל השקעה בחומר הלימוד"]
    },
    disadvantages: {
      challenges: ["דורש הכנה מרובה מהמרצה", "קשה לבדיקה"],
      limitations: ["מתאים רק לקורסים מתקדמים", "דורש מומחיות גבוהה"],
      resource_requirements: ["זמן הכנה רב", "גישה לחומרים נדירים"]
    },
    suggested_tools: ["הקלטות כיתתיות", "חומרי מחקר פרטיים", "דיונים סוקרטיים מוקלטים", "מקורות יחודיים"],
    time_investment: "extensive",
    implementation_guidelines: [
      "השתמשו בחומר יחודי שהוצג רק בקורס (הקלטות, דיונים, מחקרים פרטיים)",
      "במקרה שלא צוין חומר מקורי ספציפי - כתבו: 'בצעו את הניתוח על החומר היחודי שקבלתם במהלך הקורס'",
      "וודאו שהחומר אכן לא זמין באינטרנט או במנועי חיפוש",
      "הכינו שאלות המתמקדות בפרטים הספציפיים של החומר",
      "תנו הקשר ברור לתיאוריות ומושגים מהקורס"
    ]
  },
  {
    id: "am_03",
    title: "ניתוח מונחה של פרומפטים",
    description: "הסטודנטים מקבלים פרומפט ועליהם לנתח אותו, להציע שיפורים ולהסביר את ההיגיון מאחוריהם.",
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["humanities", "social-sciences", "education", "multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח אוריינות דיגיטלית", "מחזק חשיבה ביקורתית", "מכין לעבודה עם AI"],
      practical: ["רלוונטי לעידן הנוכחי", "מעודד למידה פעילה"],
      student_engagement: ["מעניין ועכשווי", "מחבר לטכנולוגיה"]
    },
    disadvantages: {
      challenges: ["דורש הכרה עם AI", "משתנה במהירות"],
      limitations: ["תלוי בטכנולוגיה", "לא מתאים לכל הנושאים"],
      resource_requirements: ["גישה לכלי AI", "הכשרה טכנית"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "ארגון השוואות"],
    time_investment: "moderate",
    rubric_template: [
      {
        name: "ניתוח איכות הפרומפט",
        description: "יכולת לזהות חוזקות וחולשות",
        levels: {
          excellent: "ניתוח מקיף ומדויק עם הצעות שיפור ספציפיות",
          good: "ניתוח טוב עם הצעות שיפור כלליות",
          satisfactory: "ניתוח בסיסי עם זיהוי בעיות עיקריות",
          needs_improvement: "ניתוח שטחי ללא הצעות שיפור"
        },
        weight: 0.4
      },
      {
        name: "הצעות שיפור",
        description: "איכות ומעשיות ההצעות",
        levels: {
          excellent: "הצעות מקוריות ומעשיות עם הסבר מפורט",
          good: "הצעות טובות עם הסבר בסיסי",
          satisfactory: "הצעות סבירות ללא הסבר מפורט",
          needs_improvement: "הצעות לא מעשיות או לא רלוונטיות"
        },
        weight: 0.4
      },
      {
        name: "הבנת הקשר",
        description: "יכולת לקשר למטרות הלמידה",
        levels: {
          excellent: "קישור מעמיק למטרות הקורס ולמושגים",
          good: "קישור טוב למטרות הקורס",
          satisfactory: "קישור בסיסי למטרות הקורס",
          needs_improvement: "ללא קישור למטרות הקורס"
        },
        weight: 0.2
      }
    ],
    implementation_guidelines: [
      "בחרו פרומפטים מתחומים שונים",
      "הכינו דוגמאות לניתוח איכותי",
      "הסבירו קריטריונים לפרומפט טוב",
      "עודדו יצירתיות בהצעות השיפור",
      "קיימו דיון כיתתי על הממצאים"
    ]
  },
  ...
  // (additional assessment method entries continue up to "am_20")
];
