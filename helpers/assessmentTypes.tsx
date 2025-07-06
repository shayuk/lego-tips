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
    description: "שימוש בתכנים ספציפיים ונישתיים מהקורס שקשה למצוא במנועי חיפוש כלליים.",
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
    suggested_tools: ["מאגרי מידע אקדמיים", "ספרות מחקר מקורית", "מקורות ראשוניים"],
    time_investment: "extensive",
    implementation_guidelines: [
      "בחרו נושאים ספציפיים מתוך החומר הנישתי",
      "הכינו שאלות המתבססות על מקורות לא זמינים ברשת",
      "השתמשו בדוגמאות מהחוויה האישית שלכם",
      "בדקו שהחומר אכן לא זמין בקלות",
      "הכינו מדריך מקורות מפורט"
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
  {
    id: "am_04",
    title: "ניתוח סיפור אישי או רפלקציה",
    description: "בקשה לניתוח המבוסס על חוויה אישית, מה שמקשה על AI לספק תשובה אותנטית.",
    categories: ["introduction"],
    teaching_methods: ["seminar", "workshop", "online"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "education", "arts"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מעמיק הבנה אישית", "מחזק קשר רגשי לחומר", "מפתח מטא-קוגניציה"],
      practical: ["קשה לזייף", "מעודד אותנטיות"],
      student_engagement: ["אישי ומעניין", "מרגיש רלוונטי"]
    },
    disadvantages: {
      challenges: ["דורש אמון בכיתה", "עלול להיות אישי מדי"],
      limitations: ["לא מתאים לכל הנושאים", "קשה להערכה אובייקטיבית"],
      resource_requirements: ["זמן להקשבה", "רגישות מהמרצה"]
    },
    suggested_tools: ["פורומי דיון", "יומני למידה דיגיטליים", "כלי כתיבה רפלקטיבית"],
    time_investment: "moderate",
    implementation_guidelines: [
      "בנו אווירה בטוחה ותומכת בכיתה",
      "תנו דוגמאות אישיות משלכם",
      "הגדירו גבולות ברורים לשיתוף",
      "השתמשו בשאלות מנחות לרפלקציה",
      "כבדו את הפרטיות של התלמידים"
    ]
  },
  {
    id: "am_05",
    title: "השוואה וניתוח ביקורתי של AI",
    description: "הסטודנטים מתבקשים להשוות בין שתי תשובות שנוצרו על ידי AI ולבקר אותן.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["humanities", "social-sciences", "natural-sciences", "multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח חשיבה ביקורתית", "מחזק יכולת השוואה", "מעמיק הבנה בנושא"],
      practical: ["מלמד על מגבלות AI", "מכין לעבודה עתידית"],
      student_engagement: ["מעניין ורלוונטי", "מפתח מיומנויות מודרניות"]
    },
    disadvantages: {
      challenges: ["דורש הכרה עם AI", "משתנה במהירות"],
      limitations: ["תלוי בזמינות כלים", "לא מתאים לכל הנושאים"],
      resource_requirements: ["גישה לכלי AI שונים", "זמן הכנה"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "Perplexity", "כלי השוואה"],
    time_investment: "moderate",
    implementation_guidelines: [
      "בחרו נושאים מורכבים לניתוח",
      "הכינו שאלות מנחות להשוואה",
      "הסבירו קריטריונים לניתוח איכותי",
      "עודדו זיהוי הטיות ושגיאות",
      "קיימו דיון כיתתי על הממצאים"
    ]
  },
  {
    id: "am_06",
    title: "שאלות אקראיות ממאגר גדול",
    description: "כל סטודנט מקבל סט שאלות שונה ממאגר גדול, מה שמקשה על שיתוף תשובות.",
    categories: ["large"],
    teaching_methods: ["lecture", "online", "hybrid"],
    class_size_suitability: ["large", "very-large"],
    subject_areas: ["natural-sciences", "engineering", "business", "multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מעודד למידה עצמאית", "מקיף את כל החומר"],
      practical: ["מתאים לכיתות גדולות", "מקטין רמאות"],
      student_engagement: ["מקטין לחץ תחרותי", "מתרכז בלמידה אישית"]
    },
    disadvantages: {
      challenges: ["דורש הכנת מאגר גדול", "קשה לבדיקה"],
      limitations: ["לא מתאים לכל סוגי הידע", "דורש מערכת טכנית"],
      resource_requirements: ["זמן הכנה רב", "מערכת ניהול מתקדמת"]
    },
    suggested_tools: ["Moodle", "Blackboard", "Canvas", "מערכות LMS"],
    time_investment: "extensive",
    implementation_guidelines: [
      "הכינו מאגר של לפחות 100 שאלות",
      "ודאו שכל השאלות ברמת קושי דומה",
      "בדקו את המערכת הטכנית מראש",
      "הכינו מפתח מענה לכל השאלות",
      "הגדירו זמן מספיק לכל סוג שאלה"
    ]
  },
  {
    id: "am_07",
    title: "עבודת פרויקט",
    description: "פרויקט יישומי המדגים הבנה מעמיקה ושילוב של מיומנויות שונות.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab", "fieldwork"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["engineering", "arts", "business", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מפתח מיומנויות מורכבות", "מחזק למידה מעמיקה", "מעודד יצירתיות"],
      practical: ["מכין לעבודה מקצועית", "מדגים יכולות מעשיות"],
      student_engagement: ["מעניין ומאתגר", "מאפשר ביטוי אישי"]
    },
    disadvantages: {
      challenges: ["דורש הדרכה צמודה", "קשה להערכה"],
      limitations: ["זמן רב", "לא מתאים לכל הנושאים"],
      resource_requirements: ["זמן הדרכה רב", "משאבים טכניים"]
    },
    suggested_tools: ["GitHub", "Google Workspace", "Trello", "Slack"],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו מטרות ברורות לפרויקט",
      "קבעו ציוני דרך ומועדי הגשה",
      "תנו משוב בשלבים שונים",
      "עודדו עבודה בצוותים",
      "הכינו תבנית להצגת הפרויקט"
    ]
  },
  {
    id: "am_08",
    title: "הערכת פורטפוליו (תיק עבודות)",
    description: "הערכה מתמשכת של אוסף עבודות לאורך הסמסטר, המציגה התפתחות ולמידה.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "online"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["arts", "education", "humanities", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מציג התפתחות", "מעודד רפלקציה", "מקיף ומגוון"],
      practical: ["מתאים לתחומים יצירתיים", "מדגים תהליך למידה"],
      student_engagement: ["מאפשר ביטוי אישי", "מפחית לחץ מבחנים"]
    },
    disadvantages: {
      challenges: ["דורש זמן הערכה רב", "קשה לסטנדרטיזציה"],
      limitations: ["לא מתאים לכל התחומים", "דורש מעקב מתמשך"],
      resource_requirements: ["זמן הערכה רב", "מערכת ניהול מתקדמת"]
    },
    suggested_tools: ["Google Sites", "Seesaw", "Mahara", "OneNote"],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו בבירור מה נכלל בפורטפוליו",
      "קבעו מספר מינימלי של עבודות",
      "דרשו רפלקציה על כל עבודה",
      "תנו הנחיות לעיצוב והצגה",
      "קיימו מפגשי יעוץ אישיים"
    ]
  },
  {
    id: "am_09",
    title: "בחינות בעל פה",
    description: "בחינה אישית או קבוצתית המאפשרת לבחון הבנה עמוקה ויכולת ביטוי.",
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "medicine"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["בודק הבנה עמוקה", "מפתח כישורי ביטוי", "מאפשר שאלות המשך"],
      practical: ["מונע רמאות", "מתאים לנושאים מורכבים"],
      student_engagement: ["אישי ומעמיק", "מאפשר דיאלוג"]
    },
    disadvantages: {
      challenges: ["דורש זמן רב", "עלול ליצור חרדה"],
      limitations: ["לא מתאים לכיתות גדולות", "תלוי בכישורי ביטוי"],
      resource_requirements: ["זמן רב למרצה", "מרחב פרטי"]
    },
    suggested_tools: ["Zoom", "Teams", "הקלטה לתיעוד", "רשימת שאלות"],
    time_investment: "substantial",
    implementation_guidelines: [
      "הכינו רשימת שאלות מובנית",
      "תנו זמן הכנה לתלמידים",
      "צרו אווירה נעימה ולא מאיימת",
      "הקלידו או הקליטו לתיעוד",
      "תנו משוב מיידי"
    ]
  },
  {
    id: "am_10",
    title: "יומני למידה רפלקטיביים עם AI",
    description: "הסטודנטים מתעדים את תהליך הלמידה שלהם, כולל שימוש ב-AI, ומבצעים רפלקציה על התהליך.",
    categories: ["introduction"],
    teaching_methods: ["online", "hybrid", "seminar"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["education", "humanities", "social-sciences", "multidisciplinary"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מפתח מטא-קוגניציה", "מעודד למידה מתמשכת", "מתעד התפתחות"],
      practical: ["קל ליישום", "מתאים לקורסים מקוונים"],
      student_engagement: ["אישי ומשמעותי", "מעודד מעורבות"]
    },
    disadvantages: {
      challenges: ["דורש משמעת עצמית", "קשה לבדיקה"],
      limitations: ["לא מתאים לכל הנושאים", "תלוי במוטיבציה"],
      resource_requirements: ["פלטפורמה דיגיטלית", "זמן להנחיה"]
    },
    suggested_tools: ["Google Docs", "Notion", "Padlet", "בלוג אישי"],
    time_investment: "moderate",
    implementation_guidelines: [
      "הגדירו מבנה ברור ליומן",
      "תנו שאלות מנחות לרפלקציה",
      "עודדו תיעוד שימוש ב-AI",
      "תנו משוב קבוע ובונה",
      "קיימו שיתוף תובנות בכיתה"
    ]
  },
  {
    id: "am_11",
    title: "עבודה בזוגות או בקבוצות קטנות",
    description: "מטלות שיתופיות עם הערכה דיפרנציאלית המבוססת על תרומת כל חבר.",
    categories: ["large"],
    teaching_methods: ["workshop", "seminar", "lab", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["business", "engineering", "social-sciences", "multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח כישורי שיתוף", "מעודד למידה עמיתים", "מחזק מעורבות"],
      practical: ["מקטין עומס בדיקה", "מתאים לכיתות גדולות"],
      student_engagement: ["חברתי ומעניין", "מפחית בדידות"]
    },
    disadvantages: {
      challenges: ["קשה להערכה אישית", "עלול להיות לא שוויוני"],
      limitations: ["תלוי בדינמיקה הקבוצתית", "דורש ניהול קונפליקטים"],
      resource_requirements: ["זמן לניהול קבוצות", "מערכת מעקב"]
    },
    suggested_tools: ["Google Workspace", "Slack", "Trello", "Miro"],
    time_investment: "moderate",
    implementation_guidelines: [
      "חלקו קבוצות באופן מאוזן",
      "הגדירו תפקידים ברורים",
      "קבעו מנגנון הערכה עמיתים",
      "קיימו מעקב וביקורת שוטפת",
      "התכוננו לניהול קונפליקטים"
    ]
  },
  {
    id: "am_12",
    title: "אתגרים ביקורתיים על AI",
    description: "הסטודנטים מקבלים פלט של AI ועליהם לזהות שגיאות, הטיות או חולשות.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "online"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["social-sciences", "humanities", "law", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מפתח חשיבה ביקורתית", "מחזק מיומנויות ניתוח", "מכין לעבודה עם AI"],
      practical: ["רלוונטי ומעכשווי", "מפתח מודעות להטיות"],
      student_engagement: ["מאתגר ומעניין", "מפתח מיומנויות חיוניות"]
    },
    disadvantages: {
      challenges: ["דורש הכרה עמוקה עם AI", "משתנה במהירות"],
      limitations: ["תלוי בזמינות דוגמאות", "לא מתאים לכל הנושאים"],
      resource_requirements: ["זמן הכנה רב", "גישה לכלי AI שונים"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "כלי fact-checking"],
    time_investment: "substantial",
    implementation_guidelines: [
      "הכינו דוגמאות עם שגיאות ידועות",
      "הסבירו סוגים שונים של הטיות",
      "תנו כלים לבדיקת עובדות",
      "עודדו שיתוף ממצאים",
      "קיימו דיון על השלכות"
    ]
  },
  {
    id: "am_13",
    title: "מטלות רפלקציה על שימוש ב-AI",
    description: "הסטודנטים מגישים מטלה שנעשתה עם AI, בצירוף רפלקציה על תהליך העבודה והכלים בהם השתמשו.",
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary", "education", "humanities", "social-sciences"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מפתח מודעות למידה", "מעודד שקיפות", "מלמד שימוש אתי"],
      practical: ["מתאים לעידן הנוכחי", "מכין לעבודה עתידית"],
      student_engagement: ["מעודד כנות", "מפחית חרדה משימוש ב-AI"]
    },
    disadvantages: {
      challenges: ["דורש אמון וכנות", "קשה לבדיקה"],
      limitations: ["תלוי בכנות התלמידים", "לא מתאים לכל הקורסים"],
      resource_requirements: ["זמן הדרכה", "פיתוח הנחיות ברורות"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "יומני עבודה"],
    time_investment: "moderate",
    implementation_guidelines: [
      "הגדירו הנחיות ברורות לשימוש",
      "תנו דוגמאות לרפלקציה איכותית",
      "עודדו כנות ושקיפות",
      "תנו משוב על תהליך העבודה",
      "קיימו דיון כיתתי על התובנות"
    ]
  },
  {
    id: "am_14",
    title: "שילוב אירועים אקטואליים",
    description: "מטלות המבוססות על אירועים חדשותיים שעדיין לא נסרקו במלואם על ידי מודלי AI.",
    categories: ["introduction", "large"],
    teaching_methods: ["lecture", "seminar", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["social-sciences", "humanities", "business", "law"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מקשר לעולם האמיתי", "מעדכן ורלוונטי", "מעודד חשיבה ביקורתית"],
      practical: ["קשה להעתקה", "מעודד מעורבות אזרחית"],
      student_engagement: ["מעניין ורלוונטי", "מחבר לחדשות"]
    },
    disadvantages: {
      challenges: ["דורש עדכון מתמשך", "עלול להיות שנוי במחלוקת"],
      limitations: ["לא מתאים לכל הנושאים", "תלוי באירועים חיצוניים"],
      resource_requirements: ["מעקב אחר חדשות", "גמישות בתכנון"]
    },
    suggested_tools: ["אתרי חדשות", "רשתות חברתיות", "מאגרי מידע עכשוויים"],
    time_investment: "moderate",
    implementation_guidelines: [
      "בחרו אירועים רלוונטיים לקורס",
      "הכינו שאלות מנחות לניתוח",
      "עודדו השוואה למושגים מהקורס",
      "תנו זמן לעיכול המידע",
      "קיימו דיון כיתתי על השלכות"
    ]
  },
  {
    id: "am_15",
    title: "מבחני התערבות",
    description: "מבחן שבו חלק מהשאלות דורשות התערבות ותיקון של טקסט או קוד קיים.",
    categories: ["advanced"],
    teaching_methods: ["lab", "workshop", "seminar"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["engineering", "natural-sciences", "humanities", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["בודק הבנה עמוקה", "מפתח כישורי פתרון בעיות", "מדגים יישום מעשי"],
      practical: ["מתאים לתחומים טכניים", "מדגים מיומנויות מקצועיות"],
      student_engagement: ["מאתגר ומעניין", "מדמה עבודה אמיתית"]
    },
    disadvantages: {
      challenges: ["דורש הכנה מורכבת", "קשה לבדיקה"],
      limitations: ["לא מתאים לכל הנושאים", "דורש מומחיות טכנית"],
      resource_requirements: ["זמן הכנה רב", "כלים טכניים"]
    },
    suggested_tools: ["עורכי קוד", "מערכות בדיקה אוטומטיות", "כלי שיתוף"],
    time_investment: "substantial",
    implementation_guidelines: [
      "הכינו דוגמאות עם שגיאות ידועות",
      "תנו הנחיות ברורות לתיקון",
      "הכינו פתרונות לכל התרחישים",
      "תנו זמן מספיק לחשיבה",
      "קיימו דיון על הפתרונות"
    ]
  },
  {
    id: "am_16",
    title: "סימולציות מבוססות AI",
    description: "הסטודנטים משתתפים בסימולציה (למשל, ניהול משבר) ומתמודדים עם תרחישים דינמיים.",
    categories: ["advanced"],
    teaching_methods: ["workshop", "lab", "seminar"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["business", "social-sciences", "medicine", "engineering"],
    implementation_difficulty: 5,
    advantages: {
      pedagogical: ["מדגים יישום מעשי", "מפתח כישורי קבלת החלטות", "מעודד למידה חווייתית"],
      practical: ["מדמה מצבים אמיתיים", "בטוח וללא סיכון"],
      student_engagement: ["מעניין ומאתגר", "מעודד עבודת צוות"]
    },
    disadvantages: {
      challenges: ["דורש הכנה מורכבת", "תלוי בטכנולוגיה"],
      limitations: ["יקר ומורכב", "לא מתאים לכל הנושאים"],
      resource_requirements: ["השקעה טכנית רבה", "הכשרה מקצועית"]
    },
    suggested_tools: ["פלטפורמות סימולציה", "VR/AR", "משחקי תפקידים דיגיטליים"],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו מטרות ברורות לסימולציה",
      "הכינו תרחישים מגוונים",
      "תנו הכשרה מקדימה",
      "קיימו דיון לאחר הסימולציה",
      "תעדו את התובנות"
    ]
  },
  {
    id: "am_17",
    title: "הערכת עמיתים בסיוע AI",
    description: "הסטודנטים מעריכים עבודות של עמיתיהם, כאשר AI מסייע בזיהוי קריטריונים להערכה.",
    categories: ["large"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["multidisciplinary", "education", "humanities", "social-sciences"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח כישורי הערכה", "מעודד למידה עמיתים", "מחזק הבנה"],
      practical: ["מקטין עומס הבדיקה", "מתאים לכיתות גדולות"],
      student_engagement: ["מעודד מעורבות", "מפתח חשיבה ביקורתית"]
    },
    disadvantages: {
      challenges: ["דורש הכשרה", "עלול להיות לא אמין"],
      limitations: ["תלוי באיכות ההערכה", "לא מתאים לכל הנושאים"],
      resource_requirements: ["זמן הכשרה", "מערכת ניהול"]
    },
    suggested_tools: ["Peergrade", "Turnitin PeerMark", "Google Classroom"],
    time_investment: "moderate",
    implementation_guidelines: [
      "הכשירו התלמידים להערכה",
      "תנו קריטריונים ברורים",
      "השתמשו ב-AI לעזרה בהערכה",
      "קיימו מעקב ובקרה",
      "תנו משוב על איכות ההערכה"
    ]
  },
  {
    id: "am_18",
    title: "משימות בסגנון 8200",
    description: "שימוש ב-AI לניתוח טקסטים מורכבים וזיהוי שימוש בתאוריות או מודלים ספציפיים מהקורס.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["social-sciences", "humanities", "law", "multidisciplinary"],
    implementation_difficulty: 5,
    advantages: {
      pedagogical: ["מפתח כישורי ניתוח מתקדמים", "מחזק הבנה תאורטית", "מעודד חשיבה מערכתית"],
      practical: ["מכין לעבודה מקצועית", "מדגים יישום מעשי"],
      student_engagement: ["מאתגר ומעניין", "מפתח מיומנויות חיוניות"]
    },
    disadvantages: {
      challenges: ["דורש מומחיות גבוהה", "מורכב להכנה"],
      limitations: ["מתאים רק לתלמידים מתקדמים", "דורש משאבים רבים"],
      resource_requirements: ["זמן הכנה נרחב", "כלים מתקדמים"]
    },
    suggested_tools: ["כלי ניתוח טקסט", "AI מתקדם", "מאגרי מידע מקצועיים"],
    time_investment: "extensive",
    implementation_guidelines: [
      "בחרו טקסטים מורכבים ורלוונטיים",
      "הכינו מדריך לכלי הניתוח",
      "תנו הכשרה מקדימה",
      "קיימו מעקב צמוד",
      "תעדו את התובנות והמתודולוגיה"
    ]
  },
  {
    id: "am_19",
    title: "דיונים סוקרטיים מתועדים",
    description: "דיונים כיתתיים העוקבים אחר השיטה הסוקרטית, עם תיעוד תהליך החשיבה והתפתחות הרעיונות.",
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "education"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח חשיבה ביקורתית", "מעודד מעורבות פעילה", "מחזק כישורי ויכוח"],
      practical: ["מתאים לנושאים מורכבים", "מעודד למידה עמיתים"],
      student_engagement: ["אינטראקטיבי ומעניין", "מפתח ביטחון עצמי"]
    },
    disadvantages: {
      challenges: ["דורש הכנה מקצועית", "קשה לניהול"],
      limitations: ["לא מתאים לכיתות גדולות", "תלוי בדינמיקה הכיתתית"],
      resource_requirements: ["זמן הכנה", "מיומנויות הנחיה"]
    },
    suggested_tools: ["הקלטה וצילום", "פלטפורמות דיון", "כלי תיעוד"],
    time_investment: "moderate",
    implementation_guidelines: [
      "הכינו שאלות מנחות מראש",
      "צרו אווירה בטוחה לדיון",
      "עודדו השתתפות של כולם",
      "תעדו את התובנות העיקריות",
      "קיימו רפלקציה לסיום"
    ]
  },
  {
    id: "am_20",
    title: "מחקר פעולה כיתתי",
    description: "התלמידים מתכננים ומבצעים מחקר קטן בתחום הקורס, כולל איסוף נתונים וניתוח.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "fieldwork"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["social-sciences", "education", "humanities", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מפתח כישורי מחקר", "מעמיק הבנה תאורטית", "מחזק חשיבה מדעית"],
      practical: ["מכין לעבודה מקצועית", "מדגים יישום מעשי"],
      student_engagement: ["מעניין ורלוונטי", "מאפשר בחירה אישית"]
    },
    disadvantages: {
      challenges: ["דורש הדרכה צמודה", "קשה לביצוע"],
      limitations: ["זמן רב", "דורש משאבים"],
      resource_requirements: ["גישה לנתונים", "כלי מחקר"]
    },
    suggested_tools: ["סקרים דיגיטליים", "כלי ניתוח נתונים", "ספרות מחקר"],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו שאלות מחקר ברורות",
      "תנו הדרכה למתודולוגיה",
      "עזרו באיסוף נתונים",
      "הדריכו בניתוח התוצאות",
      "קיימו הצגת ממצאים"
    ]
  }
];