import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, BookOpen, Users, School, Monitor, TestTube, Briefcase, X, Wand2, File, Trash2, Save, CheckCircle } from 'lucide-react';

import { parseFileContent } from '../../helpers/fileParsers';
import { Button } from '../../../components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/Select';
import { Textarea } from '../../../components/Textarea';
import { FileDropzone } from '../../../components/FileDropzone';
import { useAppToast } from '../../../components/AppLayout';
import { TOAST_MESSAGES } from '../../helpers/useToast';
import { cleanFileText, quickClean, aggressiveClean, isTextGarbled } from '../../helpers/textCleaner';
import { courseParameterSchema, CourseParameterSchema, courseTypeOptions, teachingMethodOptions, classSizeOptions, facultyOptions, departmentOptions } from '../lib/courseParameterSchemas';
import styles from './CourseParameterSelector.module.css';
import { useAssessmentBuilder } from '../hooks/useAssessmentBuilder';
import { GeneratedAssessment } from '../types/Assessment';

export interface CourseParameterSelectorProps {
  className?: string;
  onParametersSubmit: (data: CourseParameterSchema) => void;
  isSubmitting?: boolean;
}

interface UploadedFile {
  id: string;
  file: File;
  type: 'syllabus' | 'article' | 'other';
  content: string;
}

interface AutoSaveData {
  formData: Partial<CourseParameterSchema>;
  uploadedFiles: Omit<UploadedFile, 'file'>[];
  timestamp: number;
}

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";
interface CourseParameterState {
  uploadedFiles: UploadedFile[];
  fileError: string | null;
  fileSuccess: string | null;
  autoSaveStatus: AutoSaveStatus;
  lastSaved: Date | null;
  hasLoaded: boolean;
}

const AUTO_SAVE_KEY = 'pedagogical-lego-autosave';

export const CourseParameterSelector: React.FC<CourseParameterSelectorProps> = ({
  className,
  onParametersSubmit,
  isSubmitting = false,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<CourseParameterState["uploadedFiles"]>([]);
  const [fileError, setFileError] = useState<CourseParameterState["fileError"]>(null);
  const [fileSuccess, setFileSuccess] = useState<CourseParameterState["fileSuccess"]>(null);

  const [autoSaveStatus, setAutoSaveStatus] = useState<CourseParameterState['autoSaveStatus']>('idle');
  const [lastSaved, setLastSaved] = useState<CourseParameterState['lastSaved']>(null);
  
  // Toast functionality
  const toast = useAppToast();

  // פונקציות שמירה אוטומטית
  const saveToLocalStorage = useCallback((data: Partial<CourseParameterSchema>) => {
    // הגנה מפני שמירה במהלך הקלדה אקטיבית
    if (autoSaveStatus === 'saving') return;
    
    try {
      const autoSaveData: AutoSaveData = {
        formData: data,
        uploadedFiles: uploadedFiles.map(({ file, ...rest }) => rest), // הסרת file object שלא ניתן לשמור
        timestamp: Date.now()
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      // הסתרת הודעה אחרי 2 שניות
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setAutoSaveStatus('error');
      // אל תזרוק toast error בכל פעם - רק לוג לקונסול
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 1500);
    }
  }, [uploadedFiles, autoSaveStatus]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const autoSaveData: AutoSaveData = JSON.parse(saved);
        
        // בדיקה אם הנתונים לא ישנים מדי (24 שעות)
        const isOld = Date.now() - autoSaveData.timestamp > 24 * 60 * 60 * 1000;
        if (isOld) {
          localStorage.removeItem(AUTO_SAVE_KEY);
          return null;
        }
        
        return autoSaveData;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      localStorage.removeItem(AUTO_SAVE_KEY);
    }
    return null;
  }, []);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    setLastSaved(null);
  }, []);

  // הפרדת תוכן ידני מתוכן קבצים מועלים - מעודכן לתמיכה בקבצים מרובים
  const separateContent = (content: string) => {
    const separators = ['--- תוכן הסילבוס ---', '--- תוכן המאמר ---', '--- תוכן קובץ נוסף ---'];
    let manualContent = content;
    let fileContent = '';
    
    for (const separator of separators) {
      const separatorIndex = content.indexOf(separator);
      if (separatorIndex !== -1) {
        manualContent = content.substring(0, separatorIndex).trim();
        fileContent = content.substring(separatorIndex).trim();
        break;
      }
    }
    
    return { manualContent, fileContent };
  };

  // פונקציה חדשה לניקוי תוכן מסמנים אוטומטיים - משמרת את התוכן
  const removeAllSeparators = (content: string) => {
    const separators = ['--- תוכן הסילבוס ---', '--- תוכן המאמר ---', '--- תוכן קובץ נוסף ---'];
    let cleanedContent = content;
    
    // מסיר את הסמנים עצמם אבל משאיר את התוכן שאחריהם
    separators.forEach(separator => {
      cleanedContent = cleanedContent.replace(new RegExp(separator + '\\s*', 'g'), '');
    });
    
    // נקה שורות ריקות מיותרות אבל שמור מבנה בסיסי
    cleanedContent = cleanedContent
      .replace(/\n{3,}/g, '\n\n') // מקסימום 2 שורות ריקות רצופות
      .trim();
    
    return cleanedContent;
  };

  const handleClearManualText = () => {
    const currentContent = watch('courseContent') || '';
    const { fileContent } = separateContent(currentContent);
    setValue('courseContent', fileContent, { shouldValidate: true });
    setFileError(null);
    setFileSuccess(null);
  };

  const handleClearAllFiles = () => {
    const currentContent = watch('courseContent') || '';
    const { manualContent } = separateContent(currentContent);
    setValue('courseContent', manualContent, { shouldValidate: true });
    setUploadedFiles([]);
    setFileError(null);
    setFileSuccess(null);
  };
  const handleRemoveSeparators = () => {
    const currentContent = watch('courseContent') || '';
    const cleanedContent = removeAllSeparators(currentContent);
    setValue('courseContent', cleanedContent, { shouldValidate: true });
    
    // הודעה מפורטת למשתמש
    const lengthBefore = currentContent.length;
    const lengthAfter = cleanedContent.length;
    const removedChars = lengthBefore - lengthAfter;
    
    toast.showSuccess(
      'הסמנים הוסרו בהצלחה', 
      `הוסרו ${removedChars} תווים של סמנים. התוכן של הקבצים נשמר במלואו (${lengthAfter} תווים נותרו)`
    );
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    // עדכון תוכן הטקסט
    const currentContent = watch('courseContent') || '';
    const { manualContent } = separateContent(currentContent);
    
    const newFileContent = updatedFiles.map(f => {
      const separator = f.type === 'syllabus' ? '--- תוכן הסילבוס ---' : 
                       f.type === 'article' ? '--- תוכן המאמר ---' : 
                       '--- תוכן קובץ נוסף ---';
      return `${separator}\n${f.content}`;
    }).join('\n\n');
    
    const combinedContent = manualContent + (newFileContent ? `\n\n${newFileContent}` : '');
    setValue('courseContent', combinedContent, { shouldValidate: true });
  };

  const handleCleanGibberish = () => {
    const currentContent = watch('courseContent') || '';
    if (currentContent) {
      // Check if text is heavily garbled and choose appropriate cleaning level
      const cleanedContent = isTextGarbled(currentContent) 
        ? aggressiveClean(currentContent)
        : quickClean(currentContent);
      
      setValue('courseContent', cleanedContent, { shouldValidate: true });
      
      toast.showSuccess(
        'ניקוי הטקסט הושלם', 
        'תווים לא קריאים הוסרו מהטקסט בהצלחה'
      );
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
  const watchedData = watch(); // צפייה בכל הנתונים לשמירה אוטומטית

  // שחזור נתונים בטעינת העמוד - רק פעם אחת
  const [hasLoaded, setHasLoaded] = useState<CourseParameterState['hasLoaded']>(false);
  
  useEffect(() => {
    if (hasLoaded) return; // מונע טעינה חוזרת
    
    const savedData = loadFromLocalStorage();
    if (savedData) {
      // שחזור נתוני הטופס באופן זהיר
      if (savedData.formData) {
        Object.entries(savedData.formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            setValue(key as keyof CourseParameterSchema, value, { shouldValidate: false, shouldDirty: false });
          }
        });
      }
      
      // הודעה למשתמש על שחזור הנתונים (רק אם יש תוכן משמעותי)
      const hasSignificantContent = savedData.formData.courseContent || 
                                   savedData.formData.courseName || 
                                   savedData.uploadedFiles?.length > 0;
      
      if (hasSignificantContent) {
        toast.showInfo(TOAST_MESSAGES.DATA_RESTORED.title, TOAST_MESSAGES.DATA_RESTORED.message);
        setLastSaved(new Date(savedData.timestamp));
      }
    }
    
    setHasLoaded(true);
  }, [setValue, loadFromLocalStorage, toast, hasLoaded]);

  // שמירה אוטומטית עם debounce - לא מפריעה להקלדה
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // שמירה רק אם יש תוכן משמעותי ואין משתמש פעיל
      const hasContent = watchedData.courseName || 
                        watchedData.courseContent || 
                        watchedData.faculty ||
                        uploadedFiles.length > 0;
      
      if (hasContent && !isSubmitting && autoSaveStatus !== 'saving') {
        setAutoSaveStatus('saving');
        try {
          saveToLocalStorage(watchedData);
        } catch (error) {
          console.error('Auto-save error:', error);
          setAutoSaveStatus('error');
        }
      }
    }, 3000); // השהיה של 3 שניות לאחר שינוי

    return () => clearTimeout(timeoutId);
  }, [watchedData, saveToLocalStorage, isSubmitting, uploadedFiles.length, autoSaveStatus]);

  // פורמט זמן אחרון שנשמר
  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'זה עתה';
    if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    
    return date.toLocaleDateString('he-IL');
  };



  const determineFileType = (fileName: string): 'syllabus' | 'article' | 'other' => {
    const name = fileName.toLowerCase();
    if (name.includes('syllabus') || name.includes('סילבוס')) return 'syllabus';
    if (name.includes('article') || name.includes('מאמר')) return 'article';
    return 'other';
  };

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setFileError(null);
    setFileSuccess(null);
    
    const filePromises = files.map(async (file): Promise<UploadedFile> => {
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`הקובץ "${file.name}" חורג מהמגבלה של 20MB`);
        }
        
        try {
            const textContent = await parseFileContent(file);
            const cleanedText = cleanFileText(textContent);

            if (cleanedText.length < 10) {
                throw new Error(`הקובץ "${file.name}" לא מכיל טקסט קריא`);
            }

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                file,
                type: determineFileType(file.name),
                content: cleanedText
            };
        } catch (error) {
            console.error(`Error parsing file ${file.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
            throw new Error(`שגיאה בפענוח הקובץ "${file.name}": ${errorMessage}`);
        }
    });
    
    Promise.allSettled(filePromises).then(results => {
      const successful: UploadedFile[] = [];
      const errors: string[] = [];
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          errors.push(result.reason.message);
        }
      });
      
      if (successful.length > 0) {
        const newFiles = [...uploadedFiles, ...successful];
        setUploadedFiles(newFiles);
        
        const currentContent = watch('courseContent') || '';
        const { manualContent } = separateContent(currentContent);
        
        const newFileContent = successful.map(f => {
          const separator = f.type === 'syllabus' ? '--- תוכן הסילבוס ---' : 
                           f.type === 'article' ? '--- תוכן המאמר ---' : 
                           '--- תוכן קובץ נוסף ---';
          return `${separator}\n${f.content}`;
        }).join('\n\n');
        
        const combinedContent = manualContent + (manualContent ? '\n\n' : '') + newFileContent;
        setValue('courseContent', combinedContent, { shouldValidate: true });
        
        toast.showSuccess(
          `נטענו בהצלחה ${successful.length} קבצים`,
          `הקבצים זמינים לעריכה בתיבת הטקסט`
        );
      }
      
      if (errors.length > 0) {
        toast.showError('שגיאה בהעלאת קבצים', errors.join(', '));
      }
    });
  }, [setValue, watch, uploadedFiles, toast]);

  const onSubmit = (data: CourseParameterSchema) => {
    // אם אין תוכן קורס, נתן הודעה אך נמשיך בתהליך
    if (!data.courseContent || data.courseContent.trim() === '') {
        toast.showWarning(
          'הערה חשובה',
          'לא הועלה תוכן קורס. ההמלצות יהיו כלליות יותר. מומלץ להעלות תוכן לקבלת המלצות מותאמות יותר.'
        );
        // נמשיך בכל מקרה
        data.courseContent = 'לא הועלה תוכן קורס ספציפי - המערכת תציע המלצות כלליות על בסיס הפרמטרים שהוזנו.';
    }
    setFileError(null);
    
    // הודעת הצלחה
    toast.showSuccess(
      TOAST_MESSAGES.FORM_SUBMIT_SUCCESS.title,
      TOAST_MESSAGES.FORM_SUBMIT_SUCCESS.message
    );
    
    // ניקוי שמירה אוטומטית לאחר שליחה מוצלחת
    clearAutoSave();
    
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

  const { courseDetails, updateCourseParameter, removeFile } = useAssessmentBuilder();
  const [fileContents, setFileContents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState<GeneratedAssessment | null>(null);

  const handleFilesDrop = async (files: File[]) => {
      const allFiles = [...(courseDetails.files || []), ...files];
      updateCourseParameter('files', allFiles);

      const contents = await Promise.all(
          allFiles.map(file => parseFileContent(file))
      );
      setFileContents(contents);
  };

  const handleGenerateClick = async () => {
      setIsGenerating(true);
      try {
          const assessment = await generateAssessment(courseDetails, fileContents);
          setGeneratedAssessment(assessment);
      } catch (error) {
          console.error("Error generating assessment:", error);
          // Optionally, show an error message to the user
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${styles.container} ${className || ''}`} noValidate>
      {/* Auto-save status */}
      <div className={styles.autoSaveContainer}>
        <div className={styles.autoSaveStatus}>
          {autoSaveStatus === 'saving' && (
            <div className={styles.autoSaveIndicator}>
              <Save size={14} className={styles.savingIcon} />
              <span>שומר...</span>
            </div>
          )}
          {autoSaveStatus === 'saved' && (
            <div className={styles.autoSaveIndicator}>
              <CheckCircle size={14} className={styles.savedIcon} />
              <span>נשמר אוטומטית</span>
            </div>
          )}
          {autoSaveStatus === 'error' && (
            <div className={styles.autoSaveIndicator}>
              <X size={14} className={styles.errorIcon} />
              <span>שגיאה בשמירה</span>
            </div>
          )}
          {lastSaved && autoSaveStatus === 'idle' && (
            <div className={styles.lastSavedInfo}>
              <span>נשמר לאחרונה: {formatLastSaved(lastSaved)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAutoSave}
                className={styles.clearSaveButton}
                title="נקה נתונים שמורים"
              >
                <X size={12} />
              </Button>
            </div>
          )}
          {autoSaveStatus === 'idle' && !lastSaved && (
            <div className={styles.debugActions}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearAutoSave();
                  window.location.reload();
                }}
                className={styles.clearSaveButton}
                title="נקה הכל ורענן דף"
              >
                🔄 רענן טופס
              </Button>
            </div>
          )}
        </div>
      </div>

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
                  autoComplete="off"
                  autoFocus={false}
                  readOnly={false}
                  tabIndex={0}
                  style={{ pointerEvents: 'auto' }}
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
          ניתן להעלות מספר קבצים (סילבוס, מאמרים, חומרי עזר) בפורמט TXT, PDF, DOC, DOCX ואז לכתוב הוראות ספציפיות נוספות בתיבת הטקסט. 
          <br /><strong>טיפ:</strong> אם תכתבו הוראות ספציפיות כמו "המטלה תתרכז בנושא X", ה-AI יתמקד בדיוק בנושא הזה.
          <br /><strong>הערה:</strong> אם קובץ PDF/DOC לא נקרא כראוי, המערכת תבקש להעתיק את התוכן ידנית.
        </p>
        
        {/* קבצים שהועלו */}
        {uploadedFiles.length > 0 && (
          <div className={styles.uploadedFiles}>
            <h4 className={styles.uploadedFilesTitle}>קבצים שהועלו:</h4>
            <div className={styles.fileList}>
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <File size={16} />
                    <span className={styles.fileName}>{uploadedFile.file.name}</span>
                    <span className={styles.fileType}>
                      {uploadedFile.type === 'syllabus' ? 'סילבוס' : 
                       uploadedFile.type === 'article' ? 'מאמר' : 'חומר נוסף'}
                    </span>
                    <span className={styles.fileSize}>
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(uploadedFile.id)}
                    className={styles.removeFileButton}
                    title="הסר קובץ"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* הודעת אזהרה לטקסט מקולקל */}
        {isTextGarbled(watch('courseContent') || '') && (
          <div className={styles.garbageWarning}>
            <div className={styles.warningIcon}>⚠️</div>
            <div className={styles.warningContent}>
              <strong>זוהה טקסט מקולקל!</strong>
              <p>
                הטקסט מכיל תווים לא קריאים מקובץ PDF/DOC. 
                לחץ על כפתור "🧹 ניקוי מתקדם" בתיבת הטקסט לניקוי אוטומטי.
              </p>
            </div>
          </div>
        )}

        {/* כפתור חירום אם יש בעיה עם העריכה */}
        {watch('courseContent') && watch('courseContent')!.length > 0 && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearAutoSave();
                localStorage.clear();
                window.location.reload();
              }}
              style={{ marginLeft: '8px' }}
              title="אם התיבה לא עובדת - לחץ כאן"
            >
              🆘 אם לא ניתן לערוך - לחץ כאן
            </Button>
          </div>
        )}

        <div className={styles.contentInput}>
          <div className={styles.dropzoneContainer}>
            <FileDropzone
              onFilesSelected={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              maxSize={20 * 1024 * 1024} // 20MB
              title={uploadedFiles.length > 0 ? `נטענו ${uploadedFiles.length} קבצים` : "גרור קבצים לכאן או לחץ לבחירה"}
              subtitle="סוגי קבצים: TXT, PDF, DOC, DOCX. גודל מקסימלי: 20MB"
              icon={<Upload size={36} />}
            />
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFiles}
                  title="הסר את כל הקבצים"
                >
                  <X size={14} />
                  הסר את כל הקבצים
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
                    placeholder={uploadedFiles.length > 0 ? 
                      "תוכן הקבצים נטען. ניתן לערוך ולהוסיף פרטים נוספים כמו: המטלה תתרכז בהיסטוריה של הסכסוך הערבי-ישראלי במאה ה-20..." : 
                      "הדבק כאן את תכני הקורס, ראשי פרקים, או תיאור כללי. לדוגמה: המטלה תתרכז בהיסטוריה של הסכסוך הערבי-ישראלי במאה ה-20..."
                    }
                    className={styles.textarea}
                    rows={8}
                    disabled={false}
                    readOnly={false}
                    style={{ pointerEvents: 'auto', userSelect: 'auto' }}
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
                  {isTextGarbled(watch('courseContent') || '') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentContent = watch('courseContent') || '';
                        const cleanedContent = aggressiveClean(currentContent);
                        setValue('courseContent', cleanedContent, { shouldValidate: true });
                        toast.showWarning(
                          'ניקוי מתקדם הושלם', 
                          'טקסט מקולקל נוקה באופן אגרסיבי'
                        );
                      }}
                      className={styles.aggressiveCleanButton}
                      title="ניקוי אגרסיבי לטקסט מקולקל"
                    >
                      🧹 ניקוי מתקדם
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSeparators}
                    className={styles.cleanButton}
                    title="הסר סמני קבצים"
                  >
                    🗑️ הסר סמנים
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
        {/* הצגת שדות חסרים */}
        {Object.keys(errors).length > 0 && (
          <div className={styles.missingFieldsAlert}>
            <div className={styles.alertHeader}>⚠️ יש למלא את השדות הבאים:</div>
            <ul className={styles.missingFieldsList}>
              {errors.courseName && <li>שם הקורס</li>}
              {errors.faculty && <li>פקולטה</li>}
              {errors.department && <li>מחלקה</li>}
              {errors.courseContent && <li>תכני הקורס</li>}
              {errors.courseType && <li>סוג הקורס</li>}
              {errors.teachingMethod && <li>שיטת ההוראה</li>}
              {errors.classSize && <li>גודל הכיתה</li>}
            </ul>
          </div>
        )}
        
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'מעבד...' : 'הצע לי חלופות הערכה'}
        </Button>
      </div>
    </form>
  );
};