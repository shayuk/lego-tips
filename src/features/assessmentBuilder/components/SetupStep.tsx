import React, { memo } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/Select';
import { FileDropzone } from '../../../components/FileDropzone';

// 📝 Types for setup step
interface CourseDetails {
  courseName: string;
  faculty: string;
  department: string;
  courseType: string;
  studentCount: string;
  focusAreas: string;
  uploadedFiles: File[];
  customFaculty: string;
  customDepartment: string;
  customCourseType: string;
  customStudentCount: string;
}

interface SetupStepProps {
  courseDetails: CourseDetails;
  handleInputChange: (field: string, value: string) => void;
  handleFileUpload: (files: File[]) => void;
  handleRemoveFile: (fileName: string) => void;
  handleProceedToRecommendations: () => void;
  styles: any;
}

// 🎯 Setup Step Component עם React.memo
const SetupStepComponent: React.FC<SetupStepProps> = ({
  courseDetails,
  handleInputChange,
  handleFileUpload,
  handleRemoveFile,
  handleProceedToRecommendations,
  styles
}) => {
  // 📊 Performance tracking with detailed info
  const renderTime = new Date().toLocaleTimeString();
  console.log(`🔄 [React.memo] SetupStep rendered at ${renderTime}`);
  console.log('📝 [Props] Course name:', courseDetails.courseName);
  console.log('📁 [Props] Files count:', courseDetails.uploadedFiles.length);
  console.log('⚡ [Performance] React.memo is working - this should only render when props actually change!');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎯 בונה הערכות מתקדם</h1>
        <p className={styles.description}>
          הזן את פרטי הקורס שלך כדי לקבל טיפים פדגוגיים מותאמים אישית עם אחוזי התאמה מדויקים
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.form}>
          {/* Course Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>שם הקורס *</label>
            <Input
              placeholder="לדוגמה: מבוא לפסיכולוגיה"
              value={courseDetails.courseName}
              onChange={(e) => handleInputChange('courseName', e.target.value)}
            />
          </div>

          {/* Faculty */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>פקולטה *</label>
            <Select 
              value={courseDetails.faculty} 
              onValueChange={(value) => handleInputChange('faculty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר פקולטה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="humanities">מדעי הרוח</SelectItem>
                <SelectItem value="social_sciences">מדעי החברה</SelectItem>
                <SelectItem value="natural_sciences">מדעי הטבע</SelectItem>
                <SelectItem value="engineering">הנדסה</SelectItem>
                <SelectItem value="medicine">רפואה</SelectItem>
                <SelectItem value="law">משפטים</SelectItem>
                <SelectItem value="business">עסקים</SelectItem>
                <SelectItem value="education">חינוך</SelectItem>
                <SelectItem value="arts">אמנויות</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            {courseDetails.faculty === 'other' && (
              <Input
                placeholder="פרט את הפקולטה"
                value={courseDetails.customFaculty}
                onChange={(e) => handleInputChange('customFaculty', e.target.value)}
                style={{ marginTop: 'var(--spacing-2)' }}
              />
            )}
          </div>

          {/* Department */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>מחלקה *</label>
            <Select 
              value={courseDetails.department} 
              onValueChange={(value) => handleInputChange('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מחלקה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="psychology">פסיכולוגיה</SelectItem>
                <SelectItem value="sociology">סוציולוגיה</SelectItem>
                <SelectItem value="education">חינוך</SelectItem>
                <SelectItem value="communication">תקשורת</SelectItem>
                <SelectItem value="history">היסטוריה</SelectItem>
                <SelectItem value="literature">ספרות</SelectItem>
                <SelectItem value="philosophy">פילוסופיה</SelectItem>
                <SelectItem value="political_science">מדעי המדינה</SelectItem>
                <SelectItem value="economics">כלכלה</SelectItem>
                <SelectItem value="management">ניהול</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            {courseDetails.department === 'other' && (
              <Input
                placeholder="פרט את המחלקה"
                value={courseDetails.customDepartment}
                onChange={(e) => handleInputChange('customDepartment', e.target.value)}
                style={{ marginTop: 'var(--spacing-2)' }}
              />
            )}
          </div>

          {/* Course Type */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>סוג קורס</label>
            <Select 
              value={courseDetails.courseType} 
              onValueChange={(value) => handleInputChange('courseType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג קורס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="introduction">קורס מבוא</SelectItem>
                <SelectItem value="intermediate">קורס בינוני</SelectItem>
                <SelectItem value="advanced">קורס מתקדם</SelectItem>
                <SelectItem value="seminar">סמינר</SelectItem>
                <SelectItem value="workshop">סדנה</SelectItem>
                <SelectItem value="research">קורס מחקר</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            {courseDetails.courseType === 'other' && (
              <Input
                placeholder="פרט את סוג הקורס"
                value={courseDetails.customCourseType}
                onChange={(e) => handleInputChange('customCourseType', e.target.value)}
                style={{ marginTop: 'var(--spacing-2)' }}
              />
            )}
          </div>

          {/* Student Count */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>מספר סטודנטים</label>
            <Select 
              value={courseDetails.studentCount} 
              onValueChange={(value) => handleInputChange('studentCount', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר טווח סטודנטים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">קטן (עד 30)</SelectItem>
                <SelectItem value="medium">בינוני (30-70)</SelectItem>
                <SelectItem value="large">גדול (70-150)</SelectItem>
                <SelectItem value="very_large">רב משתתפים (150+)</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            {courseDetails.studentCount === 'other' && (
              <Input
                placeholder="פרט את מספר הסטודנטים"
                value={courseDetails.customStudentCount}
                onChange={(e) => handleInputChange('customStudentCount', e.target.value)}
                style={{ marginTop: 'var(--spacing-2)' }}
              />
            )}
          </div>

          {/* Focus Areas */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>תחומי התמקדות</label>
            <Textarea
              placeholder="תאר את הנושאים המרכזיים שהקורס עוסק בהם..."
              value={courseDetails.focusAreas}
              onChange={(e) => handleInputChange('focusAreas', e.target.value)}
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>העלה קבצים (אופציונלי)</label>
            <FileDropzone
              onFilesSelected={handleFileUpload}
              maxFiles={5}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              title="גרור קבצים לכאן או לחץ לבחירה"
              subtitle="PDF, Word, PowerPoint, או קבצי טקסט"
            />
            
            {courseDetails.uploadedFiles.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-4)' }}>
                <div style={{ 
                  padding: 'var(--spacing-3)',
                  backgroundColor: '#e8f5e8',
                  borderRadius: 'var(--radius)',
                  marginBottom: 'var(--spacing-3)',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#15803d', fontWeight: '600' }}>
                    ✅ קבצים שהועלו בהצלחה
                  </span>
                </div>
                
                {courseDetails.uploadedFiles.map((file) => (
                  <div key={file.name} style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <span style={{ fontWeight: '500' }}>{file.name}</span>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(file.name)}
                    >
                      הסר
                    </Button>
                  </div>
                ))}
                
                <div style={{ 
                  padding: 'var(--spacing-3)',
                  backgroundColor: '#e0f2fe',
                  borderRadius: 'var(--radius)',
                  marginTop: 'var(--spacing-3)'
                }}>
                  <span style={{ color: '#0369a1', fontSize: '0.9rem' }}>
                    💡 הבינה המלאכותית תנתח את הקבצים ותתאים את המטלה בהתאם לתוכן
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <Button 
              size="lg" 
              onClick={handleProceedToRecommendations}
              disabled={!courseDetails.courseName.trim()}
            >
              המשך לשלב הבא ← קבלת המלצות
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚀 מוצא עם React.memo למניעת re-renders מיותרים
export const SetupStep = memo(SetupStepComponent);

// 📊 Performance debugging - רק בפיתוח
if (process.env.NODE_ENV === 'development') {
  SetupStepComponent.displayName = 'SetupStep (Memoized)';
} 