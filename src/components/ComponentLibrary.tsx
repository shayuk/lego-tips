
import React from "react";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";
import { Input } from "./Input";
import { AssessmentComponentType } from "../features/assessmentBuilder/hooks/useAssessmentBuilder";
import styles from "./ComponentLibrary.module.css";

interface ComponentLibraryProps {
  onDragStart: () => void;
  className?: string;
}

interface ComponentItem {
  type: AssessmentComponentType;
  title: string;
  description: string;
  icon: string;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onDragStart,
  className,
}) => {
  const questionComponents: ComponentItem[] = [
    {
      type: "question-multiple-choice",
      title: "בחירה מרובה",
      description: "שאלה עם אפשרויות תשובה מוגדרות מראש",
      icon: "📝",
    },
    {
      type: "question-short-answer",
      title: "תשובה קצרה",
      description: "שאלה עם תשובה טקסטואלית קצרה",
      icon: "✏️",
    },
    {
      type: "question-essay",
      title: "חיבור",
      description: "שאלה עם תשובה כתובה מורחבת",
      icon: "📄",
    },
  ];
  
  const rubricComponents: ComponentItem[] = [
    {
      type: "rubric-element",
      title: "קריטריוני מחוון",
      description: "קריטריוני הערכה עם רמות ציון",
      icon: "📊",
    },
  ];
  
  const structureComponents: ComponentItem[] = [
    {
      type: "section-header",
      title: "כותרת מקטע",
      description: "מחלק את המטלה למקטעים",
      icon: "📌",
    },
    {
      type: "instruction-block",
      title: "הוראות",
      description: "הנחיות לסטודנטים",
      icon: "ℹ️",
    },
  ];
  
  const handleDragStart = (event: React.DragEvent, component: ComponentItem) => {
    event.dataTransfer.setData("componentType", component.type);
    event.dataTransfer.setData("componentTitle", component.title);
    event.dataTransfer.setData("componentDescription", component.description);
    event.dataTransfer.effectAllowed = "copy";
    
    // Call the provided onDragStart handler
    onDragStart();
  };
  
  const renderComponentItem = (component: ComponentItem) => (
    <div 
      key={component.type}
      className={styles.componentItem}
      draggable
      onDragStart={(e) => handleDragStart(e, component)}
    >
      <div className={styles.componentIcon}>{component.icon}</div>
      <div className={styles.componentInfo}>
        <h4 className={styles.componentTitle}>{component.title}</h4>
        <p className={styles.componentDescription}>{component.description}</p>
      </div>
    </div>
  );

  return (
    <div className={`${styles.libraryContainer} ${className || ""}`}>
      <div className={styles.libraryHeader}>
        <h3 className={styles.libraryTitle}>ספריית רכיבים</h3>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={16} />
          <Input 
            className={styles.searchInput} 
            placeholder="חפש רכיבים..." 
            type="search"
          />
        </div>
      </div>
      
      <div className={styles.libraryContent}>
        <Accordion type="multiple" defaultValue={["questions", "rubrics", "structure"]}>
          <AccordionItem value="questions">
            <AccordionTrigger>סוגי שאלות</AccordionTrigger>
            <AccordionContent>
              <div className={styles.componentList}>
                {questionComponents.map(renderComponentItem)}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="rubrics">
            <AccordionTrigger>רכיבי מחוון</AccordionTrigger>
            <AccordionContent>
              <div className={styles.componentList}>
                {rubricComponents.map(renderComponentItem)}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="structure">
            <AccordionTrigger>רכיבי מבנה</AccordionTrigger>
            <AccordionContent>
              <div className={styles.componentList}>
                {structureComponents.map(renderComponentItem)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className={styles.libraryFooter}>
        <p className={styles.dragHint}>גרור רכיבים אל הלוח</p>
      </div>
    </div>
  );
};
