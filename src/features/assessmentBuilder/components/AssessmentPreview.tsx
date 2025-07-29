
import React, { useState } from "react";
import { FileDown, Maximize2, Minimize2, Printer } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/Tabs";
import { Button } from "../../../components/Button";
import { Assessment } from "../hooks/useAssessmentBuilder";
import styles from "./AssessmentPreview.module.css";
import parse from 'html-react-parser';

interface AssessmentPreviewProps {
  assessment: Assessment;
  className?: string;
}

export const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  assessment,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const renderStudentView = () => {
    return (
      <div className={styles.previewDocument}>
        <h1 className={styles.documentTitle}>{assessment.title}</h1>
        <div className={styles.documentDescription}>{parse(assessment.description)}</div>
        
        {assessment.components.map((component) => {
          switch (component.type) {
            case "section-header":
              return (
                <div key={component.id} className={styles.sectionHeader}>
                  <h2>{component.title}</h2>
                </div>
              );
            case "instruction-block":
              return (
                <div key={component.id} className={styles.instructionBlock}>
                  <h3>{component.title}</h3>
                  <div>{parse(component.content)}</div>
                </div>
              );
            case "question-multiple-choice":
              return (
                <div key={component.id} className={styles.questionBlock}>
                  <h3>בחירה מרובה: {component.title}</h3>
                  <div>{parse(component.content)}</div>
                  <div className={styles.options}>
                    <div className={styles.option}>
                      <input type="radio" id={`option1-${component.id}`} name={`question-${component.id}`} />
                      <label htmlFor={`option1-${component.id}`}>אפשרות 1</label>
                    </div>
                    <div className={styles.option}>
                      <input type="radio" id={`option2-${component.id}`} name={`question-${component.id}`} />
                      <label htmlFor={`option2-${component.id}`}>אפשרות 2</label>
                    </div>
                    <div className={styles.option}>
                      <input type="radio" id={`option3-${component.id}`} name={`question-${component.id}`} />
                      <label htmlFor={`option3-${component.id}`}>אפשרות 3</label>
                    </div>
                  </div>
                </div>
              );
            case "question-short-answer":
              return (
                <div key={component.id} className={styles.questionBlock}>
                  <h3>תשובה קצרה: {component.title}</h3>
                  <div>{parse(component.content)}</div>
                  <textarea className={styles.answerArea} rows={3} placeholder="התשובה שלך כאן..."></textarea>
                </div>
              );
            case "question-essay":
              return (
                <div key={component.id} className={styles.questionBlock}>
                  <h3>חיבור: {component.title}</h3>
                  <div>{parse(component.content)}</div>
                  <textarea className={styles.answerArea} rows={8} placeholder="החיבור שלך כאן..."></textarea>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };
  
  const renderInstructorView = () => {
    return (
      <div className={styles.previewDocument}>
        <h1 className={styles.documentTitle}>{assessment.title} - תצוגת מרצה</h1>
        <div className={styles.documentDescription}>{parse(assessment.description)}</div>
        
        <div className={styles.metadataBlock}>
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>נוצר:</span>
            <span>{assessment.createdAt.toLocaleDateString()}</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>עודכן לאחרונה:</span>
            <span>{assessment.updatedAt.toLocaleDateString()}</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>רכיבים:</span>
            <span>{assessment.components.length}</span>
          </div>
        </div>
        
        {assessment.components.map((component) => (
          <div key={component.id} className={styles.instructorComponent}>
            <div className={styles.componentHeader}>
              <span className={styles.componentType}>{component.type}</span>
              <h3>{component.title}</h3>
            </div>
            <div>{parse(component.content)}</div>
            {component.type.startsWith("question") && (
              <div className={styles.scoringInfo}>
                <span className={styles.pointsLabel}>נקודות:</span>
                <span className={styles.pointsValue}>10</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderRubricView = () => {
    return (
      <div className={styles.previewDocument}>
        <h1 className={styles.documentTitle}>{assessment.title} - מחוון</h1>
        
        <table className={styles.rubricTable}>
          <thead>
            <tr>
              <th>קריטריונים</th>
              <th>מצוין (א)</th>
              <th>טוב (ב)</th>
              <th>מספק (ג)</th>
              <th>זקוק לשיפור (ד)</th>
            </tr>
          </thead>
          <tbody>
            {assessment.components
              .filter(c => c.type === "rubric-element")
              .map((rubric) => (
                <tr key={rubric.id}>
                  <td className={styles.rubricCriteria}>{rubric.title}</td>
                  <td>הבנה ויישום יוצאי דופן</td>
                  <td>הבנה ויישום טובים</td>
                  <td>הבנה ויישום בסיסיים</td>
                  <td>הבנה ויישום מוגבלים</td>
                </tr>
              ))}
            {assessment.components.filter(c => c.type === "rubric-element").length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyRubric}>
                  טרם נוספו אלמנטים למחוון.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`${styles.previewContainer} ${isExpanded ? styles.expanded : ''} ${className || ""}`}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>תצוגה מקדימה של ההערכה</h3>
        <div className={styles.previewControls}>
          <Button variant="ghost" size="icon-sm" onClick={toggleExpand}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="student">
        <TabsList>
          <TabsTrigger value="student">תצוגת תלמיד</TabsTrigger>
          <TabsTrigger value="instructor">תצוגת מרצה</TabsTrigger>
          <TabsTrigger value="rubric">מחוון</TabsTrigger>
        </TabsList>
        
        <div className={styles.previewContent}>
          <TabsContent value="student">
            {renderStudentView()}
          </TabsContent>
          
          <TabsContent value="instructor">
            {renderInstructorView()}
          </TabsContent>
          
          <TabsContent value="rubric">
            {renderRubricView()}
          </TabsContent>
        </div>
      </Tabs>
      
      <div className={styles.previewFooter}>
        <Button variant="outline" size="sm">
          <Printer size={14} />
          <span>הדפס</span>
        </Button>
        <Button variant="outline" size="sm">
          <FileDown size={14} />
          <span>ייצא PDF</span>
        </Button>
        <Button size="sm">
          <span>ייצא DOCX</span>
        </Button>
      </div>
    </div>
  );
};
