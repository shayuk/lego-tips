// Generic rubric templates for different assessment types
export const genericRubricTemplates = {
  written_assignment: [
    {
      name: "תוכן ועומק",
      description: "איכות התוכן וההבנה הנושאית",
      levels: {
        excellent: "הבנה מעמיקה עם ניתוח מקורי וביקורתי",
        good: "הבנה טובה עם ניתוח בסיסי",
        satisfactory: "הבנה בסיסית עם תיאור נכון",
        needs_improvement: "הבנה שטחית עם חוסר בהבנה בסיסית"
      },
      weight: 0.4
    },
    {
      name: "מבנה וארגון",
      description: "מבנה העבודה וזרימת הרעיונות",
      levels: {
        excellent: "מבנה ברור ולוגי עם מעברים חלקים",
        good: "מבנה טוב עם מעברים מספקים",
        satisfactory: "מבנה בסיסי עם בעיות קלות",
        needs_improvement: "מבנה לא ברור או מבולבל"
      },
      weight: 0.3
    },
    {
      name: "שפה וביטוי",
      description: "איכות השפה והביטוי הכתוב",
      levels: {
        excellent: "שפה עשירה ומדויקת ללא שגיאות",
        good: "שפה טובה עם שגיאות מועטות",
        satisfactory: "שפה בסיסית עם שגיאות קלות",
        needs_improvement: "שפה לקויה עם שגיאות רבות"
      },
      weight: 0.3
    }
  ],
  
  presentation: [
    {
      name: "תוכן ומסר",
      description: "איכות התוכן ובהירות המסר",
      levels: {
        excellent: "תוכן מעמיק ומסר ברור ומשכנע",
        good: "תוכן טוב ומסר מובן",
        satisfactory: "תוכן בסיסי ומסר לא תמיד ברור",
        needs_improvement: "תוכן דל ומסר לא ברור"
      },
      weight: 0.4
    },
    {
      name: "הצגה ונוכחות",
      description: "איכות ההצגה והנוכחות על הבמה",
      levels: {
        excellent: "הצגה מרתקת עם נוכחות חזקה",
        good: "הצגה טובה עם נוכחות נעימה",
        satisfactory: "הצגה בסיסית עם נוכחות מספקת",
        needs_improvement: "הצגה חלשה עם נוכחות דלה"
      },
      weight: 0.3
    },
    {
      name: "עזרים ויזואליים",
      description: "איכות ויעילות העזרים הויזואליים",
      levels: {
        excellent: "עזרים מקצועיים התומכים בהצגה",
        good: "עזרים טובים המשפרים את ההבנה",
        satisfactory: "עזרים בסיסיים ומתאימים",
        needs_improvement: "עזרים לקויים או לא רלוונטיים"
      },
      weight: 0.3
    }
  ],
  
  project: [
    {
      name: "מורכבות ויצירתיות",
      description: "רמת המורכבות והיצירתיות בפרויקט",
      levels: {
        excellent: "פרויקט מורכב ויצירתי עם חדשנות",
        good: "פרויקט מורכב עם אלמנטים יצירתיים",
        satisfactory: "פרויקט בסיסי עם ביצוע נכון",
        needs_improvement: "פרויקט פשוט עם ביצוע לקוי"
      },
      weight: 0.3
    },
    {
      name: "יישום טכני",
      description: "איכות היישום הטכני",
      levels: {
        excellent: "יישום מקצועי ללא פגמים",
        good: "יישום טוב עם פגמים קלים",
        satisfactory: "יישום בסיסי עם כמה בעיות",
        needs_improvement: "יישום לקוי עם בעיות רבות"
      },
      weight: 0.4
    },
    {
      name: "תיעוד ודיווח",
      description: "איכות התיעוד והדיווח",
      levels: {
        excellent: "תיעוד מקיף ומקצועי",
        good: "תיעוד טוב עם פרטים מספיקים",
        satisfactory: "תיעוד בסיסי עם מידע עיקרי",
        needs_improvement: "תיעוד חסר או לא מספיק"
      },
      weight: 0.3
    }
  ]
};

// Implementation guidelines for different contexts
export const implementationGuidelines = {
  hebrew_academic_context: [
    "התאימו את השפה לרמת התלמידים",
    "השתמשו בדוגמאות מהתרבות הישראלית",
    "קחו בחשבון את לוח השנה העברי",
    "התייחסו לנושאים רגישים בזהירות",
    "עודדו דיון פתוח במסגרת מכבדת"
  ],
  
  large_classes: [
    "השתמשו בטכנולוגיה לאוטומציה",
    "חלקו לקבוצות קטנות",
    "היעזרו בסטודנטים מתקדמים",
    "הכינו הנחיות ברורות ומפורטות",
    "קבעו מנגנוני משוב יעילים"
  ],
  
  online_learning: [
    "ודאו חיבור אמין לאינטרנט",
    "השתמשו בפלטפורמות ידידותיות למשתמש",
    "תנו אפשרות לשמירה והמשך",
    "הכינו חלופות טכניות",
    "עודדו אינטראקציה וירטואלית"
  ],
  
  hybrid_teaching: [
    "תאמו בין הסטודנטים הפיזיים והוירטואליים",
    "השתמשו בכלים המתאימים לשני הפורמטים",
    "ודאו שיוויון הזדמנויות",
    "התכוננו לבעיות טכניות",
    "תנו משוב מותאם לכל קבוצה"
  ]
};
