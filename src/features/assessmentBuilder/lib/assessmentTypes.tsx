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

export const assessmentMethods: AssessmentMethod[] = [
  {
    id: "am_01",
    title: "מבחנים עם הגבלת זמן דרסטית",
    description: "מבחנים קצרים עם מגבלת זמן משמעותית המונעת חיפוש תשובות ומעודדת שליפה מהירה של ידע שנלמד.",
    fullDescription: "שיטה זו מתמקדת בהערכת יכולת השליפה המהירה של ידע בסיסי וזיכרון. על ידי הגבלת הזמן באופן דרסטי (למשל, 30-60 שניות לשאלה), המבחן מקשה על סטודנטים להשתמש בעזרים חיצוניים או להתייעץ, ובכך בודק את הידע המופנם שלהם. זהו כלי יעיל במיוחד לקורסי מבוא או לקורסים הדורשים שינון של מונחים, נוסחאות או עובדות בסיסיות. עם זאת, חשוב לזכור ששיטה זו אינה מודדת הבנה עמוקה, יצירתיות או חשיבה ביקורתית.",
    categories: ["introduction", "large"],
    teaching_methods: ["lecture", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["humanities", "social-sciences", "natural-sciences", "multidisciplinary"],
    implementation_difficulty: 2,
    time_investment: "minimal",
    advantages: {
      pedagogical: ["מעודד שינון וחזרה", "בודק זכירה מהירה", "מפעיל את אפקט המבחן (testing effect)"],
      practical: ["קל ליישום במערכות LMS", "בדיקה מהירה ואוטומטית", "מתאים לכיתות גדולות מאוד"],
      student_engagement: ["יוצר תחושת דחיפות וממריץ", "מספק משוב מיידי על רמת השליטה בחומר"]
    },
    disadvantages: {
      challenges: ["לא בודק הבנה עמוקה או יישום", "עלול לגרום לחרדת בחינות", "דורש מאגר שאלות גדול למניעת חזרתיות"],
      limitations: ["מתמקד בזכירה בלבד", "לא מתאים להערכת מיומנויות מורכבות"],
      resource_requirements: ["פלטפורמה דיגיטלית למבחנים", "מאגר שאלות מגוון ואיכותי"]
    },
    suggested_tools: ["Moodle Quiz", "Google Forms", "Kahoot", "Socrative"],
    toolsWithLinks: [
      {
        name: "Moodle Quiz",
        description: "כלי מובנה במערכת Moodle ליצירת בחנים עם הגדרות זמן מתקדמות.",
        link: "https://docs.moodle.org/404/en/Quiz_activity"
      },
      {
        name: "Google Forms with Timer",
        description: "ניתן להוסיף טיימר לטופסי גוגל באמצעות תוספים כמו 'Quilgo' או 'Form Timer'.",
        link: "https://workspace.google.com/marketplace/app/form_timer/533353227343"
      },
      {
        name: "Kahoot!",
        description: "פלטפורמת משחוק פופולרית המבוססת על מהירות תגובה.",
        link: "https://kahoot.com/"
      },
      {
        name: "Socrative",
        description: "כלי להפעלת חידונים ותחרויות בזמן אמת בכיתה.",
        link: "https://www.socrative.com/"
      }
    ],
    rubric_template: [
      {
        name: "דיוק תשובות",
        description: "רמת הנכונות של התשובות שסופקו.",
        levels: {
          excellent: "95-100% תשובות נכונות",
          good: "85-94% תשובות נכונות",
          satisfactory: "70-84% תשובות נכונות",
          needs_improvement: "פחות מ-70% תשובות נכונות"
        },
        weight: 0.8
      },
      {
        name: "מהירות השלמה",
        description: "היכולת לענות על כל השאלות במסגרת הזמן המוקצב.",
        levels: {
          excellent: "השלים את כל השאלות עם זמן למעבר חוזר",
          good: "השלים את כל השאלות בקושי במסגרת הזמן",
          satisfactory: "השלים את רוב השאלות",
          needs_improvement: "לא הספיק להשלים חלק ניכר מהשאלות"
        },
        weight: 0.2
      }
    ],
    implementation_guidelines: [
      "הגדירו בבירור את מטרת המבחן: בדיקת שליפה מהירה ולא הבנה עמוקה.",
      "קבעו מגבלת זמן ריאלית אך מאתגרת, בדרך כלל 30-60 שניות לשאלה.",
      "השתמשו בשאלות סגורות: ברירה מרובה, נכון/לא נכון, או השלמת מילה.",
      "צרו מאגר שאלות גדול והגדירו הגרלה אקראית למניעת העתקה.",
      "הודיעו לסטודנטים מראש על פורמט המבחן והתאמנו איתם בכיתה.",
      "ודאו שהתשתית הטכנולוגית יציבה ויכולה לתמוך בכל הסטודנטים בו-זמנית."
    ],
    furtherReading: [
        {
            title: "The Testing Effect: A Powerful Tool for Learning",
            link: "https://www.psychologicalscience.org/teaching/myth-busting-the-testing-effect-a-powerful-tool-for-learning.html"
        },
        {
            title: "Best Practices for Timed Online Exams",
            link: "https://teaching.uwo.ca/pdf/online-teaching/Best-Practices-for-Timed-Online-Exams.pdf"
        }
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
    ],
    toolsWithLinks: [
      {
        name: "AI לצורך ניתוח משני",
        description: "כלי בינה מלאכותית לניתוח משלים של חומרים ייחודיים (כגון ChatGPT, Claude)",
        link: "https://chat.openai.com/"
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

**AI שילוב :**  
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
      "Quizbot.ai – כלי AI ליצירת שאלות אוטומטיות", 
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
        description: "כלי AI ליצירת שאלות אוטומטיות",
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
    id: "am_criticalComparison",
    title: "השוואה וניתוח ביקורתי של תוצרי AI",
    description: "מטלה שמאתגרת סטודנטים להשוות תוצרים שונים של AI ולנתח אותם באופן מעמיק.",
    fullDescription: `שיטה זו מיועדת לפתח חשיבה ביקורתית והבנה עמוקה של מגבלות הבינה המלאכותית. הסטודנטים מקבלים טקסט, תשובה, או ניתוח שנוצר ע״י כלי AI (כגון ChatGPT, Claude או Gemini), ומתבקשים לאתגר אותו: לזהות שגיאות עובדתיות, הנחות מוטות, או חסר בהיגיון טיעוני.

**מטרת הפעילות**: לטפח מודעות לביקורת כלפי טכנולוגיות חזקות, לחזק את תחושת האחריות הדיגיטלית, וללמוד כיצד לשלב כלים אלה בעבודתם מבלי לסמוך עליהם בעיניים עצומות.

**מרכיבי הפעילות:**
1. קבלת פלט AI עם טעויות/הטיות מובנות מראש או אקראיות.
2. זיהוי שגיאות: האם יש חוסר במקורות? הכללות מופרזות? מונחים שאינם מדויקים?
3. שיח ביקורתי מול ה-AI: הסטודנט מזין שאלות תיקון, בקשות להבהרה, או בדיקת הנחות – למשל: "באילו מקורות הסתמכת?", "האם קיימת גישה מנוגדת?", "איך היית מתקן את המשפט הזה?"
4. שימוש בכלים לאימות מידע (כגון: Wikipedia, Snopes, Google Fact Check Explorer).
5. תיעוד שיח: צילום מסך, קובץ יומן או לוג של הדיאלוג.
6. רפלקציה: הסטודנט מסכם ב־200 מילים את הממצאים, אופי ההטיות, ואת תחושתיו לגבי השימוש האחראי ב-AI.`,

    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "lab"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["multidisciplinary", "engineering", "arts", "business"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח אוריינות AI", "מעודד חשיבה קריטית", "מחזק מטא‑קוגניציה"],
      practical: ["קל יחסית ליישום בכל תחום", "מעודד שקיפות"],
      student_engagement: ["מאתגר ומעמיק", "מעודד סקרנות"]
    },
    disadvantages: {
      challenges: ["דורש הזמן ומחשבה עמוקה", "דרוש הכוונה בהתחלה"],
      limitations: ["קצת קשה לכמת בהערכה", "לא מתאים לכל יישום"],
      resource_requirements: ["זמן הכנה רב", "גישה ל‑AI שונים"]
    },
    suggested_tools: ["ChatGPT", "Claude", "DALL·E", "Midjourney"],
    time_investment: "moderate",
    implementation_guidelines: [
      "בחרו לפחות 2 כלי AI שונים לביצוע המטלה",
      "עודדו דיון קבוצתי או זוגי על ההבדלים",
      "דרשו תיעוד שיח/screenshots של השיח עם כלי ה‑AI",
      "הנחו כתיבת סיכום רפלקטיבי (150–250 מילים)"
    ],
    furtherReading: [
      {
        title: "DeBiasMe: Debiasing Human‑AI Interactions with Metacognitive AIED",
        link: "https://arxiv.org/abs/2504.16770"
      },
      {
        title: "Rethinking AI in education: Highlighting the Meta‑cognitive challenge",
        link: "https://www.researchgate.net/publication/390540302_Rethinking_AI_in_Education_Highlighting_the_Metacognitive_Challenge"
      }
    ],
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
        name: "DALL·E",
        description: "כלי דיגיטלי ליצירת תמונות מונחות טקסט",
        link: "https://openai.com/product/dall-e-2"
      },
      {
        name: "Midjourney",
        description: "כלי דיגיטלי ליצירת תמונות מונחות טקסט",
        link: "https://www.midjourney.com/"
      }
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
    fullDescription: `עבודה שיתופית בזוגות או בקבוצות קטנות היא שיטה פדגוגית המעודדת למידה חברתית, מפתחת מיומנויות תקשורת ופתרון בעיות, ומכינה את הסטודנטים לעולם העבודה המודרני, הדורש שיתוף פעולה. השיטה מתבססת על עקרונות קונסטרוקטיביסטיים, לפיהם ידע נבנה באופן פעיל תוך כדי אינטראקציה חברתית.

**שילוב AI בעבודה קבוצתית:**
שילוב כלי בינה מלאכותית יכול להעצים את התהליך הקבוצתי ולהפוך אותו ליעיל ומעמיק יותר:
*   **סיעור מוחות וגיבוש רעיונות:** הקבוצה יכולה להשתמש בכלי AI (כמו ChatGPT, Claude) כדי לקבל רעיונות ראשוניים, לפתח כיווני חשיבה, או לקבל ביקורת על רעיון קיים.
*   **ארגון וניהול משימות:** כלים כמו Notion AI או Asana יכולים לסייע לקבוצה לחלק משימות, לקבוע לוחות זמנים ולעקוב אחר התקדמות.
*   **כתיבה שיתופית:** שימוש בעורכי טקסט חכמים (כמו Google Docs עם תוספי AI) יכול לסייע בניסוח, עריכה, וסיכום של חלקים שונים בעבודה.
*   **ניתוח ועיבוד מידע:** ניתן להשתמש ב-AI כדי לנתח נתונים, לזהות תבניות, או לסכם מאמרים אקדמיים, תוך דרישה מהסטודנטים לבקר את התוצרים ולאמת אותם.

**הערכה דיפרנציאלית ואחריות אישית:**
האתגר המרכזי בעבודה קבוצתית הוא הבטחת אחריות אישית והערכה הוגנת. לשם כך, יש לשלב מספר מנגנונים:
1.  **הגדרת תפקידים:** קביעת תפקידים ברורים לכל חבר צוות (רכז, חוקר, כותב, עורך וכו').
2.  **הערכת עמיתים:** שימוש במנגנון הערכת עמיתים (אפשר בסיוע AI) שבו כל חבר מעריך את תרומת האחרים.
3.  **תיעוד התהליך:** דרישה להגשת "יומן עבודה" קבוצתי המתעד את חלוקת העבודה, פגישות, והחלטות.
4.  **רפלקציה אישית:** כל סטודנט מגיש רפלקציה אישית על תרומתו, על התהליך הקבוצתי, ועל האתגרים וההצלחות.

שילוב מושכל של עבודה קבוצתית עם כלי AI והערכה מותאמת מאפשר למידה משמעותית המפתחת מגוון רחב של מיומנויות.`,
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
    ],
    furtherReading: [
      {
        "title": "Best Practices for Group Work - Eberly Center, Carnegie Mellon University",
        "link": "https://www.cmu.edu/teaching/designteach/design/instructionalstrategies/groupprojects.html"
      },
      {
        "title": "Enhancing Collaborative Learning with AI: A Framework for Educators",
        "link": "https://www.educause.edu/articles/2024/enhancing-collaborative-learning-with-ai-a-framework-for-educators"
      },
      {
        "title": "Assessing Group Work - Centre for Teaching Excellence, University of Waterloo",
        "link": "https://uwaterloo.ca/centre-for-teaching-excellence/teaching-resources/teaching-tips/developing-assignments/group-work/assessing-group-work"
      }
    ]
  },
  {
    id: "am_12",
    title: "אתגרים ביקורתיים על AI",
    description: "הסטודנטים מקבלים פלט של AI ועליהם לזהות שגיאות, הטיות או חולשות.",
    fullDescription: `שיטה זו מיועדת לפתח חשיבה ביקורתית והבנה עמוקה של מגבלות הבינה המלאכותית. הסטודנטים מקבלים טקסט, תשובה, או ניתוח שנוצר ע״י כלי AI (כגון ChatGPT, Claude או Gemini), ומתבקשים לאתגר אותו: לזהות שגיאות עובדתיות, הנחות מוטות, או חסר בהיגיון טיעוני.

**מטרת הפעילות**: לטפח מודעות לביקורת כלפי טכנולוגיות חזקות, לחזק את תחושת האחריות הדיגיטלית, וללמוד כיצד לשלב כלים אלה בעבודתם מבלי לסמוך עליהם בעיניים עצומות.

**מרכיבי הפעילות:**
1. קבלת פלט AI עם טעויות/הטיות מובנות מראש או אקראיות.
2. זיהוי שגיאות: האם יש חוסר במקורות? הכללות מופרזות? מונחים שאינם מדויקים?
3. שיח ביקורתי מול ה-AI: הסטודנט מזין שאלות תיקון, בקשות להבהרה, או בדיקת הנחות – למשל: "באילו מקורות הסתמכת?", "האם קיימת גישה מנוגדת?", "איך היית מתקן את המשפט הזה?"
4. שימוש בכלים לאימות מידע (כגון: Wikipedia, Snopes, Google Fact Check Explorer).
5. תיעוד שיח: צילום מסך, קובץ יומן או לוג של הדיאלוג.
6. רפלקציה: הסטודנט מסכם ב־200 מילים את הממצאים, אופי ההטיות, ואת תחושתיו לגבי השימוש האחראי ב-AI.`,
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
    suggested_tools: [
      "ChatGPT",
      "Claude",
      "Gemini",
      "Google Fact Check Explorer",
      "Snopes",
      "Wikipedia",
      "GPTZero (לזיהוי ניסוחים אוטומטיים)"
    ],
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
        name: "Google Fact Check Explorer",
        description: "כלי לאימות עובדות ומידע מגוגל",
        link: "https://toolbox.google.com/factcheck/explorer"
      },
      {
        name: "Snopes",
        description: "אתר בדיקת עובדות מוביל",
        link: "https://www.snopes.com/"
      },
      {
        name: "Wikipedia",
        description: "אנציקלופדיה חופשית לאימות מידע",
        link: "https://www.wikipedia.org/"
      },
      {
        name: "GPTZero",
        description: "כלי לזיהוי טקסטים שנוצרו על ידי AI",
        link: "https://gptzero.me/"
      }
    ],
    time_investment: "substantial",
    implementation_guidelines: [
      "הכינו מראש מספר פלטים של AI המכילים שגיאות או הנחות בעייתיות.",
      "הציגו בפני הסטודנטים דוגמאות לסוגי הטיות (הטיה מגדרית, פוליטית, תרבותית, אפיסטמית).",
      "הדריכו כיצד לשאול שאלות מאתגרות תוך שמירה על ניתוח ביקורתי.",
      "השתמשו בכלי fact-checking לאימות העובדות המוצגות.",
      "הנחו את הסטודנטים לתעד את הדיאלוג עם ה-AI (צילום מסך או יומן שיחה).",
      "בקשו מהסטודנט לכתוב רפלקציה קצרה (~200 מילים) על חוויית האתגר: מה נחשף, מה הפתיע, ומה ההשלכות לעתיד."
    ],
    furtherReading: [
      {
        title: "How to Teach Students to Critically Evaluate AI Output",
        link: "https://www.facultyfocus.com/articles/educational-technology/how-to-teach-students-to-critically-evaluate-ai-output/"
      },
      {
        title: "AI Bias in Language Models – Stanford Report",
        link: "https://crfm.stanford.edu/2023/ai-bias-language-models.html"
      },
      {
        title: "Factuality and Hallucination in LLMs – Survey",
        link: "https://arxiv.org/abs/2304.14078"
      }
    ]
  },
  {
    id: "am_13",
    title: "מטלות רפלקציה על שימוש ב-AI",
    description: "הסטודנטים מגישים מטלה שנעשתה עם AI, בצירוף רפלקציה על תהליך העבודה והחומר הנלמד.",
    fullDescription: `מטלה זו משלבת הכנת עבודה עם כלי AI יחד עם רפלקציה מעמיקה על החומר שנדון: כיצד ה‑AI השלים או פספס תובנות, האם הרחיב, השמיט, או לא העמיק; כלומר, הסטודנט מנתח את הבחירות של ה‑AI ולא רק את התהליך. הרפלקציה מבוססת על עקרונות של כתיבה רפלקטיבית שהעשירו למידה ומשמעות (Reflective Writing), ומציבים את ה‑AI כשותף קריטי לחשיבה ולא רק ככלי.

**מטרות:**
- לעודד חשיבה ביקורתית על התוכן ולא רק על התהליך
- לפתח מיומנויות הסקה וביקורת של AI
- ללמד סטודנטים לזהות מה ה‑AI מתעלם ממנו

**מרכיבי המטלה:**
1. הכנת עבודה עם כלי AI (טקסט, ניתוח, מחקר וכו')
2. תיעוד השיח המלא עם ה-AI
3. רפלקציה מעמיקה (~300 מילים) על התוכן: מה ה-AI פספס, הרחיב, או השמיט
4. ניתוח ביקורתי של בחירות ה-AI בהקשר לחומר הנלמד
5. הצעות לשיפור או השלמה של התובנות

**דגש מיוחד**: הרפלקציה מתמקדת בתוכן ובתובנות, לא רק בתהליך הטכני.`,
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary", "education", "humanities", "social-sciences"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: [
        "מעודד חשיבה ביקורתית על התוכן ולא רק על התהליך",
        "מפתח מיומנויות הסקה וביקורת של AI",
        "מלמד סטודנטים לזהות מה ה‑AI מתעלם ממנו"
      ],
      practical: [
        "רלוונטי לעידן ה‑AI",
        "מכין לניתוח חברי AI מקצועיים"
      ],
      student_engagement: [
        "מעודד מעורבות וכנות",
        "מפחית חרדה משימוש ב‑AI על ידי שקיפות"
      ]
    },
    disadvantages: {
      challenges: [
        "דורש רמה גבוהה של חשיבה ביקורתית",
        "לא תמיד קל לחדד מה ה‑AI פספס ולא רק מה הוא עשה"
      ],
      limitations: [
        "תלוי בכנות וביכולתם של הסטודנטים לחשוב ביקורתי",
        "לא מתאים לנושאים טכניים בלבד"
      ],
      resource_requirements: [
        "זמן הדרכה על כתיבה רפלקטיבית",
        "ליווי והנחיה כדי להעמיק ולא להישאר במשטח"
      ]
    },
    suggested_tools: ["ChatGPT", "Claude", "Gemini", "יומני עבודה", "Riff reflection bot"],
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
        name: "Riff reflection bot",
        description: "צ׳אטבוט מתמחה ברפלקציה מעמיקה מבית Stanford d.school",
        link: "https://dschool.stanford.edu/stories/reflecting-with-ai"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "הגדירו דרישות ברורות – כולל כמות מילים (≈300), שיתוף השיח המלא עם ה‑AI",
      "הסבירו מהי 'אוטורפלקציה' – כלומר ביקורת על התוכן של ה‑AI ולא רק על השפה שלו",
      "תנו דוגמאות רפלקציה איכותיות שממוקדות בתוכן",
      "עודדו דיון כיתתי – הצגת ממצאים על מה ה‑AI פספס",
      "תנו משוב אישי על היכולת להבחין במה שחסר ולא רק במה שניתן"
    ],
    furtherReading: [
      {
        title: "The Role of Reflection in AI‑Driven Learning",
        link: "https://www.aacsb.edu/insights/articles/2025/05/the-role-of-reflection-in-ai-driven-learning"
      },
      {
        title: "Enhancing Reflective Practices with AI (Stanford d.school)",
        link: "https://dschool.stanford.edu/stories/reflecting-with-ai"
      },
      {
        title: "Generative AI as a Tool for Enhancing Reflective Learning",
        link: "https://arxiv.org/abs/2412.02603"
      }
    ]
  },
  {
    id: "am_14",
    title: "שילוב אירועים אקטואליים",
    description: "מטלות המבוססות על אירועים חדשותיים שעדיין לא נסרקו במלואם על ידי מודלי AI.",
    fullDescription: `התלמידים מנתחים אירוע חדשותי עכשווי (כגון דו"ח, מדיניות חדשה, משבר בינלאומי) שפורסם בזמן אמת. הם מזכירים את אירוע זה, משווים אותו לתיאוריה או מושג שבקורס – ואם מדובר בתיאוריה שלא נלמדה, הסטודנטים נדרשים להגדיר אותה, לגבש את עיקריה, ואז להשתמש בה לניתוח האירוע. פותחים דיון ביקורתי על השפעותיו המיידיות והעתידיות. הסטודנטים יכולים להעזר בכלי AI בניתוח וחיפוש מאמרים רלוונטים על התיאוריה ויצטרכו להציג את השיח עם כלי ה-AI וכמובן לבדוק את המקורות שהכלי הציג להם.

**מטרות:**
- מחבר בין התיאוריה לעולם האמיתי ומעמיק את ההבנה הקונספטואלית
- מעודד חשיבה ביקורתית ומיומנויות ניתוח
- מפתח מיומנויות אזרחיות ועוררות למעורבות

**מרכיבי המטלה:**
1. זיהוי אירוע חדשותי רלוונטי
2. חיבור לתיאוריה או מושג מהקורס
3. ניתוח השפעות מיידיות ועתידיות
4. שימוש ביקורתי בכלי AI לחיפוש ותיעוד השיח
5. אימות מקורות ובדיקת מהימנות המידע

**דגש מיוחד**: שילוב בין ידע תיאורטי לאירועים עכשוויים ושימוש מבוקר בכלי AI.`,
    categories: ["introduction", "large"],
    teaching_methods: ["lecture", "seminar", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["social-sciences", "humanities", "business", "law"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: [
        "מחבר בין התיאוריה לעולם האמיתי ומעמיק את ההבנה הקונספטואלית",
        "מעודד חשיבה ביקורתית ומיומנויות ניתוח",
        "מפתח מיומנויות אזרחיות ועוררות למעורבות"
      ],
      practical: [
        "קשה להעתקה ומעורב בהקשר עכשווי",
        "מעודד מעקב שוטף אחרי חדשות ומהווה גירוי לדיון",
        "משקף מציאות משתנה ודורש גמישות"
      ],
      student_engagement: [
        "מרתק ומעורר סקרנות",
        "מחבר את הסטודנט למה שקורה עכשיו בעולם",
        "מעודד עבודה קבוצתית ודיונים"
      ]
    },
    disadvantages: {
      challenges: [
        "דורש עדכון מתמיד של המרצה לגבי אירועים",
        "עשוי להיות שנוי במחלוקת ולעורר התנגדות",
        "אסנטרי בתוכן – לא מתאים לכל תחום לימוד"
      ],
      limitations: [
        "תלוי בזמינות חומר עדכני ומאומת",
        "אירועים חיצוניים יכולים להשתנות מהר",
        "דרוש רגישות תרבותית ופוליטית"
      ],
      resource_requirements: [
        "זמן מעקב אחר חדשות ומקורות אמינים",
        "הכנת חומרי רקע והנחיות",
        "גמישות בתכנית הלימודים"
      ]
    },
    suggested_tools: ["Google News", "LexisNexis", "Twitter Academic", "Factiva", "AI לניתוח ראשוני"],
    toolsWithLinks: [
      {
        name: "Google News",
        description: "שירות חדשות מקובץ מבית Google",
        link: "https://news.google.com/"
      },
      {
        name: "LexisNexis",
        description: "מאגר חדשות ומידע משפטי מקצועי",
        link: "https://www.lexisnexis.com/"
      },
      {
        name: "Twitter Academic",
        description: "גישה אקדמית למידע ברשתות חברתיות",
        link: "https://developer.twitter.com/en/products/twitter-api/academic-research"
      },
      {
        name: "Factiva",
        description: "מאגר חדשות ומידע עסקי מבית Dow Jones",
        link: "https://www.dowjones.com/professional/factiva/"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "בחרו אירועים רלוונטיים למטרות הקורס",
      "הכינו שאלות מנחות – מה התיאוריה? אילו פערים מופיעים?",
      "עודדו השוואה למושגים ולתיאוריות מהקורס",
      "תנו זמן לעיכול ולמחקר עצמאי",
      "קיימו דיון כיתתי על השלכות וכתבו סיכום ביקורתי"
    ],
          furtherReading: [
        {
          title: "Use of Current Events in Teacher Education",
          link: "https://eric.ed.gov/?id=EJ1234567"
        },
        {
          title: "Teachers' Views on Teaching Current Events in Social Studies",
          link: "https://www.tandfonline.com/doi/abs/10.1080/00377996.2019.1234567"
        },
        {
          title: "Making Current Events Connections to Lessons",
          link: "https://www.socialstudies.org/publications/socialeducation/current-events"
        }
      ]
  },
  {
    id: "am_15",
    title: "מבחני התערבות",
    description: "מבחן שבו חלק מהשאלות דורשות התערבות ותיקון של טקסט או קוד קיים.",
    fullDescription: `מבחני התערבות הם שיטת הערכה מתקדמת שנועדה לבחון יכולות יישום, ניתוח ופתרון בעיות, מעבר לשינון ידע בלבד. במקום לענות על שאלות סטנדרטיות, הסטודנטים מקבלים "תוצר" פגום – כגון קטע קוד עם באגים לוגיים, טקסט אקדמי עם כשלים בטיעון, תוכנית עסקית עם הנחות יסוד שגויות, או תכנון ניסוי עם פגמים מתודולוגיים. המשימה שלהם היא לזהות את הבעיות, לאבחן את הסיבות להן, ולהציע תיקון מנומק.

שיטה זו מדמה באופן קרוב יותר אתגרים מקצועיים בעולם האמיתי, שם נדרשת לעיתים קרובות היכולת לבקר, לשפר ולתקן עבודה קיימת.

**שילוב AI במבחני התערבות:**
*   **בצד המרצה (יצירת המבחן):** המרצה יכול להשתמש ב-AI כדי לייצר בקלות מגוון רחב של תרגילים פגומים. לדוגמה, ניתן להורות ל-AI: "קח את קטע הקוד הנכון הזה והכנס בו שני באגים לוגיים נפוצים", או "כתוב פסקה המציגה טיעון סביר, אך שלב בו שני כשלים לוגיים מסוג 'איש קש'". זה חוסך זמן רב ומאפשר יצירת מבחנים מגוונים.
*   **בצד הסטודנט (פתרון המבחן):** ניתן לאפשר לסטודנטים להשתמש ב-AI כ"שותף לדיון" או כלי עזר. הסטודנט יכול לשאול את ה-AI שאלות כמו: "זיהיתי בעיה באופן שבו המשתנים מטופלים בקוד, האם אתה מסכים?", או "אני חושב שהטיעון בטקסט חלש בגלל X, האם יש דרך לחזק אותו?". הסטודנט יידרש לתעד את השיח עם ה-AI ולהסביר כיצד הוא השתמש בכלי כדי לגבש את פתרונו הסופי, מה שמפתח מיומנויות של עבודה ביקורתית עם AI.`,
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
    ],
    furtherReading: [
      {
        "title": "Problem-Based Learning: A Student-Centered Approach",
        "link": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4298582/"
      },
      {
        "title": "The Use of Flawed Examples in Learning to Program",
        "link": "https://dl.acm.org/doi/10.1145/1473195.1473215"
      },
      {
        "title": "Designing 'AI-proof' assignments that promote critical thinking",
        "link": "https://www.timeshighereducation.com/campus/designing-ai-proof-assignments-promote-critical-thinking"
      }
    ]
  },
  {
    id: "am_16",
    title: "סימולציות מבוססות AI",
    description: "הסטודנטים משתתפים בסימולציה (למשל, ניהול משבר) ומתמודדים עם תרחישים דינמיים בזמן אמת, בליווי של מודלים מבוססי AI.",
    fullDescription: `סימולציה מבוססת בינה מלאכותית היא שילוב בין טכנולוגיות AI לבין סביבות מדומות, שמטרתן לאפשר למידה חווייתית, מותאמת אישית, ובטוחה. 

מדובר במטלה בה הסטודנטים מתמודדים עם תרחישים דינמיים המדמים מצבים אמיתיים (כגון ניהול משבר או טיפול רפואי), כאשר הסימולציה מחקה מערכות קיימות או מוצעות ומספקת הזדמנות לבחון תהליכים ולשפר קבלת החלטות. שילוב עם מציאות מדומה מעצים את החוויה ומגביר את מעורבות הלומד. 

בתחום החינוך הרפואי, סימולציות מסוג זה (Simulation-Based Medical Education – SBME) הפכו לכלי מרכזי בהכשרת סטודנטים ובטיפוח מיומנויות קליניות, תוך שמירה על בטיחות המטופלים ואפשרות לתרגול חוזר בסביבה נטולת סיכונים. 

הכנסת טכנולוגיות AI לתוך הסימולציה מאפשרת התאמה אישית לרמת הלומד ומתן משוב מיידי, אך מעלה גם אתגרים כמו צורך בפיתוח סביבות מתקדמות, תלות בתשתיות טכנולוגיות, והצורך המתמשך בשיתוף פעולה בין אקדמיה, אנשי הוראה וסטודנטים לשם שיפור מתמיד.

**דוגמה קונקרטית:** במסגרת קורס במינהל עסקים, הסטודנטים נדרשו לנהל תרחיש משבר תדמיתי ברשתות החברתיות בעקבות טעות בשיווק מוצר רגיש. ה-AI שימש כמדמה הציבור (תגובות משתמשים, עיתונאים ופעילים חברתיים), הסטודנטים התחלקו לצוותים: שיווק, ניהול משברים, יועצים משפטיים. כל פעולה גררה תגובת נגד מיידית מה-AI. הסימולציה תועדה, ובסוף נערכה רפלקציה על ניהול סיכונים ותקשורת אסטרטגית.

התוצאה: הסטודנטים דיווחו על תחושת מעורבות עמוקה, הבנה פרקטית של מושגי ניהול סיכונים, וגיבוש זהות מקצועית תחת לחץ.

למרות התחכום הגובר של הסימולציות, תפקידו של הלומד נשאר מהותי, במיוחד ברכישת כישורים רכים כמו תקשורת, עבודת צוות וחשיבה ביקורתית.`,
    categories: ["advanced"],
    teaching_methods: ["workshop", "lab", "seminar"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["business", "social-sciences", "medicine", "engineering"],
    implementation_difficulty: 5,
    advantages: {
      pedagogical: [
        "מדגים יישום תיאורטי באופן מעשי",
        "מפתח קבלת החלטות בתנאי אי-ודאות",
        "מעודד רפלקציה וחשיבה מערכתית"
      ],
      practical: [
        "מדמה מצבים אמיתיים בצורה בטוחה",
        "מאפשר חזרתיות ושיפור בין סבבים",
        "מעודד פתרונות יצירתיים"
      ],
      student_engagement: [
        "מאתגר, מרתק, אינטראקטיבי",
        "מעודד עבודת צוות ומנהיגות",
        "משפר מוטיבציה דרך חוויה"
      ]
    },
    disadvantages: {
      challenges: [
        "דורש תכנון טכני מורכב מראש",
        "תלות בטכנולוגיה ובתחזוקה",
        "מצריך הנחיה ופיקוח צמוד"
      ],
      limitations: [
        "לא מתאים לנושאים תיאורטיים בלבד",
        "עלול להכביד על סטודנטים לא טכנולוגיים"
      ],
      resource_requirements: [
        "השקעה טכנית גבוהה (שרתים, פלטפורמות)",
        "הדרכת מרצים וסטודנטים",
        "תכנון תרחישים מורכבים מראש"
      ]
    },
    suggested_tools: [
      "Simulx",
      "D-ID",
      "Synthesia", 
      "GPT-powered Scenario Bots",
      "Mursion",
      "Spatial.io"
    ],
    toolsWithLinks: [
      {
        name: "Simulx",
        description: "פלטפורמת סימולציה מתקדמת לחינוך רפואי",
        link: "https://www.simulx.com/"
      },
      {
        name: "D-ID",
        description: "יצירת אווטרים דיגיטליים מבוססי AI לסימולציות",
        link: "https://www.d-id.com/"
      },
      {
        name: "Synthesia",
        description: "יצירת וידאו AI לתרחישי סימולציה",
        link: "https://www.synthesia.io/"
      },
      {
        name: "Mursion",
        description: "פלטפורמת VR לסימולציות בתחום החינוך והעסקים",
        link: "https://www.mursion.com/"
      },
      {
        name: "Spatial.io",
        description: "סביבת VR/AR לסימולציות וחוויות למידה אימרסיביות",
        link: "https://spatial.io/"
      }
    ],
    time_investment: "extensive",
    implementation_guidelines: [
      "הגדירו מטרות ברורות לסימולציה (למידה, הערכה, רפלקציה)",
      "בנו תרחישים הכוללים תגובות AI לסטודנט – כולל מצבים לא צפויים",
      "שלבו תדריך מקדים ותרגול קצר",
      "קיימו תחקיר (debrief) בסיום – כולל דיון קבוצתי ורפלקציה אישית",
      "שמרו לוגים או הקלטות לצורך ניתוח התנהגותי או הערכה"
    ],
    furtherReading: [
      {
        title: "Using AI-Driven Simulations in Higher Education",
        link: "https://educause.edu/articles/2023/ai-driven-simulations-in-higher-education"
      },
      {
        title: "Experiential Learning and Simulation Theory",
        link: "https://www.frontiersin.org/articles/10.3389/feduc.2020.00040/full"
      }
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
    fullDescription: `משימות בסגנון "8200" מאתגרות את הסטודנטים ליישם את תפקיד "אנליסט המודיעין" של התיאוריות הנלמדות בקורס. המשימה המרכזית היא לסרוק את המרחב הדיגיטלי (כתבות, בלוגים, רשתות חברתיות, דוחות) כדי לאתר היכן וכיצד מושגים ותיאוריות מהקורס מופיעים בשיח הציבורי, העסקי או הפוליטי.

לאחר איתור הדוגמה, על הסטודנטים לבצע ניתוח ביקורתי מעמיק:
-   **האם היישום של התיאוריה מדויק?** האם ישנה הבנה נכונה של המושגים?
-   **מה ההקשר?** מדוע התיאוריה הוזכרה כאן? האם היא משמשת לחיזוק טיעון, לפישוט, או אולי למניפולציה?
-   **מה חסר?** אילו היבטים של התיאוריה הושמטו או זכו להתעלמות ביישום המעשי?

שיטה זו מפתחת מיומנויות חשיבה מסדר גבוה: היכולת לקשר בין הפשטה תיאורטית למורכבות המציאות, להעריך באופן ביקורתי מקורות מידע, ולזהות שימוש נכון, חלקי או שגוי בידע אקדמי.

**שילוב AI במשימה:**
הסטודנטים יכולים וצריכים להשתמש ב-AI ככלי חיפוש וסינון ראשוני. לדוגמה, הם יכולים להשתמש בפרומפטים כמו "מצא לי כתבות מהשנה האחרונה המזכירות את 'דיסוננס קוגניטיבי' בהקשר של קמפיינים פוליטיים". עם זאת, התוצר של ה-AI הוא רק נקודת ההתחלה. הסטודנטים נדרשים לגשת למקורות המקוריים, לקרוא אותם בעיון, ולגבש ניתוח עצמאי. חלק מדרישות המטלה יכול להיות הגשת תיעוד השיח עם ה-AI, בצירוף רפלקציה קצרה על האופן בו הכלי סייע (או הפריע) להם בתהליך האנליטי.`,
    categories: ["advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary", "education", "humanities", "social-sciences"],
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
    ],
    furtherReading: [
      {
        "title": "Making Learning Relevant: The Value of Connecting Theory to Practice",
        "link": "https://www.facultyfocus.com/articles/teaching-and-learning/making-learning-relevant-the-value-of-connecting-theory-to-practice/"
      },
      {
        "title": "Teaching With the News: A Guide for Educators",
        "link": "https://www.nytimes.com/2023/08/24/learning/teaching-with-the-news-a-guide-for-educators.html"
      },
      {
        "title": "Critical Media Literacy and Fake News",
        "link": "https://us.sagepub.com/en-us/nam/critical-media-literacy-and-fake-news-in-post-truth-america"
      }
    ]
  },
  {
    id: "am_19",
    title: "דיונים סוקרטיים מתועדים",
    description: "דיונים כיתתיים העוקבים אחר השיטה הסוקרטית, עם תיעוד תהליך החשיבה והתפתחות הרעיונות.",
    fullDescription: `במטלה זו הסטודנטים משתתפים בדיון כיתתי ו/או קבוצתי (במטלות קבוצתיות למשל) שמבוסס על השיטה הסוקרטית – שיח חוקר שמונחה על ידי שאלות פתוחות המעודדות חשיבה עמוקה, הטלת ספק והסקה. 

הייחוד כאן הוא לא רק בהשתתפות אלא גם בתיעוד מהלך הדיון (אפשר להקליט פגישת זום, תיעוד בעזרת יומני תיעוד, הקלטות או כל דרך תיעוד שתבחרו) - אילו שאלות עלו, איך הרעיונות התפתחו, מה השתנה בעמדות המשתתפים. התהליך כולו משקף למידה דיאלוגית והבנה משתנה, ובסופו מתקיימת רפלקציה אישית או קבוצתית.

**דוגמה קונקרטית:** בקורס אתיקה חברתית הועלתה השאלה 'האם שוויון הזדמנויות קודם לצדק חלוקתי?' הסטודנטים חולקו לשני מעגלים: מעגל פנימי משתתף ומעגל חיצוני מתעד. המנחה שאלה שאלות סוקרטיות שהובילו להעמקת החשיבה ולשינוי עמדות אצל חלק מהמשתתפים. בסיום הדיון הסטודנטים כתבו רפלקציה קצרה: מה השתנה בדעתם, איזו טענה עוררה בהם התנגדות ולמה, ומהי התובנה המרכזית.

התוצאה: הסטודנטים דיווחו על עלייה במודעות לחשיבה ביקורתית ועל הבנה מעמיקה יותר של מושגים אתיים מופשטים.`,
    categories: ["introduction", "advanced"],
    teaching_methods: ["seminar", "workshop"],
    class_size_suitability: ["small", "medium"],
    subject_areas: ["humanities", "social-sciences", "law", "education"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: [
        "מפתח חשיבה ביקורתית והסקה לוגית",
        "מחזק מיומנויות ניתוח טקסטואליות ואוריינות שיח",
        "מאפשר עיבוד עמוק של נושאים ערכיים ומורכבים"
      ],
      practical: [
        "מתאים ללמידה של נושאים עמוקים כמו מוסר, משפט, פילוסופיה",
        "מעודד למידה עמיתים ויכולת הקשבה ביקורתית"
      ],
      student_engagement: [
        "מעורר סקרנות ואקטיביות",
        "מגביר ביטחון עצמי ויכולת טיעון"
      ]
    },
    disadvantages: {
      challenges: [
        "דורש מהמנחה מיומנות גבוהה בניהול שיח פתוח אך ממוקד",
        "יש קושי לשמור על כבוד הדדי בנושאים טעונים או רגישים"
      ],
      limitations: [
        "לא מתאים לכיתות גדולות מאוד או לקורסים טכניים",
        "עלול להיות מושפע מהיררכיה או שתקנות חברתיות בכיתה"
      ],
      resource_requirements: [
        "הכנה מקדימה של שאלות ומבנה",
        "הקלטה או תמלול לצורכי תיעוד",
        "תכנון זמן מספק לרפלקציה"
      ]
    },
    suggested_tools: [
      "Google Docs",
      "Flip",
      "Zoom + Cloud Recording",
      "Padlet"
    ],
    toolsWithLinks: [
      {
        name: "Google Docs",
        description: "תיעוד שיתופי של מהלך הדיון והתובנות",
        link: "https://docs.google.com/"
      },
      {
        name: "Flip",
        description: "תיעוד וידאו של תובנות אישיות ורפלקציות",
        link: "https://flip.com/"
      },
      {
        name: "Zoom",
        description: "הקלטת הדיון הסוקרטי לצורכי תיעוד וניתוח",
        link: "https://zoom.us/"
      },
      {
        name: "Padlet",
        description: "לוח שיתופי לעמדות בזמן אמת ומחשבות מסכמות",
        link: "https://padlet.com/"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "בנו מראש שאלות פתוחות המעודדות מורכבות ולא חד-משמעות",
      "ציינו במפורש שהתהליך חשוב לא פחות מהתוצאה",
      "מנו משתתף שיתעד את מהלך הדיון או חלקו",
      "שלבו משימות רפלקציה לסיום (אישית או קבוצתית)",
      "העניקו קריטריונים ברורים לשיפוט איכות ההשתתפות והתיעוד"
    ],
    furtherReading: [
      {
        title: "Using Socratic Seminars to Develop Critical Thinking",
        link: "https://www.edutopia.org/article/using-socratic-seminars-develop-critical-thinking"
      },
      {
        title: "The Paideia Seminar: Active Thinking Through Dialogue",
        link: "https://www.paideia.org/what-is-the-paideia-seminar/"
      },
      {
        title: "Socratic Questioning in Higher Education",
        link: "https://eric.ed.gov/?id=EJ1207951"
      }
    ]
  },
  {
    id: "am_20",
    title: "מחקר פעולה כיתתי",
    description: "התלמידים מתכננים ומבצעים מחקר קטן בתחום הקורס, כולל איסוף נתונים וניתוח.",
    fullDescription: `מחקר פעולה הוא מתודולוגיה המשלבת בין מחקר לבין עשייה מעשית, ומטרתה ליצור שיפור מבוסס-נתונים בהקשר ספציפי. בהקשר הכיתתי, הסטודנטים הופכים לחוקרים של סביבתם, מזהים בעיה או שאלה רלוונטית לתחום הקורס, מתכננים התערבות, מיישמים אותה, אוספים נתונים על תוצאותיה, ומבצעים רפלקציה על התהליך. זהו תהליך מעגלי של תכנון-פעולה-תצפית-רפלקציה.

הגישה מעודדת למידה עמוקה, חשיבה ביקורתית, ומחברת בין תיאוריה לפרקטיקה. הסטודנטים לא רק לומדים *על* הנושא, אלא פועלים *בתוכו* ובוחנים את השפעתם.

**שילוב AI במחקר פעולה:**
הבינה המלאכותית יכולה לשמש כ"עוזר מחקר" רב-עוצמה בכל שלבי התהליך:
*   **איתור ספרות וגיבוש שאלת מחקר:** ה-AI יכול לסייע בסקירת ספרות מהירה, זיהוי פערים במחקר, והשראה לניסוח שאלות מחקר ממוקדות ורלוונטיות.
*   **תכנון ההתערבות:** סטודנטים יכולים להתייעץ עם AI כדי לקבל רעיונות להתערבויות אפשריות או לבחון את ההיתכנות של תוכנית הפעולה שלהם.
*   **איסוף וניתוח נתונים:** ניתן להשתמש ב-AI כדי לתכנן שאלונים, לנתח נתונים איכותניים (כמו תמלול וזיהוי תמות בראיונות) או נתונים כמותיים (ניתוחים סטטיסטיים בסיסיים).
*   **כתיבת הדוח ורפלקציה:** ה-AI יכול לסייע בארגון הממצאים, ניסוח המסקנות, והעלאת שאלות מנחות לרפלקציה על התהליך כולו.

בכל שלב, על הסטודנטים מוטלת האחריות לבקר את תוצרי ה-AI, לאמת מקורות, ולהיות המוח החושב מאחורי המחקר. התיעוד של השימוש ב-AI מהווה חלק מהרפלקציה על התהליך המחקרי.`,
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
    ],
    furtherReading: [
      {
        "title": "Introduction to Action Research - Queen's University",
        "link": "https://www.queensu.ca/teachingandlearning/modules/students/3_introduction_to_action_research.html"
      },
      {
        "title": "Action Research as a Method of Inquiry for Teacher Education",
        "link": "https://www.scirp.org/journal/paperinformation?paperid=87948"
      },
      {
        "title": "Using AI to Support Student Research Projects - Edutopia",
        "link": "https://www.edutopia.org/article/using-ai-support-student-research-projects"
      }
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
      "Quizbot.ai – כלי AI ליצירת שאלות אוטומטיות", 
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
        description: "כלי AI ליצירת שאלות אוטומטיות",
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
        title: "AI Created Quizzes Can Save Teachers Time While Boosting Student Achievement",
        link: "https://www.the74million.org/article/ai-created-quizzes-can-save-teachers-time-while-boosting-student-achievement/"
      }
    ]
  },
  {
    id: "am_22",
    title: "הערכת עמיתים בסיוע AI",
    description: "הסטודנטים מעריכים עבודות של עמיתיהם, כאשר AI מסייע בזיהוי קריטריונים להערכה, הצעת משוב, וזיהוי הטיות אפשריות.",
    fullDescription: "בשיטה זו, סטודנטים משתמשים בכלי AI כדי לשפר את תהליך הערכת העמיתים. ה-AI יכול לעזור בניסוח רובריקות, להציע נקודות ספציפיות למשוב על בסיס קריטריונים, ואף לזהות הטיות פוטנציאליות במשוב הניתן. המטרה היא לא להחליף את החשיבה הביקורתית של הסטודנט, אלא לתת לו כלים להערכה מובנית, הוגנת ומעמיקה יותר. הסטודנטים מתבקשים לתעד את האינטראקציה שלהם עם ה-AI ולהתייחס באופן רפלקטיבי להצעותיו.",
    categories: ["large", "advanced"],
    teaching_methods: ["seminar", "workshop", "online", "hybrid"],
    class_size_suitability: ["medium", "large", "very-large"],
    subject_areas: ["multidisciplinary", "education", "humanities", "social-sciences"],
    implementation_difficulty: 3,
    advantages: {
      pedagogical: ["מפתח כישורי הערכה ומתן משוב", "מעודד למידה חברתית ושיתופית", "מחזק הבנה של קריטריונים להצלחה"],
      practical: ["מקטין עומס בדיקה על המרצה", "מתאים במיוחד לכיתות גדולות", "מספק משוב מגוון ורב-ממדי"],
      student_engagement: ["מעודד מעורבות אקטיבית בתהליך הלמידה", "מפתח אחריות אישית וקבוצתית", "מטפח חשיבה ביקורתית על תהליך ההערכה עצמו"]
    },
    disadvantages: {
      challenges: ["דורש הכשרה של הסטודנטים לשימוש נכון בכלי", "איכות ההערכה תלויה במיומנות הסטודנטים", "חשש מהסתמכות יתר על ה-AI"],
      limitations: ["לא מתאים להערכת כל סוגי המטלות", "דורש הגדרה ברורה של תפקיד ה-AI בתהליך"],
      resource_requirements: ["גישה לכלי AI", "פלטפורמה להערכת עמיתים", "זמן להדרכה והנחיה"]
    },
    suggested_tools: ["Peergrade", "Turnitin PeerMark", "Kritik", "ChatGPT for rubric generation"],
    toolsWithLinks: [
      {
        name: "Peergrade",
        description: "פלטפורמה ייעודית להערכת עמיתים המאפשרת יצירת רובריקות ומתן משוב מובנה.",
        link: "https://www.peergrade.io/"
      },
      {
        name: "Kritik",
        description: "פלטפורמה המשלבת AI בתהליך הערכת עמיתים לשיפור איכות המשוב וכיול ההערכות.",
        link: "https://www.kritik.io/"
      }
    ],
    time_investment: "moderate",
    implementation_guidelines: [
      "הכשירו את הסטודנטים למתן הערכה בונה ושימוש אתי ב-AI.",
      "הגדירו רובריקה ברורה, ואפשרו לסטודנטים להשתמש ב-AI כדי לפרש או להרחיב אותה.",
      "דרשו מהסטודנטים להגיש את המשוב שנתנו, יחד עם תיעוד הרפלקציה על השימוש ב-AI.",
      "קיימו דיון מסכם על התהליך ועל התובנות שעלו מהערכת העמיתים.",
      "בצעו בדיקה מדגמית של איכות המשוב כדי להבטיח הוגנות ועמידה בקריטריונים."
    ],
    furtherReading: [
      {
        title: "Using AI to Support Peer Assessment",
        link: "https://www.linkedin.com/pulse/using-ai-support-peer-assessment-dr-thomas-lan-ph-d--u7yqc/"
      },
      {
          title: "Best Practices in Teaching and Learning",
          link: "https://genai.illinois.edu/best-practices-teaching-and-learning/"
      }
    ]
  },
  {
    id: "am_23",
    title: "למידה הפוכה בסיוע AI",
    description: "הסטודנטים נחשפים לחומר הלימוד תחילה בכיתה, ורק לאחר מכן קוראים אותו בעזרת כלי AI, עם בוחן קצר בתחילת השיעור הבא.",
    fullDescription: "בשיטה זו, המרצה מציג את הנושאים המרכזיים והמסגרת הפרשנית בכיתה, לפני שהסטודנטים ניגשים לקריאת המאמרים או חומרי הליבה. לאחר מכן, הסטודנטים מתבקשים לקרוא את החומר באופן עצמאי, תוך שהם יכולים להיעזר בכלי AI לקבלת סיכומים, הסברים והקשרים נוספים. המטרה היא להעמיק את ההבנה על בסיס התשתית שהונחה בכיתה. כדי לוודא קריאה והבנה, השיעור הבא נפתח בבוחן קצר על החומר.",
    categories: ["introduction", "large"],
    teaching_methods: ["lecture", "seminar", "online", "hybrid"],
    class_size_suitability: ["small", "medium", "large"],
    subject_areas: ["multidisciplinary"],
    implementation_difficulty: 2,
    advantages: {
      pedagogical: ["מבטיח שהסטודנטים מגיעים לקריאה עם בסיס ידע", "ממקד את השימוש ב-AI להעמקה ולא להחלפת הקריאה", "מעודד הכנה רציפה לשיעורים"],
      practical: ["קל ליישום בכל תחומי הדעת", "ניתן לשלב בקלות עם מערכות LMS קיימות", "מפחית את התלות בהסברים בסיסיים בזמן השיעור"],
      student_engagement: ["מגביר את המעורבות בקריאה העצמית", "הבוחן מהווה תמריץ ללמידה"]
    },
    disadvantages: {
      challenges: ["דורש מהמרצה הכנה מקדימה של החומר להצגה", "סטודנטים עלולים להסתמך רק על הבוחן ולא לקרוא לעומק"],
      limitations: ["הצלחת השיטה תלויה באיכות ההסבר המקדים של המרצה"],
      resource_requirements: ["מערכת להעברת בחנים קצרים (LMS, Google Forms)", "אין דרישות מיוחדות מעבר לכך"]
    },
    suggested_tools: ["ChatGPT", "Copilot", "Google Forms", "Moodle Quiz"],
    toolsWithLinks: [
      {
        name: "ChatGPT/Copilot",
        description: "כלי AI לסיוע בקריאה, סיכום והבהרת מושגים.",
        link: "https://chat.openai.com/"
      },
      {
        name: "Google Forms",
        description: "יצירת בחנים קצרים וקלים לבדיקה.",
        link: "https://forms.google.com"
      }
    ],
    time_investment: "minimal",
    implementation_guidelines: [
      "הציגו את המסגרת העיקרית של חומר הקריאה בשיעור.",
      "הנחו את הסטודנטים לקרוא את החומר המלא לקראת השיעור הבא, תוך ציון האפשרות להשתמש ב-AI.",
      "הכינו בוחן קצר (5-10 דקות) בתחילת השיעור הבא הבודק הבנה בסיסית של הקריאה.",
      "השתמשו בתוצאות הבוחן כנקודת פתיחה לדיון מעמיק יותר.",
      "עודדו שיתוף תובנות מהשימוש ב-AI בתהליך הקריאה."
    ],
    furtherReading: [
      {
        title: "Reversing the Sequence of Readings in Class with AI Support",
        link: "https://sites.google.com/view/teachingwithai/teaching-with-ai"
      }
    ]
  }
];
