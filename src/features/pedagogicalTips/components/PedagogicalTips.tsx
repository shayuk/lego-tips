import React, { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, Eye } from 'lucide-react';
import { Button } from '../../../components/Button';
import { TipDetailsModal } from './TipDetailsModal';
import styles from './PedagogicalTips.module.css';

interface PedagogicalTip {
  id: string;
  title: string;
  description: string;
  example: string;
  bloomExplanation: string;
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  courseProfile?: {
    level: string;
    size: string;
    delivery: string;
  };
  recommendedTools?: {
    name: string;
    description: string;
    link: string;
  }[];
  furtherReading?: {
    title: string;
    link: string;
  }[];
}

const pedagogicalTips: PedagogicalTip[] = [
  // Remember Level
  {
    id: 'flashcards',
    title: 'כרטיסיות זיכרון דיגיטליות',
    description: 'שימוש בכרטיסיות דיגיטליות לחזרה על מושגי יסוד, הגדרות ועובדות חשובות. הכרטיסיות יכולות לכלול טקסט, תמונות ואפילו קטעי אודיו כדי לחזק את הזיכרון הוויזואלי והשמיעתי.',
    example: 'בקורס פסיכולוגיה: כרטיסיות עם הגדרות של מושגים כמו "קונדישיוןינג קלאסי", "זיכרון עבודה", "תיאוריית ההתקשרות" עם דוגמאות קצרות.',
    bloomExplanation: 'כרטיסיות זיכרון מבטאות את שלב הזכירה בטקסונומיה של בלום, בכך שהן מתמקדות בשליפה מדויקת של מידע שנלמד קודם לכן. הלומד נדרש לזכור עובדות, מושגים והגדרות ללא צורך בעיבוד מורכב או ניתוח. תהליך זה מחזק את הבסיס הידעי הנדרש לשלבים מתקדמים יותר של למידה.',
    bloomLevel: 'remember',
    courseProfile: {
      level: 'מתאים לכל רמה',
      size: 'כיתות בינוניות וגדולות',
      delivery: 'מקוון וסינכרוני'
    },
    recommendedTools: [
      {
        name: 'Anki',
        description: 'כלי יצירת כרטיסיות מתקדם עם אלגוריתם חזרה מתוחכם',
        link: 'https://apps.ankiweb.net/'
      },
      {
        name: 'Quizlet',
        description: 'פלטפורמה אינטראקטיבית לכרטיסיות עם משחקים',
        link: 'https://quizlet.com/'
      },
      {
        name: 'Memrise',
        description: 'מערכת לימוד מבוססת כרטיסיות עם אלמנטים גיימיפיים',
        link: 'https://www.memrise.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מחקר על יעילות כרטיסיות בלמידה',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4323404/'
      },
      {
        title: 'הפסיכולוגיה של חזרה מרווחת',
        link: 'https://www.scientificamerican.com/article/how-to-study-effectively-spaced-repetition/'
      }
    ]
  },
  {
    id: 'mnemonics',
    title: 'טכניקות זיכרון (מנמוטכניקות)',
    description: 'שימוש בקיצורים, חרוזים, אקרונימים וטכניקות זיכרון אחרות כדי לעזור לסטודנטים לזכור רצפים, רשימות ומידע עובדתי. הטכניקות כוללות יצירת אסוציאציות ויזואליות, שימוש בהקשרים מוכרים, ובניית סיפורים כדי לקשר מידע לא קשור.',
    example: 'לזכירת סדר הפלנטות: "מרקורי ונוס אדמה מאדים יופיטר שבתאי אורנוס נפטון" - "מה ואת מאכלת יום שישי אוכלת נחש". בכימיה: לזכירת יסודות בטבלה המחזורית, שימוש בסיפורים או תמונות מנטליות.',
    bloomExplanation: 'טכניקות זיכרון משרתות את שלב הזכירה על ידי יצירת קשרים מלאכותיים או דפוסים שמקלים על שליפת המידע מהזיכרון ארוך הטווח. הן מנצלות את הנטייה הטבעית של המוח ליצור אסוציאציות ודפוסים, ומאפשרות לסטודנטים לגשת למידע עובדתי בצורה מהירה ויעילה. הטכניקות מהווות בסיס חיוני להבנה מעמיקה יותר בשלבים הבאים של למידה.',
    bloomLevel: 'remember',
    courseProfile: {
      level: 'מתאים לכל הרמות, במיוחד בקורסי מבוא',
      size: 'יעיל בכיתות מכל הגדלים',
      delivery: 'הרצאה, סמינר, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'Method of Loci App',
        description: 'אפליקציה ליצירת ארמונות זיכרון מתקדמים',
        link: 'https://www.methodoflocigame.com/'
      },
      {
        name: 'Mnemonic Device Generator',
        description: 'כלי מקוון ליצירת מנמוטכניקות אוטומטיות',
        link: 'https://www.mnemonic-device.com/'
      },
      {
        name: 'Memory Palace Builder',
        description: 'פלטפורמה לבניית ארמונות זיכרון דיגיטליים',
        link: 'https://www.memorypalace.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מחקר על יעילות מנמוטכניקות בלמידה',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5037458/'
      },
      {
        title: 'ארמונות זיכרון: מסורת עתיקה לחינוך מודרני',
        link: 'https://www.nature.com/articles/s41467-017-00528-5'
      },
      {
        title: 'The Art of Memory: מדריך מעשי למנמוטכניקות',
        link: 'https://www.cambridge.org/core/journals/memory-techniques'
      }
    ]
  },

  // Understand Level
  {
    id: 'concept-mapping',
    title: 'מפות מושגים',
    description: 'יצירת דיאגרמות ויזואליות המציגות את הקשרים בין מושגים שונים. מפות מושגים עוזרות לסטודנטים לראות את התמונה הכללית ולהבין כיצד רעיונות שונים מתקשרים זה לזה.',
    example: 'בקורס ביולוגיה: מפת מושגים המחברת בין "פוטוסינתזה", "כלורופיל", "אור שמש", "פחמן דו-חמצני", "חמצן" ו"גלוקוז" עם חיצים המסבירים את הקשרים.',
    bloomExplanation: 'מפות מושגים מבטאות את שלב ההבנה בטקסונומיה של בלום, בכך שהן דורשות מהלומד לא רק לזכור מידע אלא גם לפרש אותו ולהסביר את המשמעות שלו. הלומד נדרש לזהות קשרים, לסווג מידע ולהציג אותו בצורה חדשה, מה שמעיד על הבנה אמיתית של החומר.',
    bloomLevel: 'understand',
    courseProfile: {
      level: 'מתאים לכל הרמות',
      size: 'כיתות קטנות עד בינוניות',
      delivery: 'פרונטלי וסדנאות'
    },
    recommendedTools: [
      {
        name: 'Lucidchart',
        description: 'כלי מתקדם ליצירת מפות מושגים מקצועיות',
        link: 'https://www.lucidchart.com/'
      },
      {
        name: 'Miro',
        description: 'פלטפורמה שיתופית ליצירת מפות מושגים',
        link: 'https://miro.com/'
      },
      {
        name: 'Creately',
        description: 'כלי פשוט ויעיל למפות מושגים',
        link: 'https://creately.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מדריך מקיף למפות מושגים בחינוך',
        link: 'https://www.edutopia.org/concept-mapping-guide'
      },
      {
        title: 'מחקר על יעילות מפות מושגים',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6681438/'
      }
    ]
  },
  {
    id: 'analogies',
    title: 'אנלוגיות והשוואות',
    description: 'שימוש באנלוגיות כדי להסביר מושגים מורכבים על ידי השוואה לדברים מוכרים מהחיים היומיומיים. אנלוגיות יעילות מזהות מאפיינים מבניים או תפקודיים משותפים בין תחומי ידע שונים, ומאפשרות הבנה מעמיקה של עקרונות מופשטים דרך דוגמאות קונקרטיות.',
    example: 'הסבר על מערכת הדם: "הלב הוא כמו משאבה, כלי הדם הם כמו צינורות, והדם הוא כמו נוזל המובל במערכת השקיה". בפיזיקה: זרם חשמלי דומה לזרימת מים בצינור - מתח הוא כמו לחץ, והתנגדות היא כמו צר בצינור.',
    bloomExplanation: 'אנלוגיות מאפשרות למידה משמעותית על ידי חיבור מידע חדש לידע קיים במבנה קוגניטיבי של הלומד. הן דורשות מהלומד להבין את המאפיינים המשותפים בין המושג החדש למושג המוכר, לזהות התאמות והבדלים, ולהעביר עקרונות מתחום אחד לאחר. תהליך זה מעמיק את ההבנה, מקל על העברת הידע למצבים חדשים, ומפתח יכולת חשיבה אנלוגית שחיונית ללמידה מתקדמת.',
    bloomLevel: 'understand',
    courseProfile: {
      level: 'מתאים לכל הרמות, במיוחד יעיל בקורסי STEM',
      size: 'יעיל בכיתות קטנות עד בינוניות',
      delivery: 'הרצאה אינטראקטיבית, סמינר, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'Analogical Reasoning Tool',
        description: 'כלי דיגיטלי לבניית אנלוגיות מבניות',
        link: 'https://www.analogical-reasoning.com/'
      },
      {
        name: 'ConceptNet',
        description: 'מאגר ידע לזיהוי קשרים בין מושגים',
        link: 'https://conceptnet.io/'
      },
      {
        name: 'Analogy Maker',
        description: 'פלטפורמה ליצירת אנלוגיות חזותיות',
        link: 'https://www.analogymaker.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מחקר על יעילות אנלוגיות בהוראת מדעים',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4918017/'
      },
      {
        title: 'האנלוגיה כאסטרטגיה פדגוגית',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/03004279.2016.1169485'
      },
      {
        title: 'חשיבה אנלוגית והבנה מעמיקה',
        link: 'https://psycnet.apa.org/record/2003-01140-011'
      }
    ]
  },

  // Apply Level
  {
    id: 'case-studies',
    title: 'מקרי בוחן (Case Studies)',
    description: 'הצגת מצבים ריאליסטיים או אמיתיים שבהם הסטודנטים צריכים ליישם את הידע התיאורטי שלמדו כדי לפתור בעיות או לקבל החלטות. מקרי בוחן יעילים כוללים פרטים מספיקים לניתוח מעמיק, דילמות אמיתיות, וסיטואציות מורכבות הדורשות שיקול דעת והחלטות מבוססות עקרונות.',
    example: 'בקורס ניהול: מקרה בוחן על חברה שחווה ירידה במכירות - הסטודנטים צריכים לנתח את המצב ולהציע אסטרטגיית שיפור מבוססת על תיאוריות ניהול שלמדו. בקורס רפואה: מקרה קליני עם תסמינים מורכבים הדורש אבחון ותכנון טיפול.',
    bloomExplanation: 'מקרי בוחן מבטאים את שלב היישום בטקסונומיה של בלום, בכך שהם דורשים מהלומד לקחת ידע תיאורטי ולהפעיל אותו במצבים חדשים ומורכבים. הלומד נדרש להעביר עקרונות ושיטות ממצב למידה מבוקר למצב פתוח יותר, לשלב בין תיאוריות שונות, ולהתמודד עם אי-ודאות ומידע חסר. תהליך זה מפתח יכולת חשיבה מעשית ויישומית, מגביר את הביטחון העצמי ביישום הידע, ומכין את הסטודנטים לאתגרים מקצועיים אמיתיים.',
    bloomLevel: 'apply',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'אידיאלי לכיתות קטנות עד בינוניות',
      delivery: 'סמינר, למידה פעילה, דיון קבוצתי'
    },
    recommendedTools: [
      {
        name: 'Harvard Business Review Case Studies',
        description: 'מאגר מקרי בוחן מקצועיים בתחום העסקים',
        link: 'https://hbr.org/case-studies'
      },
      {
        name: 'Case Study Generator',
        description: 'כלי ליצירת מקרי בוחן מותאמים אישית',
        link: 'https://www.casestudygenerator.com/'
      },
      {
        name: 'Padlet',
        description: 'פלטפורמה לשיתוף ודיון במקרי בוחן',
        link: 'https://padlet.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מתודולוגיית מקרי בוחן בהוראה',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5944171/'
      },
      {
        title: 'עיצוב מקרי בוחן יעילים',
        link: 'https://www.tandfonline.com/doi/full/10.1080/03043797.2019.1566402'
      },
      {
        title: 'למידה מבוססת מקרי בוחן: מחקר ויישום',
        link: 'https://www.sciencedirect.com/science/article/pii/S1472811717300957'
      }
    ]
  },
  {
    id: 'simulations',
    title: 'סימולציות ומשחקי תפקידים',
    description: 'יצירת סביבות מבוקרות שבהן סטודנטים יכולים לתרגל מיומנויות ולהחיל ידע במצבים דמויי מציאות ללא הסיכונים של המצב האמיתי. סימולציות יעילות משחזרות בצורה אמינה את המורכבות של סביבות אמיתיות, מאפשרות חזרה ושיפור, וכוללות מנגנוני משוב מיידי.',
    example: 'בקורס רפואה: סימולציה של חדר מיון שבה סטודנטים מתרגלים אבחון וטיפול בחולים וירטואליים, או בקורס עסקים: משחק תפקידים של משא ומתן עסקי. בקורס משפטים: סימולציה של דיון בבית משפט עם תלמידים המשחקים שופטים, עורכי דין ועדים.',
    bloomExplanation: 'סימולציות מאפשרות יישום בטוח של ידע תיאורטי במצבים מעשיים מורכבים. הן דורשות מהלומד לא רק להבין עקרונות אלא גם להפעיל אותם תחת לחץ זמן ובתנאים משתנים, לקבל החלטות מהירות, ולהתמודד עם תוצאות לא צפויות. תהליך זה מפתח יכולת הסתגלות ויישום גמיש של הידע, מחזק את הביטחון העצמי, ומשפר את הביצועים במצבים אמיתיים.',
    bloomLevel: 'apply',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'יעיל בכיתות קטנות עד בינוניות',
      delivery: 'סמינר, למידה פעילה, דיון קבוצתי'
    },
    recommendedTools: [
      {
        name: 'Simformer',
        description: 'פלטפורמה ליצירת סימולציות עסקיות',
        link: 'https://www.simformer.com/'
      },
      {
        name: 'PhET Interactive Simulations',
        description: 'סימולציות אינטראקטיביות למדעי הטבע',
        link: 'https://phet.colorado.edu/'
      },
      {
        name: 'Labster',
        description: 'מעבדות וירטואליות מתקדמות',
        link: 'https://www.labster.com/'
      },
      {
        name: 'Second Life Education',
        description: 'סביבה וירטואלית למשחקי תפקידים',
        link: 'https://secondlife.com/education'
      }
    ],
    furtherReading: [
      {
        title: 'יעילות סימולציות בחינוך רפואי',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4235770/'
      },
      {
        title: 'למידה מבוססת סימולציות: עקרונות ויישום',
        link: 'https://www.sciencedirect.com/science/article/pii/S0360131517301100'
      },
      {
        title: 'משחקי תפקידים והוראה חוויתית',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/03043797.2019.1648757'
      }
    ]
  },

  // Analyze Level
  {
    id: 'current-event-analysis',
    title: 'ניתוח אירוע אקטואלי',
    description: 'בחירת אירוע עכשווי רלוונטי לתחום הלימוד וניתוחו באמצעות התיאוריות והמושגים שנלמדו בקורס. השיטה מחברת בין הלמידה האקדמית למציאות החיה, מפתחת חשיבה ביקורתית ומעמיקה את ההבנה התיאורטית דרך יישום מעשי.',
    example: 'בקורס פסיכולוגיה חברתית: ניתוח אירוע אקטואלי על פי תיאוריית ההתקשרות של בולבי - בחינת מקרה של פרידה בין הורה לילד בעקבות נסיבות חברתיות. בקורס כלכלה: ניתוח משבר כלכלי נוכחי באמצעות תיאוריות מאקרו-כלכליות.',
    bloomExplanation: 'ניתוח אירוע אקטואלי באמצעות תיאוריה מסוימת מבטא את שלב האנליזה בטקסונומיה של בלום, בכך שהוא מחייב את הלומד לפרק את האירוע לחלקים המרכיבים אותו ולבחון את היחסים ביניהם באופן שיטתי. הלומד נדרש תחילה לזהות את המרכיבים הבסיסיים של האירוע על פי מושגי היסוד בתיאוריה, לאחר מכן עליו להבין כיצד רכיבים אלו מתקשרים ומשפיעים זה על זה. בנוסף, הוא נדרש להבחין בין עובדות אובייקטיביות לבין הנחות ופרשנויות תיאורטיות, וכן להבדיל בין הפרטים המשמעותיים לאלו שהם משניים או שוליים. תהליך זה מעמיק את ההבנה של הלומד לגבי מבנה החומר הנלמד, מחדד את יכולתו לחשוב בצורה ביקורתית ואנליטית, ומאפשר לו לזהות באופן עצמאי את ההיררכיה והקשרים הפנימיים בין מרכיבי האירוע והתיאוריה.',
    bloomLevel: 'analyze',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'יעיל בכיתות מכל הגדלים',
      delivery: 'דיון, למידה פעילה, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'Google News',
        description: 'מקור מתעדכן לחדשות עכשוויות',
        link: 'https://news.google.com/'
      },
      {
        name: 'BBC News',
        description: 'מקור חדשות אמין ומפורט',
        link: 'https://www.bbc.com/news'
      },
      {
        name: 'Factiva',
        description: 'מאגר מקצועי למאמרי עיתונות',
        link: 'https://global.factiva.com/'
      },
      {
        name: 'AllSides',
        description: 'פלטפורמה להצגת נקודות מבט מגוונות',
        link: 'https://www.allsides.com/'
      }
    ],
    furtherReading: [
      {
        title: 'למידה מבוססת אירועים אקטואליים',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/00933104.2019.1586005'
      },
      {
        title: 'חשיבה ביקורתית דרך ניתוח חדשות',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6456736/'
      },
      {
        title: 'מחקר על אינטגרציה של אירועים אקטואליים בהוראה',
        link: 'https://www.sciencedirect.com/science/article/pii/S0742051X17309629'
      }
    ]
  },
  {
    id: 'comparative-analysis',
    title: 'ניתוח השוואתי',
    description: 'השוואה בין שתי תיאוריות, שיטות, מקרים או גישות שונות, תוך זיהוי קווי דמיון והבדל, יתרונות וחסרונות של כל אחת. השיטה מפתחת חשיבה ביקורתית ויכולת להבחין בין גישות שונות באופן שיטתי ומעמיק.',
    example: 'בקורס חינוך: השוואה בין גישת מונטסורי לגישת וולדורף בחינוך הילדים - ניתוח עקרונות היסוד, שיטות הוראה, ותוצאות למידה. בקורס פסיכולוגיה: השוואה בין התיאוריות הקוגניטיביות והביהבוריסטיות בלמידה.',
    bloomExplanation: 'ניתוח השוואתי דורש פירוק של מערכות מורכבות לרכיביהן, זיהוי דפוסים ומבנים, והבנה של יחסי גומלין. הלומד מפתח יכולת לראות מעבר לפרטים הבודדים ולהבין את המערכת הכוללת. התהליך מחייב הבנה מעמיקה של כל גישה בפני עצמה, יצירת קריטריונים להשוואה, וניתוח מבני של היחסים בין הגישות השונות.',
    bloomLevel: 'analyze',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'יעיל בכיתות קטנות עד בינוניות',
      delivery: 'סמינר, דיון, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'Comparison Chart Maker',
        description: 'כלי ליצירת טבלאות השוואה מעוצבות',
        link: 'https://www.canva.com/charts/comparison/'
      },
      {
        name: 'Lucidchart',
        description: 'פלטפורמה למפות השוואה מתקדמות',
        link: 'https://www.lucidchart.com/'
      },
      {
        name: 'Mindmeister',
        description: 'כלי מיפוי מחשבה לניתוח השוואתי',
        link: 'https://www.mindmeister.com/'
      },
      {
        name: 'Creately',
        description: 'כלי ליצירת דיאגרמות השוואה',
        link: 'https://creately.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מתודולוגיות ניתוח השוואתי בחינוך',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/03050060903184932'
      },
      {
        title: 'חשיבה ביקורתית דרך ניתוח השוואתי',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5789670/'
      },
      {
        title: 'עיצוב מטלות השוואה בהוראה',
        link: 'https://www.sciencedirect.com/science/article/pii/S0959475217301256'
      }
    ]
  },

  // Evaluate Level
  {
    id: 'peer-review',
    title: 'ביקורת עמיתים',
    description: 'תהליך שבו סטודנטים בוחנים ומעריכים עבודות של עמיתיהם לכיתה על פי קריטריונים מוגדרים מראש, תוך מתן משב חזור בונה והצעות לשיפור. התהליך מעודד אחריות הדדית, משפר את איכות הלמידה ומפתח יכולות הערכה ביקורתית.',
    example: 'בקורס כתיבה אקדמית: כל סטודנט קורא טיוטה של מאמר של עמית ומעריך אותה לפי קריטריונים כמו בהירות הטיעון, איכות המקורות, ומבנה הטקסט. בקורס עיצוב גרפי: סטודנטים מעריכים פרויקטים של עמיתיהם על פי עקרונות חזותיים ויצירתיים.',
    bloomExplanation: 'ביקורת עמיתים מבטאת את שלב ההערכה בטקסונומיה של בלום, בכך שהיא דורשת מהלומד לפתח שיפוט מקצועי מבוסס על קריטריונים ברורים. הלומד נדרש לא רק להבין את החומר אלא גם להעריך את איכותו, עקביותו ותקפותו. תהליך זה מפתח חשיבה ביקורתית ויכולת להבחין בין טיעונים חזקים לחלשים, מעודד רפלקציה על הלמידה של הלומד עצמו, ומעמיק את ההבנה דרך הוראה והסבר לאחרים.',
    bloomLevel: 'evaluate',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'יעיל בכיתות קטנות עד בינוניות',
      delivery: 'סמינר, למידה שיתופית, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'Peergrade',
        description: 'פלטפורמה מקצועית לביקורת עמיתים',
        link: 'https://www.peergrade.io/'
      },
      {
        name: 'Turnitin PeerMark',
        description: 'כלי לביקורת עמיתים מתקדם',
        link: 'https://www.turnitin.com/products/peermark/'
      },
      {
        name: 'Google Docs',
        description: 'פלטפורמה שיתופית לביקורת טקסטים',
        link: 'https://docs.google.com/'
      },
      {
        name: 'Eli Review',
        description: 'מערכת להערכת כתיבה שיתופית',
        link: 'https://elireview.com/'
      }
    ],
    furtherReading: [
      {
        title: 'יעילות ביקורת עמיתים בחינוך גבוה',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5479434/'
      },
      {
        title: 'עיצוב מטלות ביקורת עמיתים יעילות',
        link: 'https://www.tandfonline.com/doi/full/10.1080/15391523.2019.1566989'
      },
      {
        title: 'ביקורת עמיתים וחשיבה ביקורתית',
        link: 'https://www.sciencedirect.com/science/article/pii/S0959475217301542'
      }
    ]
  },
  {
    id: 'evidence-evaluation',
    title: 'הערכת ראיות ומקורות',
    description: 'למידה כיצד לבחון באופן ביקורתי את אמינותם ותקפותם של מקורות מידע שונים, תוך הבחנה בין מקורות ראשוניים ומשניים, זיהוי הטיות אפשריות, ובדיקת מהימנות המחברים. מיומנות חיונית בעידן המידע הדיגיטלי.',
    example: 'בקורס היסטוריה: הערכת מקורות שונים על אותו אירוע היסטורי - עיתונות עכשווית, זיכרונות אישיים, מחקרים אקדמיים מאוחרים - והשוואת נקודות המבט. בקורס מדעי המדינה: הערכת מהימנות דוחות מחקר שונים על נושא מדיניות ציבורית.',
    bloomExplanation: 'הערכת ראיות דורשת יכולת לשפוט את איכות המידע ואמינותו על בסיס קריטריונים מקצועיים. הלומד מפתח יכולת לזהות הטיות, לבחון מטרות נסתרות, ולהעריך את החוזק של טיעונים שונים. התהליך כולל הערכה של מתודולוגיות מחקר, בדיקת מהימנות המחברים, ניתוח הלוגיקה הפנימית של הטיעונים.',
    bloomLevel: 'evaluate',
    courseProfile: {
      level: 'מתאים לקורסי ביניים ומתקדמים',
      size: 'יעיל בכיתות מכל הגדלים',
      delivery: 'סמינר, למידה פעילה, למידה מקוונת'
    },
    recommendedTools: [
      {
        name: 'CRAAP Test',
        description: 'כלי להערכת מהימנות מקורות',
        link: 'https://libguides.csuchico.edu/evaluating-sources'
      },
      {
        name: 'Fact Check Explorer',
        description: 'כלי לבדיקת אמינות מידע',
        link: 'https://toolbox.google.com/factcheck/explorer'
      },
      {
        name: 'Lateral Reading Guide',
        description: 'מדריך לקריאה לטרלית לבדיקת מקורות',
        link: 'https://cor.stanford.edu/curriculum/collections/thinking-like-a-fact-checker/'
      },
      {
        name: 'AllSides Media Bias',
        description: 'כלי לזיהוי הטיות תקשורתיות',
        link: 'https://www.allsides.com/media-bias'
      }
    ],
    furtherReading: [
      {
        title: 'הערכת מקורות בעידן הדיגיטלי',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5838124/'
      },
      {
        title: 'חשיבה ביקורתית בהערכת ראיות',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/15391523.2019.1586012'
      },
      {
        title: 'מיומנויות אוריינות מידע במאה ה-21',
        link: 'https://www.sciencedirect.com/science/article/pii/S0360131518302112'
      }
    ]
  },

  // Create Level
  {
    id: 'original-research',
    title: 'מחקר מקורי',
    description: 'עיצוב וביצוע מחקר עצמאי שתורם ידע חדש לתחום, החל משלב ניסוח השאלה, דרך איסוף וניתוח נתונים, ועד הצגת המסקנות.',
    example: 'בקורס פסיכולוגיה: עיצוב מחקר על השפעת מוזיקה על ריכוז בלמידה - הגדרת השערות, בחירת משתתפים, עיצוב ניסוי, איסוף נתונים וניתוח תוצאות.',
    bloomExplanation: 'מחקר מקורי מבטא את שלב היצירה בטקסונומיה של בלום, בכך שהוא דורש מהלומד לייצר ידע חדש ולא רק לצרוך ידע קיים. הלומד נדרש לשלב מיומנויות מכל השלבים הקודמים - זכירה של מתודולוגיות, הבנה של עקרונות מחקר, יישום של כלים סטטיסטיים, ניתוח של תוצאות והערכה של מגבלות - כדי ליצור תובנות חדשות. תהליך זה מפתח עצמאות אינטלקטואלית, יצירתיות מחקרית, ויכולת לתרום לקידום הידע בתחום.',
    bloomLevel: 'create',
    courseProfile: {
      level: 'קורסים מתקדמים ותואר שני',
      size: 'כיתות קטנות עד בינוניות',
      delivery: 'סמינר וליווי אישי'
    },
    recommendedTools: [
      {
        name: 'SPSS',
        description: 'תוכנה לניתוח סטטיסטי מתקדם',
        link: 'https://www.ibm.com/spss'
      },
      {
        name: 'R Studio',
        description: 'סביבת פיתוח לניתוח נתונים עם R',
        link: 'https://rstudio.com/'
      },
      {
        name: 'Zotero',
        description: 'מנהל מקורות מחקר מתקדם',
        link: 'https://www.zotero.org/'
      },
      {
        name: 'Mendeley',
        description: 'כלי לניהול מחקר ושיתוף ידע',
        link: 'https://www.mendeley.com/'
      }
    ],
    furtherReading: [
      {
        title: 'מתודולוגיות מחקר בחינוך',
        link: 'https://www.researchgate.net/publication/educational-research-methods'
      },
      {
        title: 'עקרונות מחקר כמותי ואיכותני',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3543783/'
      },
      {
        title: 'מדריך לכתיבת מחקר אקדמי',
        link: 'https://writing.wisc.edu/handbook/assignments/academic-research/'
      }
    ]
  },
  {
    id: 'design-solution',
    title: 'עיצוב פתרון חדשני',
    description: 'פיתוח פתרון מקורי ויצירתי לבעיה מורכבת, תוך שילוב ידע ממקורות שונים ויצירת משהו חדש שלא היה קיים קודם לכן. התהליך כולל זיהוי הבעיה, מחקר פתרונות קיימים, חשיבה יצירתית, עיצוב הפתרון, בדיקה ושיפור.',
    example: 'בקורס הנדסה: עיצוב מכשיר לעזרה לאנשים עם מוגבלות - מחקר הצרכים, עיצוב הפתרון, בניית אב טיפוס ובדיקת יעילותו. בקורס חינוך: עיצוב סביבת למידה חדשנית הכוללת טכנולוגיה, פסיכולוגיה חינוכית ועיצוב מרחב.',
    bloomExplanation: 'עיצוב פתרון חדשני דורש שילוב יצירתי של ידע קיים ליצירת משהו חדש ומקורי. הלומד נדרש לחשיבה מחוץ לקופסה, לניסוי ולהתמודדות עם אי-ודאות, תוך פיתוח יכולת לראות אפשרויות שאחרים לא ראו. התהליך מצריך סינתזה של מיומנויות מכל הרמות הקודמות: זכירה של פתרונות קיימים, הבנה של עקרונות בסיסיים, יישום של שיטות עיצוב, ניתוח של הבעיה והצרכים, והערכה של יעילות הפתרון.',
    bloomLevel: 'create',
    courseProfile: {
      level: 'מתאים לקורסים מתקדמים ופרויקטים סופיים',
      size: 'יעיל בכיתות קטנות עד בינוניות',
      delivery: 'פרויקט, סדנה, למידה מבוססת בעיות'
    },
    recommendedTools: [
      {
        name: 'Design Thinking Toolkit',
        description: 'כלים לתהליך עיצוב חדשני',
        link: 'https://www.designkit.org/methods'
      },
      {
        name: 'Figma',
        description: 'כלי עיצוב ופרוטוטייפ דיגיטלי',
        link: 'https://www.figma.com/'
      },
      {
        name: 'Tinkercad',
        description: 'כלי עיצוב תלת מימדי פשוט',
        link: 'https://www.tinkercad.com/'
      },
      {
        name: 'MindMeister',
        description: 'כלי למיפוי רעיונות יצירתיים',
        link: 'https://www.mindmeister.com/'
      }
    ],
    furtherReading: [
      {
        title: 'עיצוב חדשני בחינוך: מתיאוריה ליישום',
        link: 'https://www.tandfonline.com/doi/abs/10.1080/15391523.2019.1650987'
      },
      {
        title: 'למידה מבוססת פרויקטים ויצירתיות',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6214874/'
      },
      {
        title: 'חשיבה עיצובית בהוראה',
        link: 'https://www.sciencedirect.com/science/article/pii/S0959475219302633'
      }
    ]
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
  const [selectedTip, setSelectedTip] = useState<PedagogicalTip | null>(null);

  const toggleCategory = (level: string) => {
    setExpandedCategories(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const openTipModal = (tip: PedagogicalTip) => {
    setSelectedTip(tip);
  };

  const closeTipModal = () => {
    setSelectedTip(null);
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
                        <p className={styles.tipDescription}>
                          {tip.description.length > 150 
                            ? `${tip.description.substring(0, 150)}...` 
                            : tip.description}
                        </p>
                      </div>

                      <div className={styles.tipActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTipModal(tip)}
                          className={styles.viewMoreButton}
                        >
                          <Eye size={16} />
                          למידע נוסף
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedTip && (
        <TipDetailsModal
          tip={selectedTip}
          onClose={closeTipModal}
        />
      )}
    </div>
  );
}; 
