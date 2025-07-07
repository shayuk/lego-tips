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
  const [fileType, setFileType] = useState<'syllabus' | 'article'>('syllabus'); // הוספת state לסוג הקובץ

  // הפרדת תוכן ידני מתוכן קובץ מועלה - מעודכן לתמיכה במאמרים
  const separateContent = (content: string) => {
    const syllabusStart = content.indexOf('--- תוכן הסילבוס ---');
    const articleStart = content.indexOf('--- תוכן המאמר ---');
    
    const separatorStart = Math.min(
      syllabusStart === -1 ? Infinity : syllabusStart,
      articleStart === -1 ? Infinity : articleStart
    );
    
    if (separatorStart === Infinity) {
      return { manualContent: content, fileContent: '' };
    }
    
    return {
      manualContent: content.substring(0, separatorStart).trim(),
      fileContent: content.substring(separatorStart).trim()
    };
  };

  const handleClearManualText = () => {
    const currentContent = watch('courseContent') || '';
    const { fileContent } = separateContent(currentContent);
    setValue('courseContent', fileContent, { shouldValidate: true });
    setFileError(null);
    setFileSuccess(null);
  };

  const handleClearFile = () => {
    const currentContent = watch('courseContent') || '';
    const { manualContent } = separateContent(currentContent);
    setValue('courseContent', manualContent, { shouldValidate: true });
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
    if (!text || typeof text !== 'string') return '';
    
    // שלב 1: הסרת פטרנים ספציפיים של קבצים בינאריים ו-XML
    let cleaned = text
      .replace(/PK\\x03\\x04[\s\S]*?/g, '') // DOCX binary signatures
      .replace(/PK[\s\S]*?xml/gi, '') // DOCX signatures
      .replace(/%PDF[\s\S]*?obj/gi, '') // PDF signatures
      .replace(/�/g, '') // replacement characters
      .replace(/\\x00/g, '') // null bytes
      .replace(/[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F-\\x9F]/g, '') // control characters
      .replace(/<[^>]*>/g, '') // XML/HTML tags
      .replace(/obj\s*<<[^>]*>>/g, '') // PDF objects
      .replace(/endobj/g, '') // PDF end objects
      .replace(/stream[\s\S]*?endstream/gi, '') // PDF streams
      .replace(/xref[\s\S]*?trailer/gi, '') // PDF xref tables
      .replace(/\/[A-Z][a-zA-Z]*\s*\d+/g, '') // PDF references
      .replace(/\d+\s+\d+\s+obj/g, '') // PDF object headers
      .replace(/BT[\s\S]*?ET/g, '') // PDF text objects
      .replace(/q[\s\S]*?Q/g, '') // PDF graphics state
      .replace(/[0-9]+\.?[0-9]*\s+[0-9]+\.?[0-9]*\s+[0-9]+\.?[0-9]*\s+[rg|RG|k|K]/g, '') // PDF color commands
      .replace(/\/F\d+\s+\d+\s+Tf/g, '') // PDF font commands
      .replace(/\d+\.?\d*\s+\d+\.?\d*\s+Td/g, '') // PDF text positioning
      .replace(/\(\s*\)/g, '') // empty parentheses
      .replace(/\[\s*\]/g, '') // empty brackets
      .replace(/{\s*}/g, '') // empty braces
      .replace(/w%=\^i7\+d&0A6l4L60#S/g, '') // specific garbage pattern
      .replace(/0X\*V\$:B~\^K/g, '') // specific garbage pattern
      .replace(/Pl~7\$iJ&B0ZDut0JK\(HxG\//g, '') // specific garbage pattern
      .replace(/L\+vdcW>\*\^XRmpZ\}HwnMVn-/g, '') // specific garbage pattern
      .replace(/sDXj;A\*c4\[S9>\s*"\)/g, '') // specific garbage pattern
      .replace(/ZwB`4/g, '') // specific garbage pattern
      .replace(/\{V4pW&A\|d\?ks\{gPv\$3IuH8\s*\(K/g, '') // specific garbage pattern
      .replace(/YTlDC_:j\}\s*&#8-/g, '') // specific garbage pattern
      .replace(/j0EJ\(eh4NDB81\$14\s*\{1\}/g, '') // specific garbage pattern from image
             .replace(/[^\w\s\u0590-\u05FF\u200E\u200F\u202A-\u202E.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>\r\n-]/g, ''); // תווים לא קריאים

    // שלב 2: ניקוי תווים לפי character codes (מתוקן)
    cleaned = cleaned
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        return (
          code === 32 ||  // space
          code === 9 ||   // tab
          code === 10 ||  // newline
          code === 13 ||  // carriage return
          (code >= 33 && code <= 126) || // ASCII printable
          (code >= 1488 && code <= 1514) || // עברית בסיסית
          (code >= 1520 && code <= 1524) || // עברית נוספת
          (code >= 1425 && code <= 1479) || // ניקוד עברי
          (code >= 8204 && code <= 8207) || // RTL/LTR marks
          (code >= 160 && code <= 255) || // Latin extended
          code === 8226 || // bullet point
          code === 8211 || // en dash
          code === 8212 || // em dash
          code === 8216 || // left single quote
          code === 8217 || // right single quote
          code === 8220 || // left double quote
          code === 8221    // right double quote
        );
      })
      .join('');

    // שלב 3: ניקוי פורמט וארגון מחדש
    cleaned = cleaned
      .replace(/\s{4,}/g, '   ') // מרווחים מרובים יותר מדי
      .replace(/\n\s*\n\s*\n/g, '\n\n') // שורות ריקות מרובות
      .replace(/^\s+/gm, '') // רווחים בתחילת שורות
      .replace(/\s+$/gm, '') // רווחים בסוף שורות
      .replace(/([.!?])\s*([a-zA-Z\u0590-\u05FF])/g, '$1 $2') // רווח אחרי סימני פיסוק
      .trim();

    // שלב 4: בדיקת תוכן משמעותי
    // הסרת שורות קצרות מדי שעשויות להיות רעש
    const lines = cleaned.split('\n').filter(line => {
      const trimmed = line.trim();
             return trimmed.length > 2 && // לא שורות קצרות מדי
              !/^[\d\s.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]+$/.test(trimmed); // לא רק סימנים
    });

    return lines.join('\n').trim();
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
        
        // הקובץ נקרא בהצלחה - הוסף את התוכן הנקי עם סמן דינמי
        const currentContent = watch('courseContent') || '';
        const contentSeparator = fileType === 'syllabus' ? '--- תוכן הסילבוס ---' : '--- תוכן המאמר ---';
        const combinedContent = currentContent 
          ? `${currentContent}\n\n${contentSeparator}\n${cleanedText}`
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
        const fileTypeName = fileType === 'syllabus' ? 'סילבוס' : 'מאמר';
        setFileError(`יש להזין תוכן הקורס (העלאת ${fileTypeName} או כתיבה חופשית).`);
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
        
        {/* בחירת סוג הקובץ */}
        <div className={styles.field}>
          <label className={styles.label}>
            <FileText size={16} />
            סוג התוכן
          </label>
          <div className={styles.fileTypeSelector}>
            <label className={`${styles.fileTypeOption} ${fileType === 'syllabus' ? styles.selected : ''}`}>
              <input
                type="radio"
                name="fileType"
                value="syllabus"
                checked={fileType === 'syllabus'}
                onChange={(e) => setFileType(e.target.value as 'syllabus' | 'article')}
                className={styles.radioInput}
              />
              <School size={16} />
              סילבוס
            </label>
            <label className={`${styles.fileTypeOption} ${fileType === 'article' ? styles.selected : ''}`}>
              <input
                type="radio"
                name="fileType"
                value="article"
                checked={fileType === 'article'}
                onChange={(e) => setFileType(e.target.value as 'syllabus' | 'article')}
                className={styles.radioInput}
              />
              <FileText size={16} />
              מאמר
            </label>
          </div>
        </div>
        
        <p className={styles.sectionDescription}>
          ניתן להעלות קובץ {fileType === 'syllabus' ? 'סילבוס' : 'מאמר'} (TXT, PDF, DOC, DOCX) ואז לכתוב הוראות ספציפיות נוספות בתיבת הטקסט, או להדביק את תכני הקורס ישירות. 
          <br /><strong>טיפ:</strong> אם תכתבו הוראות ספציפיות כמו "המטלה תתרכז בנושא X", ה-AI יתמקד בדיוק בנושא הזה.
          <br /><strong>הערה:</strong> אם קובץ PDF/DOC לא נקרא כראוי, המערכת תבקש להעתיק את התוכן ידנית.
        </p>
        <div className={styles.contentInput}>
          <div className={styles.dropzoneContainer}>
            <FileDropzone
              onFilesSelected={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
              title={syllabusFile ? `הקובץ "${syllabusFile.name}" נבחר` : `גרור קובץ ${fileType === 'syllabus' ? 'סילבוס' : 'מאמר'} לכאן או לחץ לבחירה`}
              subtitle="סוגי קבצים: TXT, PDF, DOC, DOCX. גודל מקסימלי: 5MB"
              icon={<Upload size={36} />}
            />
            {syllabusFile && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFile}
                  title={`הסר ${fileType === 'syllabus' ? 'סילבוס' : 'מאמר'}`}
                >
                  <X size={14} />
                  הסר {fileType === 'syllabus' ? 'סילבוס' : 'מאמר'}
                </Button>
              </div>
            )}
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
                      `תוכן ה${fileType === 'syllabus' ? 'סילבוס' : 'מאמר'} נטען. ניתן לערוך ולהוסיף פרטים נוספים כמו: המטלה תתרכז בהיסטוריה של הסכסוך הערבי-ישראלי במאה ה-20...` : 
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
                    onClick={handleClearManualText}
                    className={styles.clearButton}
                    title="נקה טקסט ידני"
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