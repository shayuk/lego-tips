import { useRef, useState } from 'react';
import { Copy, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { AssessmentMethod, CourseParameters } from '../helpers/assessmentTypes';
import { Button } from './Button';
import { useAssessmentGenerator } from '../helpers/useAssessmentGenerator';
import styles from './AssessmentGenerator.module.css';

interface AssessmentGeneratorProps {
  selectedMethods: AssessmentMethod[];
  courseParams: CourseParameters;
  courseName?: string;
  faculty?: string;
  department?: string;
  courseContent?: string;
  className?: string;
}

export const AssessmentGenerator = ({
  selectedMethods,
  courseParams,
  courseName,
  faculty,
  department,
  courseContent,
  className,
}: AssessmentGeneratorProps) => {
  const [shouldStartGeneration, setShouldStartGeneration] = useState(false);
  
  const { generatedAssessment, generatedRubric, rubricHtml, modelUsed, loadingState, error } = useAssessmentGenerator({
    selectedMethods,
    courseParams,
    courseName,
    faculty,
    department,
    courseContent,
    shouldGenerate: shouldStartGeneration,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleStartGeneration = () => {
    console.log('🚀 לוחץ על צור מטלה');
    setShouldStartGeneration(true);
    console.log('🚀 shouldStartGeneration הוגדר לtrue');
  };

  const handleRetry = () => {
    console.log('🔄 מנסה שוב - מאפס מצב');
    // איפוס רק המצב של הגנרציה, לא כל הטופס
    setShouldStartGeneration(false);
    setTimeout(() => {
      console.log('🔄 מפעיל מחדש את הגנרציה');
      setShouldStartGeneration(true);
    }, 100);
  };

  // Clean HTML content from unwanted tags and formatting
  const cleanHtmlContent = (html: string): string => {
    if (!html) return html;
    
    // Remove leading/trailing whitespace and unwanted characters
    let cleaned = html.trim();
    
    // Remove leading ``` or ```html
    cleaned = cleaned.replace(/^```(html)?/i, '');
    
    // Remove trailing ```
    cleaned = cleaned.replace(/```$/i, '');
    
    // Remove any leading/trailing quotes
    cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '');
    
    return cleaned.trim();
  };

  // Copy all content (HTML or fallback view)
  const handleCopyAll = () => {
    if (contentRef.current) {
      // Copy as HTML if rubricHtml exists, otherwise as plain text
      if (rubricHtml) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentRef.current.innerHTML;
        document.body.appendChild(tempDiv);
        const range = document.createRange();
        range.selectNode(tempDiv);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        document.body.removeChild(tempDiv);
      } else {
        // Fallback: copy text content
        const text = contentRef.current.innerText;
        navigator.clipboard.writeText(text);
      }
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds} שניות`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes} דקות`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} דקות`;
  };

  if (selectedMethods.length === 0) {
    return (
      <div className={`${styles.container} ${styles.placeholder} ${className || ''}`}>
        <p>בחר/י שיטות הערכה כדי ליצור מטלה.</p>
      </div>
    );
  }

  // Show start button if not yet generating
  if (selectedMethods.length > 0 && !shouldStartGeneration && !rubricHtml) {
    console.log('📋 מציג מסך התחלה עם הפרמטרים:', {
      selectedMethodsLength: selectedMethods.length,
      shouldStartGeneration,
      hasRubricHtml: !!rubricHtml,
      hasError: !!error
    });
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <header className={styles.header}>
          <h2 className={styles.mainTitle}>מוכן ליצירת מטלה</h2>
        </header>
        
        <div className={styles.startContainer}>
          <div className={styles.selectedMethodsPreview}>
            <h3>השיטות הפדגוגיות שנבחרו:</h3>
            <ul>
              {selectedMethods.map(method => (
                <li key={method.id}>{method.title}</li>
              ))}
            </ul>
          </div>
          
          <div className={styles.startActions}>
            <Button 
              size="lg" 
              onClick={handleStartGeneration}
              className={styles.startButton}
            >
              🚀 צור מטלה
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              ← שנה בחירות
            </Button>
          </div>
          
          <p className={styles.startDescription}>
            המערכת תיצור מטלה מותאמת אישית ומחוון הערכה מפורט על בסיס השיטות שבחרת ותכני הקורס.
          </p>
          
          <div className={styles.debugInfo} style={{marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.9rem', color: '#666'}}>
            <strong>מצב נוכחי:</strong><br/>
            שיטות נבחרות: {selectedMethods.length}<br/>
            תוכן קורס: {courseContent ? `${courseContent.length} תווים` : 'חסר'}<br/>
            shouldStartGeneration: {shouldStartGeneration ? 'true' : 'false'}<br/>
            error: {error || 'אין'}
          </div>
        </div>
      </div>
    );
  }

  // Loading state display
  if (loadingState.isLoading) {
    console.log('⏳ מציג מסך טעינה:', loadingState);
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <header className={styles.header}>
          <h2 className={styles.mainTitle}>יוצר הצעת מטלה ומחוון</h2>
        </header>

        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingIconContainer}>
              <Loader2 size={48} className={styles.loadingSpinner} />
            </div>
            
            <h3 className={styles.loadingTitle}>{loadingState.message}</h3>
            
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${loadingState.progress}%` }}
                />
              </div>
              <span className={styles.progressText}>{loadingState.progress}%</span>
            </div>
            
            {loadingState.estimatedTime && loadingState.estimatedTime > 0 && (
              <div className={styles.timeEstimate}>
                <Clock size={16} />
                <span>זמן משוער: {formatTime(loadingState.estimatedTime)}</span>
              </div>
            )}
            
            <div className={styles.loadingSteps}>
              <div className={`${styles.step} ${loadingState.progress >= 10 ? styles.active : ''}`}>
                <div className={styles.stepIcon}>
                  {loadingState.progress >= 25 ? <CheckCircle size={16} /> : '1'}
                </div>
                <span>ניתוח תכני הקורס</span>
              </div>
              <div className={`${styles.step} ${loadingState.progress >= 25 ? styles.active : ''}`}>
                <div className={styles.stepIcon}>
                  {loadingState.progress >= 50 ? <CheckCircle size={16} /> : '2'}
                </div>
                <span>בחירת שיטות הערכה</span>
              </div>
              <div className={`${styles.step} ${loadingState.progress >= 50 ? styles.active : ''}`}>
                <div className={styles.stepIcon}>
                  {loadingState.progress >= 75 ? <CheckCircle size={16} /> : '3'}
                </div>
                <span>יצירת מטלה מותאמת</span>
              </div>
              <div className={`${styles.step} ${loadingState.progress >= 75 ? styles.active : ''}`}>
                <div className={styles.stepIcon}>
                  {loadingState.progress >= 100 ? <CheckCircle size={16} /> : '4'}
                </div>
                <span>מכין מחוון הערכה</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    console.log('❌ מציג מסך שגיאה:', error);
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <header className={styles.header}>
          <h2 className={styles.mainTitle}>שגיאה ביצירת המטלה</h2>
        </header>

        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>אופס! משהו השתבש</h3>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.errorActions}>
              <Button onClick={handleRetry}>
                נסה שוב
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                חזור לשלב הקודם
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ מציג תוצאות מוכנות:', {
    hasRubricHtml: !!rubricHtml,
    modelUsed,
    selectedMethodsLength: selectedMethods.length,
    shouldStartGeneration
  });

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <h2 className={styles.mainTitle}>הצעת מטלה ומחוון</h2>
        <div className={styles.actions}>
          <Button onClick={handleCopyAll} variant="outline">
            <Copy size={16} />
            העתק את המשימה השלמה
          </Button>
        </div>
      </header>

      <div ref={contentRef} className={styles.content}>
        {rubricHtml ? (
          <div>
            {modelUsed && (
              <div style={{ marginBottom: 12, color: '#888', fontSize: 14, textAlign: 'left' }}>
                <span>המחוון נוצר אוטומטית באמצעות מודל: <b>{modelUsed}</b></span>
              </div>
            )}
            <div
              className={styles.rubricHtmlBlock}
              dangerouslySetInnerHTML={{ __html: cleanHtmlContent(rubricHtml) }}
            />
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{generatedAssessment.title}</h3>
              <p className={styles.description}>{generatedAssessment.description}</p>
            </section>

            <section className={styles.section}>
              <h4 className={styles.subTitle}>הנחיות לסטודנטים</h4>
              <ol className={styles.instructionsList}>
                {generatedAssessment.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </section>

            <section className={styles.section}>
              <h4 className={styles.subTitle}>דרישות טכניות והגשה</h4>
              <ul className={styles.requirementsList}>
                {generatedAssessment.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>מחוון להערכה</h3>
              <div className={styles.rubricContainer}>
                <table className={styles.rubricTable}>
                  <thead>
                    <tr>
                      <th>קריטריון</th>
                      <th>מיטבי (85-100%)</th>
                      <th>מתקדם (75-84%)</th>
                      <th>בסיסי (65-74%)</th>
                      <th>טעון שיפור (מתחת ל-65%)</th>
                      <th>משקל</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedRubric.map((criterion, index) => (
                      <tr key={index}>
                        <td className={styles.criterionName}>
                          <strong>{criterion.name}</strong>
                          <p>{criterion.description}</p>
                        </td>
                        <td>{criterion.levels.excellent}</td>
                        <td>{criterion.levels.good}</td>
                        <td>{criterion.levels.satisfactory}</td>
                        <td>{criterion.levels.needs_improvement}</td>
                        <td className={styles.weightCell}>{`${Math.round(criterion.weight * 100)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
