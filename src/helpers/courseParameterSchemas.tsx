import { z } from 'zod';
import { AssessmentMethodCategory, TeachingMethodCompatibility, ClassSize } from '../features/assessmentBuilder/lib/assessmentTypes';

export const courseParameterSchema = z.object({
  courseName: z.string().min(3, 'שם הקורס חייב להכיל לפחות 3 תווים'),
  faculty: z.string().min(1, { message: 'יש לבחור את הפקולטה.' }),
  department: z.string().min(1, { message: 'יש לבחור את המחלקה.' }),
  courseContent: z.string().optional(),
  courseType: z.custom<AssessmentMethodCategory>(val => typeof val === 'string' && val.length > 0, {
    message: 'יש לבחור את סוג הקורס.',
  }),
  teachingMethod: z.custom<TeachingMethodCompatibility>(val => typeof val === 'string' && val.length > 0, {
    message: 'יש לבחור את שיטת ההוראה.',
  }),
  classSize: z.custom<ClassSize>(val => typeof val === 'string' && val.length > 0, {
    message: 'יש לבחור את גודל הכיתה.',
  }),
});

export type CourseParameterSchema = z.infer<typeof courseParameterSchema>;

export const courseTypeOptions: { value: AssessmentMethodCategory; label: string }[] = [
  { value: 'introduction', label: 'קורס מבוא' },
  { value: 'large', label: 'קורס רב משתתפים' },
  { value: 'advanced', label: 'קורס מתקדם' },
];

export const teachingMethodOptions: { value: TeachingMethodCompatibility; label: string }[] = [
  { value: 'lecture', label: 'הרצאה פרונטלית' },
  { value: 'seminar', label: 'סמינר' },
  { value: 'workshop', label: 'סדנה' },
  { value: 'lab', label: 'מעבדה' },
  { value: 'fieldwork', label: 'עבודת שדה / פרקטיקום' },
  { value: 'online', label: 'קורס מקוון (Zoom)' },
  { value: 'hybrid', label: 'למידה היברידית' },
];

export const classSizeOptions: { value: ClassSize; label: string }[] = [
  { value: 'small', label: 'קטנה (עד 30 סטודנטים)' },
  { value: 'medium', label: 'בינונית (30-70 סטודנטים)' },
  { value: 'large', label: 'גדולה (70-150 סטודנטים)' },
  { value: 'very-large', label: 'גדולה מאוד (מעל 150 סטודנטים)' },
];

export const facultyOptions: { value: string; label: string }[] = [
  { value: 'humanities', label: 'מדעי הרוח' },
  { value: 'social-sciences', label: 'מדעי החברה' },
  { value: 'natural-sciences', label: 'מדעי הטבע' },
  { value: 'engineering', label: 'הנדסה' },
  { value: 'medicine', label: 'רפואה' },
  { value: 'law', label: 'משפטים' },
  { value: 'business', label: 'ניהול עסקים' },
  { value: 'education', label: 'חינוך' },
  { value: 'arts', label: 'אמנויות' },
  { value: 'agriculture', label: 'חקלאות' },
  { value: 'other', label: 'אחר' },
];

export const departmentOptions: { [faculty: string]: { value: string; label: string }[] } = {
  'humanities': [
    { value: 'history', label: 'היסטוריה' },
    { value: 'philosophy', label: 'פילוסופיה' },
    { value: 'literature', label: 'ספרות' },
    { value: 'linguistics', label: 'בלשנות' },
    { value: 'archaeology', label: 'ארכיאולוגיה' },
    { value: 'jewish-studies', label: 'לימודי יהדות' },
    { value: 'other-humanities', label: 'אחר' },
  ],
  'social-sciences': [
    { value: 'psychology', label: 'פסיכולוגיה' },
    { value: 'sociology', label: 'סוציולוגיה' },
    { value: 'political-science', label: 'מדעי המדינה' },
    { value: 'economics', label: 'כלכלה' },
    { value: 'international-relations', label: 'יחסים בינלאומיים' },
    { value: 'anthropology', label: 'אנתרופולוגיה' },
    { value: 'geography', label: 'גיאוגרפיה' },
    { value: 'communication', label: 'תקשורת' },
    { value: 'social-work', label: 'עבודה סוציאלית' },
    { value: 'other-social', label: 'אחר' },
  ],
  'natural-sciences': [
    { value: 'mathematics', label: 'מתמטיקה' },
    { value: 'physics', label: 'פיזיקה' },
    { value: 'chemistry', label: 'כימיה' },
    { value: 'biology', label: 'ביולוגיה' },
    { value: 'computer-science', label: 'מדעי המחשב' },
    { value: 'statistics', label: 'סטטיסטיקה' },
    { value: 'earth-sciences', label: 'מדעי כדור הארץ' },
    { value: 'other-sciences', label: 'אחר' },
  ],
  'engineering': [
    { value: 'civil-engineering', label: 'הנדסה אזרחית' },
    { value: 'mechanical-engineering', label: 'הנדסת מכונות' },
    { value: 'electrical-engineering', label: 'הנדסת חשמל' },
    { value: 'computer-engineering', label: 'הנדסת מחשבים' },
    { value: 'industrial-engineering', label: 'הנדסת תעשיה וניהול' },
    { value: 'chemical-engineering', label: 'הנדסה כימית' },
    { value: 'other-engineering', label: 'אחר' },
  ],
  'medicine': [
    { value: 'medicine', label: 'רפואה' },
    { value: 'nursing', label: 'סיעוד' },
    { value: 'pharmacy', label: 'רוקחות' },
    { value: 'public-health', label: 'בריאות הציבור' },
    { value: 'dentistry', label: 'רפואת שיניים' },
    { value: 'other-medicine', label: 'אחר' },
  ],
  'law': [
    { value: 'law', label: 'משפטים' },
    { value: 'criminology', label: 'קרימינולוגיה' },
    { value: 'other-law', label: 'אחר' },
  ],
  'business': [
    { value: 'business-administration', label: 'ניהול עסקים' },
    { value: 'accounting', label: 'חשבונאות' },
    { value: 'marketing', label: 'שיווק' },
    { value: 'finance', label: 'מימון' },
    { value: 'human-resources', label: 'משאבי אנוש' },
    { value: 'other-business', label: 'אחר' },
  ],
  'education': [
    { value: 'education', label: 'חינוך' },
    { value: 'special-education', label: 'חינוך מיוחד' },
    { value: 'early-childhood', label: 'חינוך לגיל הרך' },
    { value: 'educational-counseling', label: 'יעוץ חינוכי' },
    { value: 'other-education', label: 'אחר' },
  ],
  'arts': [
    { value: 'fine-arts', label: 'אמנות פלסטית' },
    { value: 'music', label: 'מוזיקה' },
    { value: 'theater', label: 'תיאטרון' },
    { value: 'film', label: 'קולנוע' },
    { value: 'design', label: 'עיצוב' },
    { value: 'other-arts', label: 'אחר' },
  ],
  'agriculture': [
    { value: 'agriculture', label: 'חקלאות' },
    { value: 'veterinary', label: 'רפואה וטרינרית' },
    { value: 'food-science', label: 'מדעי המזון' },
    { value: 'other-agriculture', label: 'אחר' },
  ],
  'other': [
    { value: 'other-department', label: 'אחר' },
  ],
};
