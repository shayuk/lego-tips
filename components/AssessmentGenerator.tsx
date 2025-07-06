import { useRef } from 'react';
import { Copy } from 'lucide-react';
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
  const { generatedAssessment, generatedRubric, rubricHtml, modelUsed } = useAssessmentGenerator({
    selectedMethods,
    courseParams,
    courseName,
    faculty,
    department,
    courseContent,
  });
  const contentRef = useRef<HTMLDivElement>(null);

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

  if (selectedMethods.length === 0) {
    return (
      <div className={`${styles.container} ${styles.placeholder} ${className || ''}`}>
        <p>בחר/י שיטות הערכה כדי ליצור מטלה.</p>
      </div>
    );
  }

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
