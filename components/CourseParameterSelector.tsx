import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, BookOpen, Users, School, Monitor, TestTube, Briefcase, X, Wand2 } from 'lucide-react';

import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Textarea } from './Textarea';
import { FileDropzone } from './FileDropzone';
import { courseParameterSchema, CourseParameterSchema, courseTypeOptions, teachingMethodOptions, classSizeOptions, facultyOptions, departmentOptions } from '../helpers/courseParameterSchemas';
import styles from './CourseParameterSelector.module.css';

export interface CourseParameterSelectorProps {
  className?: string;
  onParametersSubmit: (data: CourseParameterSchema) => void;
  isSubmitting?: boolean;
}

export const CourseParameterSelector: React.FC<CourseParameterSelectorProps> = ({
  className,
  onParametersSubmit,
  isSubmitting = false,
}) => {
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  const handleClearContent = () => {
    setValue('courseContent', '', { shouldValidate: true });
    setSyllabusFile(null);
    setFileError(null);
    setFileSuccess(null);
  };

  const handleCleanGibberish = () => {
    const currentContent = watch('courseContent') || '';
    if (currentContent) {
      const cleanedContent = cleanGibberish(currentContent);
      setValue('courseContent', cleanedContent, { shouldValidate: true });
      setFileSuccess('תווים לא קריאים הוסרו מהטקסט.');
    }
  };

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CourseParameterSchema>({
    resolver: zodResolver(courseParameterSchema),
    defaultValues: {
      courseName: '',
      faculty: '',
      department: '',
      courseContent: '',
      courseType: undefined,
      teachingMethod: undefined,
      classSize: undefined,
    },
  });

  const watchedFaculty = watch('faculty');

    const cleanGibberish = (text: string): string => {
    // הסרת תווים לא קריאים ושמירה על טקסט קריא בלבד
    let cleaned = text
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        // שמירה על תווים קריאים: רווח, tab, newline, אנגלית, מספרים, עברית, ערבית, סימני פיסוק בסיסיים
        return (
          code === 32 ||  // space
          code === 9 ||   // tab
          code === 10 ||  // newline
          code === 13 ||  // carriage return
          (code >= 33 && code <= 126) || // ASCII printable
          (code >= 1488 && code <= 1514) || // עברית
          (code >= 1520 && code <= 1524) || // עברית נוספת
          (code >= 1425 && code <= 1479) || // ניקוד עברי
          (code >= 8204 && code <= 8207) || // RTL/LTR marks
          (code >= 160 && code <= 255) // Latin extended
        );
      })
      .join('');

    // הסרת פטרנים ספציפיים של קבצים
    cleaned = cleaned
      .replace(/�/g, '') // replacement characters
      .replace(/PK[\s\S]*?xml/gi, '') // DOCX signatures
      .replace(/%PDF[\s\S]*?obj/gi, '') // PDF signatures
      .replace(/[^\w\s\u0590-\u05FF\u200E\u200F\u202A-\u202E.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]/g, '') // תווים מוזרים
      .replace(/\s{3,}/g, ' ') // מרווחים מרובים
      .replace(/\n{3,}/g, '\n\n') // שורות ריקות מרובות
      .trim();

    return cleaned;
  };

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSyllabusFile(file);
      setFileError(null);
      setFileSuccess(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // ניקוי הטקסט מג'בריש
        const cleanedText = cleanGibberish(text);
        
        // בדיקה אם נשאר טקסט משמעותי אחרי הניקוי
        if (cleanedText.length < 10) {
          setFileError(
            `הקובץ "${file.name}" לא מכיל טקסט קריא. ` +
            'אנא פתח את הקובץ, העתק את התוכן (Ctrl+A → Ctrl+C) והדבק בתיבת הטקסט למטה (Ctrl+V).'
          );
          setSyllabusFile(null);
          return;
        }
        
        // הקובץ נקרא בהצלחה - הוסף את התוכן הנקי
        const currentContent = watch('courseContent') || '';
        const combinedContent = currentContent 
          ? `${currentContent}\n\n--- תוכן הסילבוס ---\n${cleanedText}`
          : cleanedText;
        setValue('courseContent', combinedContent, { shouldValidate: true });
        
        // הצגת הודעת הצלחה
        const significantChange = Math.abs(cleanedText.length - text.length) > text.length * 0.1; // שינוי של יותר מ-10%
        if (significantChange && cleanedText.length > 10) {
          setFileSuccess(`הקובץ "${file.name}" נטען בהצלחה. תווים לא קריאים הוסרו אוטומטית.`);
        } else {
          setFileSuccess(`הקובץ "${file.name}" נטען בהצלחה.`);
        }
      };
      
      reader.onerror = () => {
        setFileError(`שגיאה בקריאת הקובץ "${file.name}". אנא נסה להעתיק ולהדביק את התוכן ידנית.`);
        setSyllabusFile(null);
      };
      
      reader.readAsText(file, 'UTF-8');
    }
  }, [setValue, watch]);

  const onSubmit = (data: CourseParameterSchema) => {
    if (!data.courseContent || data.courseContent.trim() === '') {
        setFileError('יש להזין תוכן הקורס (העלאת סילבוס או כתיבה חופשית).');
        return;
    }
    setFileError(null);
    onParametersSubmit(data);
  };

  const getTeachingMethodIcon = (value: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      lecture: <School size={16} />,
      seminar: <BookOpen size={16} />,
      workshop: <TestTube size={16} />,
      lab: <TestTube size={16} />,
      fieldwork: <Briefcase size={16} />,
      online: <Monitor size={16} />,
      hybrid: <BookOpen size={16} />,
    };
    return iconMap[value] || null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${styles.container} ${className || ''}`} noValidate>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <BookOpen size={24} className={styles.titleIcon} />
          פרטי הקורס
        </h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="courseName" className={styles.label}>
              <BookOpen size={16} />
              שם הקורס
            </label>
            <Controller
              name="courseName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="courseName"
                  type="text"
                  placeholder="למשל: מבוא לפסיכולוגיה"
                  className={`${styles.input} ${errors.courseName ? styles.errorInput : ''}`}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.courseName && <p className={styles.errorMessage}>{errors.courseName.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="faculty" className={styles.label}>
              <School size={16} />
              פקולטה
            </label>
            <Controller
              name="faculty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <SelectTrigger id="faculty" className={errors.faculty ? styles.errorInput : ''}>
                    <SelectValue placeholder="בחר פקולטה" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.faculty && <p className={styles.errorMessage}>{errors.faculty.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="department" className={styles.label}>
              <Users size={16} />
              מחלקה
            </label>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || !watchedFaculty}>
                  <SelectTrigger id="department" className={errors.department ? styles.errorInput : ''}>
                    <SelectValue placeholder={watchedFaculty ? "בחר מחלקה" : "בחר תחילה פקולטה"} />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedFaculty && departmentOptions[watchedFaculty]?.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department && <p className={styles.errorMessage}>{errors.department.message}</p>}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FileText size={24} className={styles.titleIcon} />
          תכני הקורס
        </h2>
        <p className={styles.sectionDescription}>
          ניתן להעלות קובץ סילבוס (TXT, PDF, DOC, DOCX) ואז לכתוב הוראות ספציפיות נוספות בתיבת הטקסט, או להדביק את תכני הקורס ישירות. 
          <br /><strong>טיפ:</strong> אם תכתבו הוראות ספציפיות כמו "המטלה תתרכז בנושא X", ה-AI יתמקד בדיוק בנושא הזה.
          <br /><strong>הערה:</strong> אם קובץ PDF/DOC לא נקרא כראוי, המערכת תבקש להעתיק את התוכן ידנית.
        </p>
        <div className={styles.contentInput}>
          <div className={styles.dropzoneContainer}>
            <FileDropzone
              onFilesSelected={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
              title={syllabusFile ? `הקובץ "${syllabusFile.name}" נבחר` : "גרור קובץ סילבוס לכאן או לחץ לבחירה"}
              subtitle="סוגי קבצים: TXT, PDF, DOC, DOCX. גודל מקסימלי: 5MB"
              icon={<Upload size={36} />}
            />
          </div>
          <div className={styles.orSeparator}>תוכן הקורס</div>
          <div className={styles.textareaContainer}>
            <div className={styles.textareaWithButton}>
              <Controller
                name="courseContent"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder={syllabusFile ? 
                      "תוכן הסילבוס נטען. ניתן לערוך ולהוסיף פרטים נוספים כמו: המטלה תתרכז בהיסטוריה של הסכסוך הערבי-ישראלי במאה ה-20..." : 
                      "הדבק כאן את תכני הקורס, ראשי פרקים, או תיאור כללי. לדוגמה: המטלה תתרכז בהיסטוריה של הסכסוך הערבי-ישראלי במאה ה-20..."
                    }
                    className={styles.textarea}
                    rows={8}
                    disabled={false}
                  />
                )}
              />
              {watch('courseContent') && (
                <div className={styles.textareaButtons}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCleanGibberish}
                    className={styles.cleanButton}
                    title="נקה תווים לא קריאים"
                  >
                    <Wand2 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearContent}
                    className={styles.clearButton}
                    title="נקה תוכן"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {(errors.courseContent || fileError) && <p className={styles.errorMessage}>{errors.courseContent?.message || fileError}</p>}
        {fileSuccess && <p className={styles.successMessage}>{fileSuccess}</p>}
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="courseType" className={styles.label}>
            <BookOpen size={16} />
            סוג הקורס
          </label>
          <Controller
            name="courseType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger id="courseType" className={errors.courseType ? styles.errorInput : ''}>
                  <SelectValue placeholder="בחר את סוג הקורס" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.courseType && <p className={styles.errorMessage}>{errors.courseType.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="teachingMethod" className={styles.label}>
            <School size={16} />
            שיטת ההוראה
          </label>
          <Controller
            name="teachingMethod"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger id="teachingMethod" className={errors.teachingMethod ? styles.errorInput : ''}>
                  <SelectValue placeholder="בחר את שיטת ההוראה" />
                </SelectTrigger>
                <SelectContent>
                  {teachingMethodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className={styles.selectItem}>
                        {getTeachingMethodIcon(option.value)}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.teachingMethod && <p className={styles.errorMessage}>{errors.teachingMethod.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="classSize" className={styles.label}>
            <Users size={16} />
            גודל הכיתה
          </label>
          <Controller
            name="classSize"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger id="classSize" className={errors.classSize ? styles.errorInput : ''}>
                  <SelectValue placeholder="בחר את גודל הכיתה" />
                </SelectTrigger>
                <SelectContent>
                  {classSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.classSize && <p className={styles.errorMessage}>{errors.classSize.message}</p>}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'מעבד...' : 'הצע לי חלופות הערכה'}
        </Button>
      </div>
    </form>
  );
};