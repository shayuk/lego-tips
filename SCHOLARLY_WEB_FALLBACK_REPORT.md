# דוח יישום: Scholarly Web Fallback + Quality Gating + Reporting

## תאריך יישום
2024-12-19

## מטרה
יישום מנגנון "Scholarly Web Fallback" שמבצע חיפוש במקורות אקדמיים כאשר החומר שהועלה דל או לא רלוונטי, במקום ליצור מטלה גנרית.

---

## מה שונה (רשימת קבצים)

### קבצים חדשים שנוספו:
1. **src/helpers/materialQuality.ts** - מודול הערכת איכות חומרים
2. **src/helpers/scholarlySearch.ts** - מודול חיפוש מקורות אקדמיים (OpenAlex)

### קבצים שעודכנו:

#### Backend:
3. **functions/src/index.ts**
   - הוספת interfaces: `ScholarlySource`, `MaterialQualityReport`
   - עדכון `StructuredAssignment` עם שדות: `groundingMode`, `sourcesUsed`, `apa7References`, `materialQualityReport`
   - הוספת פונקציות עזר: `extractKeywords`, `assessMaterialQuality`, `searchScholarlySources`, `formatAPA7References`, `validateAssignmentSpecificity`
   - שילוב Quality Gate ו-Scholarly Search ב-pipeline של יצירת מטלה
   - עדכון prompt בהתאם ל-grounding mode

4. **server/server.js**
   - הוספת לוגיקה דומה ל-functions/src/index.ts (גרסה JavaScript)
   - שילוב Quality Gate ו-Scholarly Search
   - עדכון `parseAIResponseToStructuredFormat` לכלול שדות חדשים

#### Frontend:
5. **src/helpers/secureApiClient.ts**
   - הוספת interfaces: `ScholarlySource`, `MaterialQualityReport`
   - עדכון `StructuredAssignment` עם שדות חדשים

6. **src/features/assessmentBuilder/hooks/useAssessmentGenerator.tsx**
   - הוספת state עבור: `groundingMode`, `sourcesUsed`, `apa7References`, `materialQualityReport`
   - עדכון `fetchRubric` לחלץ שדות חדשים מ-API response
   - החזרת שדות חדשים מה-hook

7. **src/features/assessmentBuilder/components/GeneratedAssessmentDisplay.tsx**
   - הוספת props: `groundingMode`, `sourcesUsed`, `apa7References`, `materialQualityReport`
   - הוספת UI להצגת מקורות, מצב בסיס, והפניות APA7

8. **src/pages/assessment-builder.tsx**
   - העברת שדות חדשים ל-`GeneratedAssessmentDisplay`

9. **src/helpers/documentExport.ts**
   - עדכון `ExportOptions` עם `apa7References`, `groundingMode`
   - הוספת הפניות APA7 למסמך Word בסוף

---

## לוגיקת החלטה (מתי uploaded/web/hybrid)

### שלב 1: הערכת איכות חומרים
הפונקציה `assessMaterialQuality` בודקת:
- אורך החומר (מינימום 50 תווים)
- כיסוי מילות מפתח מהבקשה בחומר שהועלה
- חישוב `coverageScore` (0-1):
  - `coverageScore >= 0.6` → `quality: "good"`
  - `coverageScore >= 0.3` → `quality: "thin"`
  - `coverageScore < 0.3` → `quality: "mismatched"`

### שלב 2: החלטה על Grounding Mode
```typescript
if (qualityReport.quality === "good") {
  groundingMode = "uploaded";
  // משתמש רק בחומר שהועלה
} else {
  // מחפש מקורות אקדמיים
  scholarlySources = await searchScholarlySources(query, 8);
  
  if (scholarlySources.length > 0) {
    if (qualityReport.quality === "mismatched") {
      groundingMode = "web";
      // משתמש רק במקורות שנמצאו
    } else {
      groundingMode = "hybrid";
      // משתמש בחומר שהועלה + מקורות נוספים
    }
  } else {
    groundingMode = "uploaded";
    // לא נמצאו מקורות, ממשיך עם החומר שהועלה
  }
}
```

---

## Domain Allow/Deny

### Domains שנדחים (DENY):
- `wikipedia.org`, `wikimedia.org`
- `medium.com`, `substack.com`
- `blogspot.com`, `wordpress.com`
- `coursehero.com`, `studocu.com`
- `chegg.com`, `quizlet.com`
- `reddit.com`, `quora.com`
- `yahoo.com`, `answers.com`

### סוגי מקורות מותרים (OpenAlex):
- `journal-article` (מאמרי כתב עת)
- `book` (ספרים)
- `book-chapter` (פרקי ספרים)
- `report` (דוחות)
- `dissertation` (דוקטורט)
- `dataset` (מערכי נתונים)

### קריטריוני איכות:
- העדפה למקורות עם DOI
- העדפה למקורות Open Access
- העדפה למקורות עם מספר ציטוטים גבוה (>10)
- דירוג relevance score (התאמה לשאילתה)
- דירוג credibility score (אמינות המקור)

---

## דוגמה להרצה

### תרחיש: בקשה עם חומר דל
**קלט:**
- שם קורס: "Nigeria independence geopolitical local+global"
- תוכן קורס: "נושאים כלליים על ניגריה" (קצר מדי, לא ספציפי)

**תהליך:**
1. **Quality Gate**: `assessMaterialQuality` מזהה `coverageScore < 0.3` → `quality: "mismatched"`
2. **Scholarly Search**: מחפש ב-OpenAlex עם query: "Nigeria independence geopolitical local global"
3. **תוצאות**: נמצאו 8 מקורות אקדמיים רלוונטיים (מאמרים, ספרים)
4. **Grounding Mode**: `"web"` (כי החומר לא תואם)
5. **Prompt**: מעודכן להכיל תקצירי מקורות + הוראה מפורשת להתבסס רק עליהם
6. **תוצר**: מטלה ספציפית על ניגריה עם הפניות APA7

**תוצר סופי כולל:**
- מטלה HTML עם תוכן ספציפי
- סעיף "מקורות ששימשו" עם רשימת המקורות
- הפניות APA7 בסוף המטלה
- UI מציג: "מצב בסיס: חיפוש באינטרנט (החומר שהועלה לא תואם לנושא המבוקש)"

---

## Checklist

### Build & Lint
- [x] `npm run build` עובר בהצלחה
- [x] `npm run lint` עובר ללא שגיאות
- [x] TypeScript compilation עובר

### בדיקות ידניות (3 צעדים)

#### צעד 1: בדיקת Quality Gate
1. פתח את האפליקציה
2. הזן שם קורס: "Nigeria independence"
3. הזן תוכן קורס קצר/לא רלוונטי: "נושאים כלליים"
4. בחר שיטות פדגוגיות
5. לחץ "צור מטלה"
6. **צפוי**: המערכת מזהה שהחומר דל ומחפשת מקורות אקדמיים

#### צעד 2: בדיקת UI
1. לאחר יצירת המטלה, גלול למטה
2. **צפוי**: רואה סעיף "מידע על המקורות" עם:
   - מצב בסיס (uploaded/web/hybrid)
   - רשימת מקורות ששימשו
   - הפניות APA7

#### צעד 3: בדיקת Export
1. לחץ "ייצא ל-Word"
2. פתח את הקובץ שנוצר
3. **צפוי**: בסוף המסמך יש סעיף "References (APA 7)" עם כל ההפניות

---

## מגבלות ידועות

1. **אין גישה ל-fulltext**: OpenAlex מחזיר רק metadata ותקצירים. לא ניתן לגשת לתוכן המלא של המאמרים (דורש הרשאות/מנוי).

2. **תלות ב-OpenAlex**: אם ה-API של OpenAlex לא זמין, המערכת תמשיך עם החומר שהועלה (fallback).

3. **חיפוש באנגלית**: OpenAlex עובד טוב יותר עם שאילתות באנגלית. שאילתות בעברית עשויות להחזיר פחות תוצאות.

4. **זמן תגובה**: חיפוש מקורות אקדמיים מוסיף ~2-5 שניות לזמן יצירת המטלה.

5. **איכות תוצאות**: תלויה באיכות השאילתה. אם הבקשה מאוד כללית, התוצאות עשויות להיות פחות רלוונטיות.

6. **מספר מקורות**: מוגבל ל-5-8 מקורות (ניתן לשנות ב-`maxResults`).

---

## שיפורים עתידיים אפשריים

1. **תמיכה בכמה providers**: הוספת Crossref, PubMed, Google Scholar (דורש API keys)
2. **Caching**: שמירת תוצאות חיפוש ב-cache למניעת חיפושים חוזרים
3. **Full-text access**: שילוב עם מאגרים כמו JSTOR, EBSCO (דורש מנוי)
4. **תמיכה בעברית**: שיפור חיפוש בעברית או תרגום אוטומטי של שאילתות
5. **Machine Learning**: שיפור relevance scoring באמצעות ML models

---

## סיכום טכני

### Dependencies חדשים
אין dependencies חדשים - משתמשים ב-`fetch` המובנה של Node.js/Browser.

### API Keys
לא נדרשים API keys - OpenAlex הוא חינמי ופתוח.

### Performance
- Quality Gate: ~10-50ms (חישוב מקומי)
- Scholarly Search: ~2-5s (תלוי ב-OpenAlex API)
- Total overhead: ~2-5s נוסף ליצירת מטלה

### Security
- כל URLs נבדקים נגד רשימת DENY domains
- HTML sanitization נשאר פעיל (DOMPurify)
- אין חשיפת API keys

---

## קישור לקומיט

הקומיט האחרון: `feat/scholarly-web-fallback`

---

## הערות נוספות

- המערכת תומכת ב-backward compatibility - אם אין שדות חדשים בתגובה, המערכת תמשיך לעבוד כרגיל
- כל השינויים הם opt-in - אם החומר מספק, המערכת לא תחפש מקורות נוספים
- ה-UI מציג בבירור את מצב הבסיס והסיבה לשימוש במקורות חיצוניים

