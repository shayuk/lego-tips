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
    title: "מבחנים עם הגבלת זמן דרסטית",
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
    toolsWithLinks: [
      {
        name: "Moodle Quiz",
        description: "פלטפורמה מתקדמת ליצירת מבחנים עם אפשרויות מגוונות",
        link: "https://moodle.org/course/view.php?id=270"
      },
      {
        name: "Google Forms",
        description: "כלי פשוט ונגיש ליצירת טפסים ומבחנים",
        link: "https://www.google.com/forms/about/"
      },
      {
        name: "Kahoot",
        description: "פלטפורמה אינטראקטיבית למבחנים וחידונים",
        link: "https://kahoot.com/"
      },
      {
        name: "Canvas LMS",
        description: "מערכת ניהול למידה מתקדמת עם יכולות הערכה",
        link: "https://www.instructure.com/canvas"
      }
    ],
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
    description: "שימוש בתכנים ספציפיים ונישתיים מהקורס שקשה למצוא במנועי חיפוש, כמו הקלטות פרטיות או חומר שהוצג בכיתה בלבד.",
    
    // 🆕 תיאור פדגוגי מעודכן עם דוגמה
    fullDescription: `מטלות 'התחכמות' מבוססות על גישה פדגוגית שמטרתה להדגיש הבנה עמוקה של חומר, באמצעות שימוש במידע ייחודי אשר לא זמין באופן פומבי או אינטרנטי.

**דוגמה קונקרטית:** המרצה מציג במהלך סדנה פרטית הקלטה של דיון שבו הוא מפרט ניתוח של מאמר שלא פורסם אונליין. הסטודנטים מקבלים את ההקלטה, צריכים לצפות בה, ואז לנסח מטלה שמתקשרת לתיאוריה שדוברה – למשל: 'כיצד ניתן להחיל את הגישה המתוארת בדקה ה‑12 על מקרה אמיתי שאתם מכירים?' מטלה זו דורשת הבנה אמיתית ועמוקה של החומר.

לא חובה אבל אפשר גם לשלב שיח עם AI – במקרה של שילוב AI, הסטודנט יכול להזין את ההקלטה (או תמלולה שלה) ל‑ChatGPT או Claude, ולבקש ניתוח משלים. אך חשוב שהסטודנט:
1. יאתגר את התשובות שה‑AI נותן—לדוגמה: 'ה‑AI אומר שזו דוגמה למודל X; האם זה תמיד נכון?'
2. יביא טיעונים מבוססי תיאוריה לתמיכה או לביקורת (למשל: 'LB Bloom טען ש… ולכן…')
3. ייספק את תיעוד השיח עם ה‑AI – צילומי מסך, העתק/הדבק או JSON – כחלק מהגשה רשמית.

השלב האחרון של המטלה הוא **כתיבת רפלקציה אישית (~200 מילים)** שבה הסטודנט מתייחס לשאלות: 'מה למדת מהשיח עם ה‑AI?', 'אילו הנחות של ה‑AI ביקרתם?', 'איך זה השפיע על החשיבה שלך כחוקר?'`,

    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מעודד למידה מעמיקה", "מחזק הבנה של חומר נישתי", "מפתח חשיבה ביקורתית"],
      practical: ["מקטין העתקה", "דורש הבנה אמיתית של החומר"],
      student_engagement: ["מעורר עניין תוך שימוש בתוכן אמיתי מתוך השיעור"]
    },
    disadvantages: {
      challenges: ["דורש הכנות מרצה", "משתנה ממטלה למטלה"],
      limitations: ["מתאים בעיקר לקורסים מתקדמים", "לא תמיד אפשרי טכנית"],
      resource_requirements: ["הכנת חומר ייחודי", "מערכת שיתוף והגשה"]
    },
    suggested_tools: ["הקלטות כיתתיות", "דיונים סוקרטיים מוקלטים", "תמלילים", "AI לצורך ניתוח משני"],
    time_investment: "extensive",
    implementation_guidelines: [
      "השתמשו בחומר יחודי שהוצג רק בקורס (הקלטות, דיונים, מחקרים פרטיים)",
      "במקרה שלא צוין חומר ספציפי - כתבו: 'בצעו ניתוח על החומר היחודי מהסדנה'",
      "עודדו ביקורת על ניתוחי AI – לבחון הנחות, להציע טיעונים חלופיים",
      "דרשו מהסטודנטים להגיש צילום מסך או קובץ JSON של השיחה עם ה‑AI",
      "בסוף – הם מוסיפים רפלקציה אישית על התהליך"
    ],

    // 🆕 מקורות להעמקה
    furtherReading: [
      {
        title: "למידה דיגיטלית עצמאית | IUCC",
        link: "https://ai-practices.iucc.ac.il/practices/digital-learning-activity/"
      },
      {
        title: "AI Tools for Research Supervision | IUCC",
        link: "https://ai-practices.iucc.ac.il/practices/ai-tools-for-research-supervision-2/"
      },
      {
        title: "UBC Academic Integrity – שימוש ב‑AI בהוראה",
        link: "https://academicintegrity.ubc.ca/genai/"
      }
    ]
  },
  {
    id: "am_03",
    title: "ניתוח מונחה של פרומפטים",
    description: "הסטודנטים מקבלים פרומפט זהה, מזינים אותו לכלי AI, ואז מנתחים ומבקרים את התשובה שמתקבלת.",
    
    // 🆕 תיאור פדגוגי מעמיק
    fullDescription: `במטלה זו, כל הסטודנטים מקבלים פרומפט זהה מהמרצה — כדי לאפשר השוואה מדויקת בין גישות חשיבה שונות. התהליך כולל:

1. הזנת הפרומפט בכלי AI (כמו ChatGPT או Claude).
2. קבלת תשובה מבוססת AI לאותו פרומפט.
3. שיח אינטראקטיבי עם ה-AI: הסטודנטים מאתגרים את התשובה על ידי ניסוח שאילתות ביקורתיות כגון: "מדוע ההנחה X אינה תמיד נכונה?", "מהם המקרים שבהם הגישה הזו נכשלת?", ו-"הצע הרחבה מחקרית שמשלימה את התשובה".
4. סקירה של מבנה התשובה: ניתוח מרכיבים כמו הצגה של טענות, שימוש בדוגמאות, והגיון המחקר.
5. גיבוש מסקנות מושכלות באמצעות פרספקטיבה מבוססת תיאוריות או מחקר עדכני.

המטרה היא להפעיל חשיבה ביקורתית — לא להשיג תשובות מוכנות. הסטודנטים מפתחים יכולת לפקפק בהנחות AI, לנסח טיעונים מנוגדים, ולתמוך בהן במחקרים מתאימים.`,

    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["humanities", "social-sciences", "education", "multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מחזק חשיבה ביקורתית", "מפתח אוריינות דיגיטלית", "מאפשר הבנה עמוקה"],
      practical: ["משלב כלי AI רלוונטיים", "מתאים לסביבות לימוד מודרכות"],
      student_engagement: ["מעניין ועכשווי", "מחבר בין טכנולוגיה לתוכן לימודי"]
    },
    disadvantages: {
      challenges: ["דורש הכשרות בשימוש ב-AI", "זמן הכנה לשיח ביקורתי"],
      limitations: ["תלוי איכות התשובות של ה-AI", "לא מתאים לכל נושא לימודי"],
      resource_requirements: ["גישה לאינטרנט ו‑AI", "הדרכה בהנחיית שיח"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "AI reflection framework"],
    toolsWithLinks: [
      {
        name: "ChatGPT",
        description: "בוט שיחה מתקדם מבית OpenAI למגוון משימות",
        link: "https://chat.openai.com/"
      },
      {
        name: "Claude",
        description: "אסיסטנט AI מבית Anthropic עם יכולות ניתוח מתקדמות",
        link: "https://claude.ai/"
      },
      {
        name: "Gemini",
        description: "מודל שפה מתקדם מבית Google",
        link: "https://gemini.google.com/"
      },
      {
        name: "Prompt Engineering Guide",
        description: "מדריך מקיף לכתיבת פרומפטים יעילים",
        link: "https://www.promptingguide.ai/"
      }
    ],
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
      "המרצה מספק פרומפט זהה לכל הסטודנטים",
      "הזינו אותו לכלי AI וערכו שיח מתקדם – לא רק תשובה אחת",
      "פרקו את מבנה התשובה: טענות, דוגמאות, הנמקה",
      "אתגרו את ההנחות וכתבו תגובת נגד מבוססת מחקר",
      "השליבו קישור לתיאוריות או מאמרים אקדמיים",
      "הגישו תיעוד של השיח עם ה‑AI (צילום מסך או קובץ שיחה)"
    ],

    // 🆕 מקורות להעמקה
    furtherReading: [
      {
        title: "Helping Students Develop AI Prompting Skills for Critical Thinking",
        link: "https://www.facultyfocus.com/articles/teaching-with-technology-articles/helping-students-develop-ai-prompting-skills-for-critical-thinking/"
      },
      {
        title: "Improving Student‑AI Interaction Through Pedagogical Prompting (ArXiv)",
        link: "https://arxiv.org/html/2506.19107v2"
      },
      {
        title: "Socratic Chatbot for Critical Thinking (Favero et al.)",
        link: "https://arxiv.org/abs/2409.05511"
      }
    ]
  },
  {
    id: "am_04",
    title: "ניתוח סיפור אישי או רפלקציה",
    description: "בקשה לניתוח המבוסס על חוויה אישית, מה שמקשה על AI לספק תשובה אותנטית.",
    
    // 🆕 תיאור פדגוגי מעמיק
    fullDescription: `שיטת ההערכה המבוססת על ניתוח סיפור אישי או רפלקציה מאפשרת לסטודנט לעבור תהליך של חשיפה אישית, זיהוי תהליכים קוגניטיביים ורגשיים, ופיתוח עמדת תבונתי מול התוכן. על פי תיאוריות של reflective practice (Schön, 1983; Boud et al., 1985), התהליך כולל תאור האירוע, ניתוח של איך ומדוע הוא קרה, והסקת מסקנות לעתיד. נרטיבים אישיים – לפי Labov & Waletzky – כוללים מרכיבים של תיאור (what happened), הערכה (why זה חשוב), והקשר (מה זה אומר עבורך עכשיו).

**שילוב AI:**  
במהלך ההגשה הסטודנט מבצע שיח מובנה עם AI (כמו ChatGPT/Claude), שבו הוא מציג את סיפורו, מגיב להצעות אינטרפרטציה של ה-AI, ושואל שאלות ביקורתיות (למשל: "למה לדעתך אירוע זה השפיע עליי כך? מה תרצה לשנות?"). הדיאלוג תועד בהגשה – צילומי מסך או transcript – כדי לוודא שהסטודנט לא התבסס רק על AI אלא השתמש בו ככלי להעמקה רפלקטיבית.

סיום העבודה יכלול פסקה של כ‑200 מילים שבה הסטודנט משקף על תהליך הכתיבה והשיח עם ה-AI: מה למד על עצמו, אילו תפיסות נחשפו, ומהו ההשפעה האינטלקטואלית-רגשית של השימוש ב-AI.

**יתרונות שיטתיים:**
- מחזק מטא‑קוגניציה וכתיבה רפלקטיבית
- מפתח כישורי ניתוח עצמי והבנה תרבותית של תהליך אישי
- שילוב ה-AI מאפשר הרחבה של פרספקטיבות, שאלות מכוונות ושיח ביקורתי — כל זאת תוך בקרה על חלק הסטודנט.`,
    
    categories: ["introduction"],
    teaching_methods: ["online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפעיל אפקט מבחן (testing effect) לחיזוק שינון וידיעה לטווח הארוך", "מאפשר הערכה מהירה ואמינה"],
      practical: ["מאגר אוטומטי מאפשר התחדשות מתמדת של מבחנים עם AI", "הגבלה על שיתופים בזמן אמת"],
      student_engagement: ["לחץ זמן מעלה ערנות ומניע את הסטודנט להתרכז"]
    },
    disadvantages: {
      challenges: ["דרוש הכנה טכנית של מאגר שאלות", "יכול ליצור תחושת לחץ אצל חלק מהסטודנטים"],
      limitations: ["טווח מענה מוגבל – פחות עומק בחשיבה"],
      resource_requirements: ["מערכת הגשה מקוונת עם הגבלת זמן", "API או ממשק ל AI לייצור שאלות"]
    },
    suggested_tools: [
      "ChatGPT/GPT 4 API",
      "Quizbot.ai – כלי AI ליצירת שאלות אוטומטית", 
      "Google Forms עם תוסף להגבלת זמן",
      "ClassMarker – מערכת מבחנים מקצועית",
      "FlexiQuiz – כלי קל ונוח למבחנים עם טיימר"
    ],
    toolsWithLinks: [
      {
        name: "ChatGPT/GPT 4 API",
        description: "בוט AI מתקדם ליצירת שאלות מבחן אוטומטיות",
        link: "https://chat.openai.com"
      },
      {
        name: "Quizbot.ai",
        description: "כלי AI ליצירת שאלות אוטומטית",
        link: "https://quizbot.ai"
      },
      {
        name: "Google Forms",
        description: "פלטפורמת יצירת טפסים עם תוסף להגבלת זמן",
        link: "https://forms.google.com"
      },
      {
        name: "ClassMarker",
        description: "מערכת מבחנים מקצועית",
        link: "https://www.classmarker.com"
      },
      {
        name: "FlexiQuiz",
        description: "כלי קל ונוח למבחנים עם טיימר",
        link: "https://www.flexiquiz.com"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "הכינו את הסטודנטים להגשה",
      "הסבירו את המטרה והמשמעות של המבחן",
      "הסבירו את התהליך ההערכה",
      "הסבירו את הסטנדרטים והכללות",
      "הסבירו את התהליך ההערכה וההגשה",
      "הסבירו את התהליך ההערכה וההגשה בזמן"
    ],

    // 🆕 מקורות להעמקה
    furtherReading: [
      {
        title: "Using Reflective Writing to Deepen Student Learning (UMN)",
        link: "https://wac.umn.edu/tww-program/teaching-resources/using-reflective-writing"
      },
      {
        title: "Reflective practice primer (Lifescied)",
        link: "https://www.lifescied.org/doi/10.1187/cbe.22-07-0148"
      },
      {
        title: "Narrative analysis: oral personal experience (Labov & Waletzky)",
        link: "https://en.wikipedia.org/wiki/William_Labov"
      }
    ]
  },
  {
    id: "am_05",
    title: "AI השוואה וניתוח ביקורתי של",
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
      limitations: ["תלוי בזמינות דוגמאות", "לא מתאים לכל הנושאים"],
      resource_requirements: ["גישה לכלי AI שונים", "זמן הכנה"]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "Perplexity", "כלי השוואה"],
    toolsWithLinks: [
      {
        name: "ChatGPT",
        description: "בוט שיחה מתקדם מבית OpenAI למגוון משימות",
        link: "https://chat.openai.com/"
      },
      {
        name: "Claude",
        description: "אסיסטנט AI מבית Anthropic עם יכולות ניתוח מתקדמות",
        link: "https://claude.ai/"
      },
      {
        name: "Gemini",
        description: "מודל שפה מתקדם מבית Google",
        link: "https://gemini.google.com/"
      },
      {
        name: "Perplexity",
        description: "מנוע חיפוש מונח AI לחקר נושאים",
        link: "https://www.perplexity.ai/"
      }
    ],
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
    toolsWithLinks: [
      {
        name: "Moodle",
        description: "מערכת ניהול למידה פתוחה ומתקדמת",
        link: "https://moodle.org/"
      },
      {
        name: "Blackboard",
        description: "פלטפורמת למידה דיגיטלית למוסדות חינוך",
        link: "https://www.blackboard.com/"
      },
      {
        name: "Canvas",
        description: "מערכת ניהול למידה מתקדמת ונגישה",
        link: "https://www.instructure.com/canvas"
      },
      {
        name: "Microsoft Teams for Education",
        description: "פלטפורמת למידה משולבת מבית Microsoft",
        link: "https://www.microsoft.com/education/products/teams"
      }
    ],
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
    
    // 🆕 תיאור פדגוגי מעמיק
    fullDescription: `עבודת פרויקט מאפשרת לסטודנטים להעמיק בתוכן ובמיומנויות תוך שילוב של חשיבה יצירתית, תכנית פעולה והתנסות בעולם האמיתי.
העבודה מכילה שלבים של תכנון, ביצוע, בדיקה והפקת תוצר, ומאפשרת פיתוח כישורי פתרון בעיות מורכבות, עבודת צוות, והטמעת ידע תיאורטי בפועל.
כאשר משלבים AI בתהליך – ניתן להפוך את הפרויקט לחוויה עשירה ומשמעותית יותר:
• **שיח ביקורתי עם AI** – הסטודנט מנהל שיחה עם ChatGPT/Claude, מציג את מטרות הפרויקט, מקבל שאלות מנחות, ביקורת והצעות לשיפור, תוך שהוא מציג באופן ביקורתי את המסקנות של הכלי.
• **תיעוד השיח** – יש להגיש צילום מסך או יומן שיחה, כדי להמחיש את התהליך וההבנה שקיבל הסטודנט מהקריאה והניתוח AI.
• **חשיבה רפלקטיבית** – בסוף הפרויקט, הסטודנט כותב כ־200 מילים על החשיבה שלו בתהליך – כיצד AI תמך, אילו אתגרים נתקלו בו, מה למד על הזדמנויות וסיכונים.
השילוב כזה, המורכב מיישום, דיאלוג עם בינה וחשיבה על החשיבה, מחזק את מעורבות הלומד, מכשיר אותו לחשיבה מטא-קוגניטיבית, ומבטיח שהפרויקט הוא מוצר אינטגרלי של הלומד — לא של הכלי.`,

    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab", "fieldwork"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["engineering", "arts", "business", "multidisciplinary"],
    implementation_difficulty: 4,

    advantages: {
      pedagogical: ["מפתח מיומנויות מורכבות", "מחזק למידה מעמיקה", "מעודד יצירתיות"],
      practical: ["מכין לעבודה מקצועית", "מדגים יכולות מעשיות"],
      student_engagement: ["מאתגר ומעניין", "מאפשר ביטוי אישי"]
    },
    disadvantages: {
      challenges: ["דורש הדרכה צמודה", "קשה להערכה"],
      limitations: ["זמן רב", "לא מתאים לכל הנושאים"],
      resource_requirements: ["זמן הדרכה רב", "משאבים טכניים"]
    },
    suggested_tools: ["GitHub", "Google Workspace", "Trello", "Slack", "ChatGPT", "Claude"],
    toolsWithLinks: [
      {
        name: "GitHub",
        description: "פלטפורמה לניהול קוד ושיתוף פעולה בפרויקטים",
        link: "https://github.com/"
      },
      {
        name: "Google Workspace",
        description: "חבילת כלי עבודה שיתופית מבית Google",
        link: "https://workspace.google.com/"
      },
      {
        name: "Trello",
        description: "כלי ניהול משימות ופרויקטים בסגנון לוח קאנבן",
        link: "https://trello.com/"
      },
      {
        name: "Slack",
        description: "פלטפורמת תקשורת וניהול צוותים",
        link: "https://slack.com/"
      },
      {
        name: "ChatGPT",
        description: "בוט שיחה מתקדם מבית OpenAI למגוון משימות",
        link: "https://chat.openai.com/"
      },
      {
        name: "Claude",
        description: "אסיסטנט AI מבית Anthropic עם יכולות ניתוח מתקדמות",
        link: "https://claude.ai/"
      }
    ],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו מטרות ברורות לפרויקט",
      "קבעו ציוני דרך ומועדי הגשה",
      "תנו משוב בשלבים שונים",
      "עודדו עבודה בצוותים",
      "הכינו תבנית להצגת הפרויקט",
      "הסטודנטים יתבקשו לצרף צילום מסך או קובץ טקסט עם תיעוד השיחה שלהם עם AI",
      "בסיומו, תכתבו 200 מילים רפלקטיביות על תהליך העבודה והשימוש בכלי AI"
    ],

    // 🆕 מקורות אקדמיים ורשמיים
    furtherReading: [
      {
        title: "עיצוב עוזרים דידקטיים מבוססי AI לצורכי הנחייה / כתיבת מחקר",
        link: "https://ai-practices.iucc.ac.il/practices/ai-tools-for-research-supervision-2/"
      },
      {
        title: "שימוש בכלי בינה מלאכותית לתכנון ויצירה של פעילויות למידה דיגיטליות",
        link: "https://ai-practices.iucc.ac.il/practices/digital-learning-activity/"
      }
    ]
  },
  {
    id: "am_08",
    title: "הערכת פורטפוליו (תיק עבודות)",
    description: "הערכה מתמשכת של אוסף עבודות לאורך הסמסטר, המציגה התפתחות ולמידה.",

    // 🆕 תיאור פדגוגי מעמיק
    fullDescription: `הערכת פורטפוליו היא שיטת הערכה איכותנית הממוקדת בתהליך הלמידה ולא רק בתוצר הסופי. תיק העבודות כולל אוסף של משימות, תוצרים ורפלקציות המציגים את ההתפתחות האישית והאקדמית של הסטודנט לאורך הקורס. זוהי גישה מבוססת קונסטרוקטיביזם המעצימה את הלומד, מאפשרת ביטוי עצמי, ומקדמת מטא-קוגניציה.

הפורטפוליו מאפשר ניתוח עצמי של הלומד, ביסוס קשרים בין ידע תאורטי לבין יישום מעשי, ומתן מרחב ללמידה מותאמת אישית. הערכה זו מתאימה במיוחד לקורסים יצירתיים, חינוכיים וחברתיים – שם יש ערך משמעותי לתהליך, לרפלקציה ולהבעה אישית. היא גם מחזקת את תחושת הבעלות של הסטודנט על תהליך הלמידה ומעודדת אחריות אישית.`,

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
    toolsWithLinks: [
      {
        name: "Google Sites",
        description: "בניית אתרים פשוטים לפורטפוליו דיגיטלי",
        link: "https://sites.google.com/"
      },
      {
        name: "Seesaw",
        description: "פלטפורמה לפורטפוליו דיגיטלי ולמידה",
        link: "https://web.seesaw.me/"
      },
      {
        name: "Mahara",
        description: "מערכת פורטפוליו אקדמית מתקדמת",
        link: "https://mahara.org/"
      },
      {
        name: "OneNote",
        description: "מערכת רשימות ותיעוד מבית Microsoft",
        link: "https://www.onenote.com/"
      }
    ],
    time_investment: "extensive",

    implementation_guidelines: [
      "הגדירו בבירור מה נכלל בפורטפוליו",
      "קבעו מספר מינימלי של עבודות",
      "דרשו רפלקציה על כל עבודה",
      "תנו הנחיות לעיצוב והצגה",
      "קיימו מפגשי יעוץ אישיים"
    ],

    // 🆕 מקורות להעמקה
    furtherReading: [
      {
        title: "AI ככלי תומך בהנחיית מחקר | IUCC",
        link: "https://ai-practices.iucc.ac.il/practices/ai-tools-for-research-supervision-2/"
      },
      {
        title: "למידה דיגיטלית עצמאית | IUCC",
        link: "https://ai-practices.iucc.ac.il/practices/digital-learning-activity/"
      }
    ]
  },
  {
    id: "am_09",
    title: "בחינות בעל פה",
    description: "בחינה אישית או קבוצתית המאפשרת לבדוק הבנה עמוקה ויכולת ביטוי.",

    // 🆕 הסבר פדגוגי מעמיק כולל שילוב AI
    fullDescription: `בחינות בעל פה הן כלי אסטרטגי לבחינת הבנה מעמיקה, שיח ביקורתי ולכידת כישורי ביטוי ותקשורת בין-אישית. שיטה זו מאפשרת למרצה להגיב בזמן אמת לתשובות התלמיד, לשאול שאלות המשך ולבחון נימוקים — מאפשרת גמישות ודיוק שבמבחן כתוב לעיתים חסרים.

**💡 שילוב AI בבחינה בעל פה:**
1. הקלטת שיח הכיתה או האינטראקציה האינדיבידואלית.
2. שימוש בכלי תמלול מבוסס AI (כמו Whisper או Google Speech-to-Text) כדי להמיר את ההקלטה לטקסט.
3. העברת הטקסט ל-LLM (כמו ChatGPT/Claude) לניתוח: זיהוי מילות מפתח, רמת חשיבה (לפי בלום), מיומנויות שיח וכו'.
4. הבוט יכול להפיק משוב אוטומטי ראשון לציון חוזקות, חולשות, ולהציע "שאלות המשך" עומקיות.
5. התלמידים יכולים לקרוא את המשוב ולחדד את השיח, המרצה מסכם ומעמיק חשיבה.

שילוב זה לא רק מאפשר תיעוד וניתוח מהיר — אלא גם משחרר זמן למרצה למיקוד בדיאלוג איכותי, מעודד למידה רפלקטיבית ומצמצם הטיות אנושיות.`,

    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "medicine"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["בודק הבנה מעמיקה", "מפתח כישורי ביטוי ותקשורת", "מאפשר דיאלוג אנושי"],
      practical: ["מונע רמאות", "תומך במניעת חשש וחרדה", "מאפשר התעמקות בזמן אמת"],
      student_engagement: ["אישי ומעמיק", "מתאים להתפתחות מקצועית"]
    },
    disadvantages: {
      challenges: ["דורש זמן רב", "עלול ליצור חרדה אצל חלק מהתלמידים"],
      limitations: ["לא מתאים לכיתות גדולות", "תלוי בכישורי הדיבור של הסטודנטים"],
      resource_requirements: ["כלי הקלטה + תמלול", "זמן הערכה נורמטיבי"]
    },
    suggested_tools: ["Zoom", "Teams", "Whisper", "Google Speech-to-Text", "ChatGPT"],
    toolsWithLinks: [
      {
        name: "Zoom",
        description: "פלטפורמת וידאו קונפרנס עם הקלטה",
        link: "https://zoom.us"
      },
      {
        name: "Microsoft Teams",
        description: "פלטפורמת שיתוף פעולה עם הקלטה",
        link: "https://teams.microsoft.com"
      },
      {
        name: "OpenAI Whisper",
        description: "כלי AI לתמלול אודיו איכותי",
        link: "https://openai.com/research/whisper"
      },
      {
        name: "Google Speech-to-Text",
        description: "שירות תמלול אוטומטי של Google",
        link: "https://cloud.google.com/speech-to-text"
      },
      {
        name: "ChatGPT",
        description: "כלי AI לניתוח טקסט ושאלות המשך",
        link: "https://chat.openai.com"
      }
    ],
    time_investment: "substantial",
    implementation_guidelines: [
      "הכינו רשימת שאלות מובנית מראש",
      "ספקו זמן הכנה לתלמידים",
      "השתמשו בכלי AI לתמלול וניתוח",
      "תנו ל־AI לייצר משוב ראשוני ומשמתי",
      "שתי תמימות: ״הודעות AI הן מסגרת, המרצה מוסיף עומק״"
    ],

    // 🆕 מקורות להעמקה
    furtherReading: [
      {
        title: "AI-powered oral assessment (Socratic Mind)",
        link: "https://gatech.edu/news/ai-oral-assessment-tool-uses-socratic-method-test-students-knowledge"
      },
      {
        title: "Should oral examination be reimagined in the era of AI?",
        link: "https://pubmed.ncbi.nlm.nih.gov/39814611"
      },
      {
        title: "To be with artificial intelligence in oral test or not to be",
        link: "https://languagetestingasia.springeropen.com/articles/10.1186/s40468-024-00321-0"
      },
      {
        title: "Using AI to generate follow‑up questions in an oral assessment",
        link: "https://paulgmoss.com/2025/03/24/using-ai-to-generate-follow-up-questions-in-an-oral-assessment/"
      }
    ]
  },
  {
    id: "am_10",
    title: "יומני למידה רפלקטיביים עם AI",
    description: "הסטודנטים מתעדים את תהליך הלמידה שלהם, כולל שימוש ב-AI, ומבצעים רפלקציה על התהליך.",

    // 🆕 תיאור פדגוגי מעמיק
    fullDescription: `יומני למידה רפלקטיביים הם כלי הערכה איכותני שנועד לקדם למידה עצמית, מודעות מטא-קוגניטיבית, והעמקת ההבנה של חומר הלימוד. בשילוב עם כלי בינה מלאכותית (AI), הסטודנט לא רק מתעד את תהליך הלמידה שלו אלא גם מנהל דיאלוג עם טכנולוגיה חכמה – שיכולה להציע הבהרות, לשאול שאלות מנחות, ואף לספק משוב מיידי.

השיטה מעודדת את הלומד להתבונן בעצמו, לנתח את דרך החשיבה שלו, לבחון את השימוש בכלים טכנולוגיים, ולבחור אסטרטגיות למידה שמתאימות לו באופן אישי. יומנים אלה מחזקים את המעורבות הרגשית והאינטלקטואלית של הסטודנט בלמידה, במיוחד בסביבות היברידיות או מקוונות.

בנוסף, מדובר בכלי שמאפשר למרצה הצצה לתהליך הלמידה ולא רק לתוצאה הסופית – מה שמוביל להוראה מותאמת אישית וליחסי מרצה-סטודנט משמעותיים יותר. השימוש ב-AI ביומני למידה גם מכין את הסטודנטים לשוק עבודה שבו כלים טכנולוגיים מונחי בינה הופכים לכלי חשיבה שגרתיים.`,

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
    toolsWithLinks: [
      {
        name: "Google Docs",
        description: "עורך מסמכים שיתופי מבית Google",
        link: "https://docs.google.com/"
      },
      {
        name: "Notion",
        description: "פלטפורמה רב-תכליתית לכתיבה וארגון ידע",
        link: "https://notion.so/"
      },
      {
        name: "Padlet",
        description: "לוח וירטואלי לשיתוף רעיונות ותובנות",
        link: "https://padlet.com/"
      },
      {
        name: "WordPress",
        description: "פלטפורמה ליצירת בלוגים אישיים",
        link: "https://wordpress.com/"
      }
    ],
    time_investment: "moderate",

    implementation_guidelines: [
      "הגדירו מבנה ברור ליומן",
      "תנו שאלות מנחות לרפלקציה",
      "עודדו תיעוד שימוש ב-AI",
      "תנו משוב קבוע ובונה",
      "קיימו שיתוף תובנות בכיתה"
    ],

    // 🆕 מקור להעמקה
    furtherReading: [
      {
        title: "למידה דיגיטלית עצמאית | IUCC",
        link: "https://ai-practices.iucc.ac.il/practices/digital-learning-activity/"
      }
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
    toolsWithLinks: [
      {
        name: "Google Workspace",
        description: "חבילת כלי עבודה שיתופית מבית Google",
        link: "https://workspace.google.com/"
      },
      {
        name: "Slack",
        description: "פלטפורמת תקשורת וניהול צוותים",
        link: "https://slack.com/"
      },
      {
        name: "Trello",
        description: "כלי ניהול משימות ופרויקטים בסגנון לוח קאנבן",
        link: "https://trello.com/"
      },
      {
        name: "Miro",
        description: "לוח שיתוף וירטואלי לעבודה חזותית",
        link: "https://miro.com/"
      }
    ],
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
    toolsWithLinks: [
      {
        name: "Peergrade",
        description: "פלטפורמה מתמחה בהערכת עמיתים ומשוב",
        link: "https://www.peergrade.io/"
      },
      {
        name: "Turnitin PeerMark",
        description: "כלי הערכת עמיתים מתקדם מבית Turnitin",
        link: "https://www.turnitin.com/products/feedback-studio/peermark"
      },
      {
        name: "Google Classroom",
        description: "פלטפורמת למידה דיגיטלית עם יכולות הערכה",
        link: "https://classroom.google.com/"
      },
      {
        name: "Flipgrid",
        description: "פלטפורמה לשיתוף וידאו ומשוב עמיתים",
        link: "https://flipgrid.com/"
      }
    ],
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
    description: "סריקה מקיפה באינטרנט של חומרים אקטואליים (מאמרי חדשות, פוסטים, ניתוחים) בהם נעשה שימוש בתיאוריות או מודלים מהקורס. הסטודנטים מבצעים ניתוח ביקורתי וחיבור מנומק האם הפרשנות או השימוש בתיאוריה מדויק, שגוי או מוטעה.",
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["social-sciences", "humanities", "law", "multidisciplinary"],
    implementation_difficulty: 4,
    advantages: {
      pedagogical: ["מפתח חשיבה ביקורתית", "מחזק הבנה תאורטית", "מקשר תיאוריה למציאות", "מפתח כישורי מחקר"],
      practical: ["מתרגל זיהוי שימוש שגוי בתיאוריות", "מכין לעבודה מקצועית", "מעודד מעורבות אזרחית"],
      student_engagement: ["מעניין ורלוונטי", "מתחבר לעולם האמיתי", "מפתח מודעות לשימוש לא נכון בתיאוריות"]
    },
    disadvantages: {
      challenges: ["דורש הכרה עמוקה של התיאוריות", "מחייב סריקה נרחבת באינטרנט"],
      limitations: ["תלוי בזמינות דוגמאות אקטואליות", "עלול להיות שנוי במחלוקת"],
      resource_requirements: ["זמן מחקר רב", "גישה למגוון מקורות מידע"]
    },
    suggested_tools: ["Google Scholar", "אתרי חדשות", "רשתות חברתיות", "מאגרי מאמרים", "כלי חיפוש מתקדמים"],
    time_investment: "substantial",
    implementation_guidelines: [
      "הגדירו בבירור אילו תיאוריות מהקורס יש לחפש",
      "דרשו סריקה של לפחות 3-5 מקורות שונים מהתקופה האחרונה",
      "הנחו לזהות איך התיאוריה מופיעה בהקשר הפופולרי/תקשורתי",
      "דרשו ניתוח ביקורתי: האם השימוש נכון? מה השגיאות? איך צריך להיות?",
      "דוגמה: 'חוק הג'ונגל' בהקשר עסקי (מול תיאוריית האבולוציה האמיתית)",
      "עודדו הבאת דוגמאות מגוונות מתחומים שונים (פוליטיקה, כלכלה, חברה)",
      "קיימו דיון כיתתי על הממצאים והשלכותיהם"
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
  },
  {
    id: "am_21",
    title: "מבחנים קצרים ומוגבלים בזמן (Timed Short Quizzes)",
    description: "מבחנים קצרים, בעלי זמן תגובה מוגבל, תוך שימוש בשאלות רב־ברירתיות עם שני מסיחים (כן/לא, נכון/לא נכון).",
    
    fullDescription: `שיטה זו עוסקת ביצירת מבחנים קצרים מאוד, שמתבססים על שאלות רב־ברירתיות או שאלות כן/לא בלבד. ניתן ליישם את השיטה בשני אופנים (כל אחד לחוד או יחד):

**1. מאגר שאלות גדול:** המרצה מכין מאגר גדול של שאלות מהקורס, ואז המערכת בוחרת באופן אקראי שאלות שונות לכל סטודנט.
**2. שאלות רב־ברירתיות עם שני מסיחים בלבד:** כל שאלה כוללת אפשרויות פשוטות – כן/לא או נכון/לא נכון – מה שמאפשר מענה מהיר מאוד.

**שילוב AI (בצד המרצה):** המרצה יכול להשתמש בכלי AI כמו ChatGPT או Quizbot.ai ליצירת מאגר רחב של שאלות רב־ברירתיות קצרות: מגדירים נושא, פורמט (נכון/לא נכון), ו AI מייצר עשרות שאלות במהירות.

**כלים מומלצים להטמעה:**
- **Google Forms עם תוסף Time Limits** – מאפשר הגבלת מענה בזמן ושמירה אוטומטית של התשובות.
- **ClassMarker** – מאפשר הגדרת זמנים, בחירה אקראית מהמאגר, שמירת תוצרים ישירות למרצה.
- **FlexiQuiz** – מאפשר יצירת מבחנים עם טיימר, אקראיות ושמירת תוצאות מול המרצה.

**למה זה עובד?** זמן מענה קצר ואקראיות בשאלות מקשים על שיתוף או שימוש ב AI במהלך המבחן, ולכן ניתן לבצע אותו מהבית ללא השגחה.

**איך ליישם:**
1. המרצה יוצר מאגר של עשרות עד מאות שאלות רב־ברירתיות קצרות.
2. לשם כך ניתן להשתמש בכלי AI (כמו ChatGPT או Quizbot.ai) לייצור מהיר של שאלות – דגש על פורמט כן/לא.
3. מגדיר זמן תגובה קצר לכל שאלה (למשל 30–60 שניות).
4. מוודא שמערכת הבחינה בוחרת שאלות באופן אקראי לכל סטודנט.
5. קובע שהמערכת שומרת את התשובות אוטומטית ושולחת אותן ישירות למרצה.
6. מוודא שהטיימר מתחיל ברגע הסטודנט לחץ על 'התחל' ונעצר במועד סיום.

**הערות פרקטיות:**
- ב ClassMarker אפשר להגדיר זמני זמינות ומגבלת זמן מדויקת לכל מבחן.
- ב FlexiQuiz קיימת אפשרות לזמנים מוגדרים מראש ואוטומציה של ניקוד ושמירת תוצרים.`,

    categories: ["introduction"],
    teaching_methods: ["online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפעיל אפקט מבחן (testing effect) לחיזוק שינון וידיעה לטווח הארוך", "מאפשר הערכה מהירה ואמינה"],
      practical: ["מאגר אוטומטי מאפשר התחדשות מתמדת של מבחנים עם AI", "הגבלה על שיתופים בזמן אמת"],
      student_engagement: ["לחץ זמן מעלה ערנות ומניע את הסטודנט להתרכז"]
    },
    disadvantages: {
      challenges: ["דרוש הכנה טכנית של מאגר שאלות", "יכול ליצור תחושת לחץ אצל חלק מהסטודנטים"],
      limitations: ["טווח מענה מוגבל – פחות עומק בחשיבה"],
      resource_requirements: ["מערכת הגשה מקוונת עם הגבלת זמן", "API או ממשק ל AI לייצור שאלות"]
    },
    suggested_tools: [
      "ChatGPT/GPT 4 API",
      "Quizbot.ai – כלי AI ליצירת שאלות אוטומטית", 
      "Google Forms עם תוסף להגבלת זמן",
      "ClassMarker – מערכת מבחנים מקצועית",
      "FlexiQuiz – כלי קל ונוח למבחנים עם טיימר"
    ],
    toolsWithLinks: [
      {
        name: "ChatGPT/GPT 4 API",
        description: "בוט AI מתקדם ליצירת שאלות מבחן אוטומטיות",
        link: "https://chat.openai.com"
      },
      {
        name: "Quizbot.ai",
        description: "כלי AI ליצירת שאלות אוטומטית",
        link: "https://quizbot.ai"
      },
      {
        name: "Google Forms",
        description: "פלטפורמת יצירת טפסים עם תוסף להגבלת זמן",
        link: "https://forms.google.com"
      },
      {
        name: "ClassMarker",
        description: "מערכת מבחנים מקצועית",
        link: "https://www.classmarker.com"
      },
      {
        name: "FlexiQuiz",
        description: "כלי קל ונוח למבחנים עם טיימר",
        link: "https://www.flexiquiz.com"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "הכינו מאגר של עשרות עד מאות שאלות רב ברירתיות קצרות לפי נושאים בקורס",
      "השתמשו ב AI לייצור מהיר של מספר שאלות גדול – שלבו תבנית מהקורס עם פורמט כן/לא",
      "במערכת ההגשה – קבעו זמן תגובה קצר מאוד (30–60 שניות לשאלה)",
      "הגרילו שאלות אקראיות מכל מאגר לכל סטודנט",
      "וודאו שהתשובות נשמרות אוטומטית ונשלחות למרצה בלבד",
      "הטיימר יתחיל בלחיצה ויגמר בדיוק בזמן שקבעתם"
    ],

    furtherReading: [
      {
        title: "Testing effect – אפקט המבחן בהוראה",
        link: "https://en.wikipedia.org/wiki/Testing_effect"
      },
      {
        title: "Automatic item generation (AIG)",
        link: "https://en.wikipedia.org/wiki/Automatic_item_generation"
      },
      {
        title: "AI Created Quizzes Can Save Teachers Time While Boosting Student Achievement",
        link: "https://www.the74million.org/article/ai-created-quizzes-can-save-teachers-time-while-boosting-student-achievement/"
      }
    ]
  }
];
