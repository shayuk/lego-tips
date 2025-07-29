import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { AlertTriangle, Download, Printer, RefreshCw, Save, Archive, FileText } from 'lucide-react';
import { Button } from '../../../components/Button'; // נתיב מתוקן
import { exportToWord, saveToPersonalLibrary, saveToSharedArchive, ExportOptions } from '../../../helpers/documentExport'; // נתיב מתוקן
import styles from '../../../components/AssessmentGenerator.module.css';

// הגדרת ה-props שהרכיב יקבל
interface GeneratedAssessmentDisplayProps {
  /** מחרוזת ה-HTML המלאה שנוצרה על ידי ה-AI */
  htmlContent: string;
  /** שם המודל ששימש ליצירת המטלה (למשל, "Claude 3 Sonnet") */
  modelUsed: string;
  /** תאריך ושעה של יצירת המטלה */
  createdAt?: Date;
  /** פונקציה לנסות שוב ליצור את המטלה */
  onRetry?: () => void;
  /** קלאס CSS אופציונלי לעיצוב נוסף */
  className?: string;
  /** פרטי הקורס (אופציונלי) */
  courseDetails?: {
    courseName?: string;
    faculty?: string;
    department?: string;
  };
}

/**
 * רכיב ייעודי להצגת מטלה שנוצרה על ידי AI כמחרוזת HTML.
 * הוא מציג את התוכן בצורה בטוחה ומעוצבת.
 */
export const GeneratedAssessmentDisplay: React.FC<GeneratedAssessmentDisplayProps> = ({
  htmlContent,
  modelUsed,
  createdAt,
  onRetry,
  className,
  courseDetails,
}) => {
  console.log(`🎨 [GeneratedAssessmentDisplay] Rendering with content length: ${htmlContent?.length || 0}`);

  // --- אבטחה: שלב קריטי! ---
  // לפני שמשתמשים ב-dangerouslySetInnerHTML, חובה "לחטא" את ה-HTML
  // כדי למנוע התקפות XSS. DOMPurify היא הספריה המובילה לכך.
  const cleanHtml = DOMPurify.sanitize(htmlContent);
  console.log(`🔒 [Security] HTML sanitized successfully`);

  // הכן את תאריך היצירה - אם לא הועבר, השתמש בזמן הנוכחי
  const displayDate = createdAt || new Date();

  // מצב לטיפול בכפתורי השמירה
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingShared, setIsSavingShared] = useState(false);

  // יצירת אובייקט אפשרויות לייצוא
  const exportOptions: ExportOptions = {
    title: courseDetails?.courseName || 'מטלה מותאמת',
    htmlContent: cleanHtml,
    modelUsed,
    createdAt: displayDate,
    courseName: courseDetails?.courseName,
    faculty: courseDetails?.faculty,
    department: courseDetails?.department,
  };

  // פונקציית עזר להדפסה
  const handlePrint = () => {
    console.log('🖨️ Print action triggered');
    window.print();
  };

  // פונקציית ייצוא ל-Word
  const handleExportToWord = async () => {
    try {
      setIsExporting(true);
      console.log('📄 Exporting to Word...');
      await exportToWord(exportOptions);
      console.log('✅ Word export completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Word export failed:', errorMessage);
      alert(`שגיאה ביצוא לקובץ Word: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  // פונקציית שמירה אישית
  const handleSavePersonal = async () => {
    try {
      setIsSavingPersonal(true);
      console.log('💾 Saving to personal library...');
      await saveToPersonalLibrary(exportOptions);
      alert('המטלה נשמרה בספרייה האישית שלך!');
      console.log('✅ Personal save completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Personal save failed:', errorMessage);
      alert(`שגיאה בשמירה אישית: ${errorMessage}`);
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // פונקציית שמירה לארכיון משותף
  const handleSaveShared = async () => {
    try {
      setIsSavingShared(true);
      console.log('📚 Saving to shared archive...');
      await saveToSharedArchive(exportOptions);
      alert('המטלה תשמר בארכיון המשותף (תכונה בפיתוח)');
      console.log('✅ Shared save completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Shared save failed:', errorMessage);
      alert(`שגיאה בשמירה לארכיון משותף: ${errorMessage}`);
    } finally {
      setIsSavingShared(false);
    }
  };

  // אם אין תוכן להציג, נציג הודעה מתאימה
  if (!cleanHtml || cleanHtml.trim() === '') {
    console.log('⚠️ No HTML content to display');
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <AlertTriangle className={styles.errorIcon} size={48} />
            <h2 className={styles.errorTitle}>לא נוצר תוכן</h2>
            <p className={styles.errorMessage}>
              המחולל לא הצליח ליצור מטלה. נסה שוב או שנה את הפרמטרים.
            </p>
            {onRetry && (
              <div className={styles.errorActions}>
                <Button onClick={onRetry} variant="secondary">
                  <RefreshCw size={16} />
                  <span>נסה שוב</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log(`✅ [GeneratedAssessmentDisplay] Displaying content generated by: ${modelUsed}`);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* כותרת וכפתורי פעולה */}
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>המטלה שלך מוכנה!</h1>
        <div className={styles.actions}>
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={16} />
            <span>הדפסה</span>
          </Button>
          <Button variant="outline" onClick={handleExportToWord} disabled={isExporting}>
            <FileText size={16} />
            <span>{isExporting ? 'יוצר קובץ...' : 'ייצא ל-Word'}</span>
          </Button>
          <Button variant="outline" onClick={handleSavePersonal} disabled={isSavingPersonal}>
            <Save size={16} />
            <span>{isSavingPersonal ? 'שומר...' : "שמור ב'ההערכות שלי'"}</span>
          </Button>
          <Button variant="outline" onClick={handleSaveShared} disabled={isSavingShared}>
            <Archive size={16} />
            <span>{isSavingShared ? 'שומר...' : 'הוסף למאגר הציבורי'}</span>
          </Button>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw size={16} />
              <span>צור מחדש</span>
            </Button>
          )}
        </div>
      </div>

      {/* 
        החלק המרכזי: הצגת ה-HTML הנקי.
        ✅ שימוש בטוח ב-dangerouslySetInnerHTML עם DOMPurify
        ה-div החיצוני עם הקלאס 'content' מבטיח שהעיצוב יחול על התוכן
      */}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />

      {/* כותרת תחתונה המציגה את מקור המידע */}
      <footer style={{
        textAlign: 'center',
        marginTop: 'var(--spacing-8, 2rem)',
        paddingTop: 'var(--spacing-4, 1rem)',
        borderTop: '1px solid var(--border, #e5e5e5)',
        fontSize: '0.9rem',
        color: 'var(--muted-foreground, #666)'
      }}>
        <p>נוצר באמצעות: <strong>{modelUsed}</strong></p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          נוצר ב-{displayDate.toLocaleDateString('he-IL')} בשעה {displayDate.toLocaleTimeString('he-IL')}
        </p>
      </footer>
    </div>
  );
}; 