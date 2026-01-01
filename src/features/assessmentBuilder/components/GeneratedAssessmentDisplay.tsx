import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { AlertTriangle, Download, Printer, RefreshCw, Save, Archive, FileText } from 'lucide-react';
import { Button } from '../../../components/Button'; // נתיב מתוקן
import { exportToWord, saveToPersonalLibrary, saveToSharedArchive, ExportOptions } from '../../../helpers/documentExport'; // נתיב מתוקן
import styles from '../../../components/AssessmentGenerator.module.css';

import { ScholarlySource, MaterialQualityReport } from '../../../helpers/secureApiClient';

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
  /** מצב הבסיס (uploaded/web/hybrid) */
  groundingMode?: "uploaded" | "web" | "hybrid";
  /** מקורות אקדמיים ששימשו */
  sourcesUsed?: ScholarlySource[];
  /** הפניות APA7 */
  apa7References?: string[];
  /** דוח איכות חומרים */
  materialQualityReport?: MaterialQualityReport;
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
  groundingMode,
  sourcesUsed = [],
  apa7References = [],
  materialQualityReport,
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
  const [exportError, setExportError] = useState<string | null>(null);

  // יצירת אובייקט אפשרויות לייצוא
  const exportOptions: ExportOptions = {
    title: courseDetails?.courseName || 'מטלה מותאמת',
    htmlContent: cleanHtml,
    modelUsed,
    createdAt: displayDate,
    courseName: courseDetails?.courseName,
    faculty: courseDetails?.faculty,
    department: courseDetails?.department,
    apa7References,
    groundingMode,
  };

  // פונקציית עזר להדפסה
  const handlePrint = () => {
    console.log('🖨️ Print action triggered');
    window.print();
  };

  // פונקציית ייצוא ל-Word
  const handleExportToWord = async (retryCount = 0) => {
    try {
      setIsExporting(true);
      setExportError(null);
      console.log(`📄 Exporting to Word... (attempt ${retryCount + 1})`);
      await exportToWord(exportOptions);
      console.log('✅ Word export completed');
      setExportError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Word export failed:', errorMessage);
      
      // Log detailed error info for debugging
      const errorDetails = {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        retryCount,
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
      };
      console.error('📋 Export error details:', errorDetails);
      
      setExportError(errorMessage);
      
      // Show user-friendly error with options
      const shouldRetry = retryCount < 2 && 
        (errorMessage.includes('constructor') || 
         errorMessage.includes('undefined') ||
         errorMessage.includes('XMLBuilder'));
      
      if (shouldRetry) {
        const retry = window.confirm(
          `שגיאה ביצוא Word (ניסיון ${retryCount + 1}/3).\n\n` +
          `האם לנסות שוב עם שיטת גיבוי?\n\n` +
          `פרטים: ${errorMessage.substring(0, 100)}...`
        );
        if (retry) {
          // Retry will use fallback method automatically
          setTimeout(() => handleExportToWord(retryCount + 1), 500);
          return;
        }
      } else {
        const usePDF = window.confirm(
          `לא ניתן לייצא ל-Word כרגע.\n\n` +
          `השגיאה: ${errorMessage}\n\n` +
          `האם לנסות לייצא ל-PDF במקום?`
        );
        if (usePDF) {
          handleExportToPDF();
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  // פונקציית ייצוא ל-PDF (fallback)
  const handleExportToPDF = () => {
    try {
      console.log('📄 Exporting to PDF (fallback)...');
      window.print();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ PDF export failed:', errorMessage);
      alert(`שגיאה ביצוא ל-PDF: ${errorMessage}`);
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
          <div style={{ position: 'relative' }}>
            <Button variant="outline" onClick={() => handleExportToWord(0)} disabled={isExporting}>
              <FileText size={16} />
              <span>{isExporting ? 'יוצר קובץ...' : 'ייצא ל-Word'}</span>
            </Button>
            {exportError && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                maxWidth: '300px',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>שגיאת יצוא</p>
                <p style={{ margin: '0 0 8px 0' }}>{exportError.substring(0, 150)}...</p>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <Button variant="outline" size="sm" onClick={() => { setExportError(null); handleExportToWord(0); }}>
                    נסה שוב
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setExportError(null); handleExportToPDF(); }}>
                    ייצא PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setExportError(null)}>
                    סגור
                  </Button>
                </div>
              </div>
            )}
          </div>
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

      {/* הצגת מקורות ואיכות חומרים */}
      {(groundingMode || sourcesUsed.length > 0 || materialQualityReport) && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e5e5e5'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
            מידע על המקורות
          </h3>
          
          {groundingMode && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>מצב בסיס:</strong>{' '}
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: groundingMode === 'uploaded' ? '#e8f5e9' : groundingMode === 'web' ? '#fff3e0' : '#e3f2fd',
                color: groundingMode === 'uploaded' ? '#2e7d32' : groundingMode === 'web' ? '#e65100' : '#1976d2'
              }}>
                {groundingMode === 'uploaded' ? 'חומר שהועלה' : groundingMode === 'web' ? 'חיפוש באינטרנט' : 'היברידי'}
              </span>
              {materialQualityReport && (
                <span style={{ marginRight: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  ({materialQualityReport.reasons.join('; ')})
                </span>
              )}
            </div>
          )}

          {sourcesUsed.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>מקורות ששימשו ({sourcesUsed.length}):</strong>
              <ul style={{ marginTop: '0.5rem', paddingRight: '1.5rem' }}>
                {sourcesUsed.map((source, idx) => (
                  <li key={source.id || idx} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    {source.authors.slice(0, 2).join(', ')}
                    {source.year && ` (${source.year})`}
                    {'. '}
                    <strong>{source.title}</strong>
                    {source.venue && `. ${source.venue}`}
                    {source.doi && (
                      <span style={{ marginRight: '0.5rem' }}>
                        {' '}
                        <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                          DOI
                        </a>
                      </span>
                    )}
                    {source.url && !source.doi && (
                      <span style={{ marginRight: '0.5rem' }}>
                        {' '}
                        <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                          קישור
                        </a>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {apa7References.length > 0 && (
            <div>
              <strong>הפניות (APA 7):</strong>
              <ol style={{ marginTop: '0.5rem', paddingRight: '1.5rem', fontSize: '0.9rem' }}>
                {apa7References.map((ref, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem', textAlign: 'right' }}>
                    {ref}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

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