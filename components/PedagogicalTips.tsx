import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Button } from './Button';
import { Collapsible } from './Collapsible';
import styles from './PedagogicalTips.module.css';

interface PedagogicalTip {
  id: string;
  title: string;
  description: string;
  example: string;
  bloomExplanation: string;
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

const pedagogicalTips: PedagogicalTip[] = [
  // Remember Level
  {
    id: 'flashcards',
    title: 'כרטיסיות זיכרון דיגיטליות',
    description: 'שימוש בכרטיסיות דיגיטליות לחזרה על מושגי יסוד, הגדרות ועובדות חשובות. הכרטיסיות יכולות לכלול טקסט, תמונות ואפילו קטעי אודיו כדי לחזק את הזיכרון הוויזואלי והשמיעתי.',
    example: 'בקורס פסיכולוגיה: כרטיסיות עם הגדרות של מושגים כמו "קונדישיוןינג קלאסי", "זיכרון עבודה", "תיאוריית ההתקשרות" עם דוגמאות קצרות.',
    bloomExplanation: 'כרטיסיות זיכרון מבטאות את שלב הזכירה בטקסונומיה של בלום, בכך שהן מתמקדות בשליפה מדויקת של מידע שנלמד קודם לכן. הלומד נדרש לזכור עובדות, מושגים והגדרות ללא צורך בעיבוד מורכב או ניתוח. תהליך זה מחזק את הבסיס הידעי הנדרש לשלבים מתקדמים יותר של למידה.',
    bloomLevel: 'remember'
  },
  {
    id: 'mnemonics',
    title: 'טכניקות זיכרון (מנמוטכניקות)',
    description: 'שימוש בקיצורים, חרוזים, אקרונימים וטכניקות זיכרון אחרות כדי לעזור לסטודנטים לזכור רצפים, רשימות ומידע עובדתי.',
    example: 'לזכירת סדר הפלנטות: "מרקורי ונוס אדמה מאדים יופיטר שבתאי אורנוס נפטון" - "מה ואת מאכלת יום שישי אוכלת נחש".',
    bloomExplanation: 'טכניקות זיכרון משרתות את שלב הזכירה על ידי יצירת קשרים מלאכותיים או דפוסים שמקלים על שליפת המידע מהזיכרון ארוך הטווח. הן מאפשרות לסטודנטים לגשת למידע עובדתי בצורה מהירה ויעילה, ומהווים בסיס להבנה מעמיקה יותר.',
    bloomLevel: 'remember'
  },

  // Understand Level
  {
    id: 'concept-mapping',
    title: 'מפות מושגים',
    description: 'יצירת דיאגרמות ויזואליות המציגות את הקשרים בין מושגים שונים. מפות מושגים עוזרות לסטודנטים לראות את התמונה הכללית ולהבין כיצד רעיונות שונים מתקשרים זה לזה.',
    example: 'בקורס ביולוגיה: מפת מושגים המחברת בין "פוטוסינתזה", "כלורופיל", "אור שמש", "פחמן דו-חמצני", "חמצן" ו"גלוקוז" עם חיצים המסבירים את הקשרים.',
    bloomExplanation: 'מפות מושגים מבטאות את שלב ההבנה בטקסונומיה של בלום, בכך שהן דורשות מהלומד לא רק לזכור מידע אלא גם לפרש אותו ולהסביר את המשמעות שלו. הלומד נדרש לזהות קשרים, לסווג מידע ולהציג אותו בצורה חדשה, מה שמעיד על הבנה אמיתית של החומר.',
    bloomLevel: 'understand'
  },
  {
    id: 'analogies',
    title: 'אנלוגיות והשוואות',
    description: 'שימוש באנלוגיות כדי להסביר מושגים מורכבים על ידי השוואה לדברים מוכרים מהחיים היומיומיים. זה עוזר לסטודנטים להבין רעיונות חדשים דרך ידע קיים.',
    example: 'הסבר על מערכת הדם: "הלב הוא כמו משאבה, כלי הדם הם כמו צינורות, והדם הוא כמו נוזל המובל במערכת השקיה".',
    bloomExplanation: 'אנלוגיות מאפשרות למידה משמעותית על ידי חיבור מידע חדש לידע קיים. הן דורשות מהלומד להבין את המאפיינים המשותפים בין המושג החדש למושג המוכר, ובכך מעמיקות את ההבנה ומקלות על העברת הידע למצבים חדשים.',
    bloomLevel: 'understand'
  },

  // Apply Level
  {
    id: 'case-studies',
    title: 'מקרי בוחן (Case Studies)',
    description: 'הצגת מצבים ריאליסטיים או אמיתיים שבהם הסטודנטים צריכים ליישם את הידע התיאורטי שלמדו כדי לפתור בעיות או לקבל החלטות.',
    example: 'בקורס ניהול: מקרה בוחן על חברה שחווה ירידה במכירות - הסטודנטים צריכים לנתח את המצב ולהציע אסטרטגיית שיפור מבוססת על תיאוריות ניהול שלמדו.',
    bloomExplanation: 'מקרי בוחן מבטאים את שלב היישום בטקסונומיה של בלום, בכך שהם דורשים מהלומד לקחת ידע תיאורטי ולהפעיל אותו במצבים חדשים ומורכבים. הלומד נדרש להעביר עקרונות ושיטות ממצב למידה מבוקר למצב פתוח יותר, מה שמפתח יכולת חשיבה מעשית ויישומית.',
    bloomLevel: 'apply'
  },
  {
    id: 'simulations',
    title: 'סימולציות ומשחקי תפקידים',
    description: 'יצירת סביבות מבוקרות שבהן סטודנטים יכולים לתרגל מיומנויות ולהחיל ידע במצבים דמויי מציאות ללא הסיכונים של המצב האמיתי.',
    example: 'בקורס רפואה: סימולציה של חדר מיון שבה סטודנטים מתרגלים אבחון וטיפול בחולים וירטואליים, או בקורס עסקים: משחק תפקידים של משא ומתן עסקי.',
    bloomExplanation: 'סימולציות מאפשרות יישום בטוח של ידע תיאורטי במצבים מעשיים. הן דורשות מהלומד לא רק להבין עקרונות אלא גם להפעיל אותם תחת לחץ זמן ובתנאים משתנים, מה שמפתח יכולת הסתגלות ויישום גמיש של הידע.',
    bloomLevel: 'apply'
  },

  // Analyze Level
  {
    id: 'current-event-analysis',
    title: 'ניתוח אירוע אקטואלי',
    description: 'בחירת אירוע עכשווי רלוונטי לתחום הלימוד וניתוחו באמצעות התיאוריות והמושגים שנלמדו בקורס. זה מחבר בין הלמידה האקדמית למציאות החיה.',
    example: 'בקורס פסיכולוגיה חברתית: ניתוח אירוע אקטואלי על פי תיאוריית ההתקשרות של בולבי - בחינת מקרה של פרידה בין הורה לילד בעקבות נסיבות חברתיות.',
    bloomExplanation: 'ניתוח אירוע אקטואלי באמצעות תיאוריה מסוימת מבטא את שלב האנליזה בטקסונומיה של בלום, בכך שהוא מחייב את הלומד לפרק את האירוע לחלקים המרכיבים אותו ולבחון את היחסים ביניהם באופן שיטתי. הלומד נדרש תחילה לזהות את המרכיבים הבסיסיים של האירוע על פי מושגי היסוד בתיאוריה, לאחר מכן עליו להבין כיצד רכיבים אלו מתקשרים ומשפיעים זה על זה. בנוסף, הוא נדרש להבחין בין עובדות אובייקטיביות לבין הנחות ופרשנויות תיאורטיות, וכן להבדיל בין הפרטים המשמעותיים לאלו שהם משניים או שוליים. תהליך זה מעמיק את ההבנה של הלומד לגבי מבנה החומר הנלמד, מחדד את יכולתו לחשוב בצורה ביקורתית ואנליטית, ומאפשר לו לזהות באופן עצמאי את ההיררכיה והקשרים הפנימיים בין מרכיבי האירוע והתיאוריה.',
    bloomLevel: 'analyze'
  },
  {
    id: 'comparative-analysis',
    title: 'ניתוח השוואתי',
    description: 'השוואה בין שתי תיאוריות, שיטות, מקרים או גישות שונות, תוך זיהוי קווי דמיון והבדל, יתרונות וחסרונות של כל אחת.',
    example: 'בקורס חינוך: השוואה בין גישת מונטסורי לגישת וולדורף בחינוך הילדים - ניתוח עקרונות היסוד, שיטות הוראה, ותוצאות למידה.',
    bloomExplanation: 'ניתוח השוואתי דורש פירוק של מערכות מורכבות לרכיביהן, זיהוי דפוסים ומבנים, והבנה של יחסי גומלין. הלומד מפתח יכולת לראות מעבר לפרטים הבודדים ולהבין את המערכת הכוללת.',
    bloomLevel: 'analyze'
  },

  // Evaluate Level
  {
    id: 'peer-review',
    title: 'ביקורת עמיתים',
    description: 'תהליך שבו סטודנטים בוחנים ומעריכים עבודות של עמיתיהם לכיתה על פי קריטריונים מוגדרים מראש, תוך מתן משב חזור בונה והצעות לשיפור.',
    example: 'בקורס כתיבה אקדמית: כל סטודנט קורא טיוטה של מאמר של עמית ומעריך אותה לפי קריטריונים כמו בהירות הטיעון, איכות המקורות, ומבנה הטקסט.',
    bloomExplanation: 'ביקורת עמיתים מבטאת את שלב ההערכה בטקסונומיה של בלום, בכך שהיא דורשת מהלומד לפתח שיפוט מקצועי מבוסס על קריטריונים ברורים. הלומד נדרש לא רק להבין את החומר אלא גם להעריך את איכותו, עקביותו ותקפותו. תהליך זה מפתח חשיבה ביקורתית ויכולת להבחין בין טיעונים חזקים לחלשים.',
    bloomLevel: 'evaluate'
  },
  {
    id: 'evidence-evaluation',
    title: 'הערכת ראיות ומקורות',
    description: 'למידה כיצד לבחון באופן ביקורתי את אמינותם ותקפותם של מקורות מידע שונים, תוך הבחנה בין מקורות ראשוניים ומשניים, וזיהוי הטיות אפשריות.',
    example: 'בקורס היסטוריה: הערכת מקורות שונים על אותו אירוע היסטורי - עיתונות עכשווית, זיכרונות אישיים, מחקרים אקדמיים מאוחרים - והשוואת נקודות המבט.',
    bloomExplanation: 'הערכת ראיות דורשת יכולת לשפוט את איכות המידע ואמינותו על בסיס קריטריונים מקצועיים. הלומד מפתח יכולת לזהות הטיות, לבחון מטרות נסתרות, ולהעריך את החוזק של טיעונים שונים.',
    bloomLevel: 'evaluate'
  },

  // Create Level
  {
    id: 'original-research',
    title: 'מחקר מקורי',
    description: 'עיצוב וביצוע מחקר עצמאי שתורם ידע חדש לתחום, החל משלב ניסוח השאלה, דרך איסוף וניתוח נתונים, ועד הצגת המסקנות.',
    example: 'בקורס פסיכולוגיה: עיצוב מחקר על השפעת מוזיקה על ריכוז בלמידה - הגדרת השערות, בחירת משתתפים, עיצוב ניסוי, איסוף נתונים וניתוח תוצאות.',
    bloomExplanation: 'מחקר מקורי מבטא את שלב היצירה בטקסונומיה של בלום, בכך שהוא דורש מהלומד לייצר ידע חדש ולא רק לצרוך ידע קיים. הלומד נדרש לשלב מיומנויות מכל השלבים הקודמים - זכירה של מתודולוגיות, הבנה של עקרונות מחקר, יישום של כלים סטטיסטיים, ניתוח של תוצאות והערכה של מגבלות - כדי ליצור תובנות חדשות. תהליך זה מפתח עצמאות אינטלקטואלית, יצירתיות מחקרית, ויכולת לתרום לקידום הידע בתחום.',
    bloomLevel: 'create'
  },
  {
    id: 'design-solution',
    title: 'עיצוב פתרון חדשני',
    description: 'פיתוח פתרון מקורי ויצירתי לבעיה מורכבת, תוך שילוב ידע ממקורות שונים ויצירת משהו חדש שלא היה קיים קודם לכן.',
    example: 'בקורס הנדסה: עיצוב מכשיר לעזרה לאנשים עם מוגבלות - מחקר הצרכים, עיצוב הפתרון, בניית אב טיפוס ובדיקת יעילותו.',
    bloomExplanation: 'עיצוב פתרון חדשני דורש שילוב יצירתי של ידע קיים ליצירת משהו חדש ומקורי. הלומד נדרש לחשיבה מחוץ לקופסה, לניסוי ולהתמודדות עם אי-ודאות, תוך פיתוח יכולת לראות אפשרויות שאחרים לא ראו.',
    bloomLevel: 'create'
  }
];

const bloomLevels = {
  remember: { name: 'זכירה', color: '#e3f2fd', icon: '🧠' },
  understand: { name: 'הבנה', color: '#f3e5f5', icon: '💡' },
  apply: { name: 'יישום', color: '#e8f5e8', icon: '🔧' },
  analyze: { name: 'ניתוח', color: '#fff3e0', icon: '🔍' },
  evaluate: { name: 'הערכה', color: '#fce4ec', icon: '⚖️' },
  create: { name: 'יצירה', color: '#e0f2f1', icon: '🎨' }
};

export const PedagogicalTips: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['understand']);

  const toggleCategory = (level: string) => {
    setExpandedCategories(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const groupedTips = pedagogicalTips.reduce((acc, tip) => {
    if (!acc[tip.bloomLevel]) {
      acc[tip.bloomLevel] = [];
    }
    acc[tip.bloomLevel].push(tip);
    return acc;
  }, {} as Record<string, PedagogicalTip[]>);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Lightbulb className={styles.titleIcon} />
          טיפים פדגוגיים לפי טקסונומיה של בלום
        </h1>
        <p className={styles.subtitle}>
          מדריך מקיף לשיטות הוראה ולמידה מחולק לפי שלבי הטקסונומיה של בלום
        </p>
      </div>

      <div className={styles.bloomPyramid}>
        {Object.entries(bloomLevels).reverse().map(([level, info]) => {
          const tips = groupedTips[level] || [];
          const isExpanded = expandedCategories.includes(level);
          
          return (
            <div key={level} className={styles.bloomLevel}>
              <Button
                onClick={() => toggleCategory(level)}
                variant="ghost"
                className={styles.levelHeader}
                style={{ backgroundColor: info.color }}
              >
                <span className={styles.levelIcon}>{info.icon}</span>
                <span className={styles.levelName}>{info.name}</span>
                <span className={styles.tipCount}>({tips.length} טיפים)</span>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>

              {isExpanded && (
                <div className={styles.tipsContainer}>
                  {tips.map(tip => (
                    <div key={tip.id} className={styles.tipCard}>
                      <h3 className={styles.tipTitle}>{tip.title}</h3>
                      
                      <div className={styles.tipSection}>
                        <h4 className={styles.sectionTitle}>תיאור:</h4>
                        <p className={styles.tipDescription}>{tip.description}</p>
                      </div>

                      <div className={styles.tipSection}>
                        <h4 className={styles.sectionTitle}>דוגמה:</h4>
                        <p className={styles.tipExample}>{tip.example}</p>
                      </div>

                      <div className={styles.tipSection}>
                        <h4 className={styles.sectionTitle}>הקשר לטקסונומיה של בלום:</h4>
                        <p className={styles.bloomExplanation}>{tip.bloomExplanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
