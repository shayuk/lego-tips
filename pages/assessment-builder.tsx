"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, Lightbulb, Building } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { CourseParameterSelector } from "../components/CourseParameterSelector";
import { PedagogicalMethodSelector } from "../components/PedagogicalMethodSelector";
import { AssessmentGenerator } from "../components/AssessmentGenerator";
import { PedagogicalTips } from "../components/PedagogicalTips";
import { Button } from "../components/Button";

import { CourseParameterSchema } from "../helpers/courseParameterSchemas";
import { AssessmentMethod } from "../helpers/assessmentTypes";
import styles from "./assessment-builder.module.css";

type MainTab = "builder" | "tips";

export default function AssessmentBuilderPage() {
  
  const [activeTab, setActiveTab] = useState<MainTab>("builder");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [courseParameters, setCourseParameters] = useState<CourseParameterSchema | null>(null);
  const [selectedMethods, setSelectedMethods] = useState<AssessmentMethod[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  


  const handleCourseParametersSubmit = async (data: CourseParameterSchema) => {
    setIsSubmitting(true);
    try {
      // Convert CourseParameterSchema to CourseParameters format expected by PedagogicalMethodSelector
      
      setCourseParameters(data);
      setCurrentStep(2);
    } catch (error) {
      // Handle error appropriately - could show a toast notification
      alert('שגיאה בעיבוד פרמטרי הקורס. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMethodsSelect = (methods: AssessmentMethod[]) => {
    setSelectedMethods(methods);
    setCurrentStep(3);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as number);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as number);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setCourseParameters(null);
    setSelectedMethods([]);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "פרמטרי הקורס";
      case 2: return "בחירת שיטות הערכה";
      case 3: return "יצירת המטלה";
      default: return "";
    }
  };

  const renderProgressIndicator = () => (
    <div className={styles.progressIndicator}>
      {[1, 2, 3].map((step) => (
        <div key={step} className={styles.progressStep}>
          <div className={`${styles.progressCircle} ${
            currentStep >= step ? styles.progressActive : styles.progressInactive
          }`}>
            {step}
          </div>
          <span className={`${styles.progressLabel} ${
            currentStep >= step ? styles.progressLabelActive : ''
          }`}>
            {getStepTitle(step)}
          </span>
          {step < 3 && <div className={`${styles.progressLine} ${
            currentStep > step ? styles.progressLineActive : ''
          }`} />}
        </div>
      ))}
    </div>
  );

  const renderGuidedStep = () => {
    let courseParams: any = undefined;
    let finalCourseParams: any = undefined;
    switch (currentStep) {
      case 1:
        return (
          <CourseParameterSelector
            onParametersSubmit={handleCourseParametersSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 2:
        if (!courseParameters) return null;
        courseParams = {
          course_type: courseParameters.courseType as "introduction" | "large" | "advanced",
          teaching_method: courseParameters.teachingMethod as "lecture" | "seminar" | "workshop" | "lab" | "fieldwork" | "online" | "hybrid",
          class_size: courseParameters.classSize as "small" | "medium" | "large" | "very-large",
          subject_area: "multidisciplinary" as "humanities" | "social-sciences" | "natural-sciences" | "engineering" | "arts" | "business" | "law" | "medicine" | "education" | "multidisciplinary",
          instructor_experience: 3 as 1 | 2 | 3 | 4 | 5,
          available_time: "moderate" as "minimal" | "moderate" | "substantial" | "extensive",
          technology_access: true,
        };
        return (
          <PedagogicalMethodSelector
            courseParameters={courseParams}
            onSelectMethods={handleMethodsSelect}
          />
        );
      case 3:
        if (!courseParameters || selectedMethods.length === 0) return null;
        finalCourseParams = {
          course_type: courseParameters.courseType as "introduction" | "large" | "advanced",
          teaching_method: courseParameters.teachingMethod as "lecture" | "seminar" | "workshop" | "lab" | "fieldwork" | "online" | "hybrid",
          class_size: courseParameters.classSize as "small" | "medium" | "large" | "very-large",
          subject_area: "multidisciplinary" as "humanities" | "social-sciences" | "natural-sciences" | "engineering" | "arts" | "business" | "law" | "medicine" | "education" | "multidisciplinary",
          instructor_experience: 3 as 1 | 2 | 3 | 4 | 5,
          available_time: "moderate" as "minimal" | "moderate" | "substantial" | "extensive",
          technology_access: true,
        };
        return (
          <AssessmentGenerator
            selectedMethods={selectedMethods}
            courseParams={finalCourseParams}
            courseName={courseParameters.courseName}
            faculty={courseParameters.faculty}
            department={courseParameters.department}
            courseContent={courseParameters.courseContent}
          />
        );
      default:
        return null;
    }
  };

  const renderGuidedNavigation = () => (
    <div className={styles.guidedNavigation}>
      <div className={styles.navigationLeft}>
        <Button 
          variant="outline" 
          onClick={handleStartOver}
          disabled={currentStep === 1}
        >
          <RotateCcw size={16} />
          התחל מחדש
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
        >
          <ArrowRight size={16} />
          קודם
        </Button>
      </div>
      
      <div className={styles.navigationRight}>
        {currentStep < 3 && (
          <Button 
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !courseParameters) ||
              (currentStep === 2 && selectedMethods.length === 0)
            }
          >
            הבא
            <ArrowLeft size={16} />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.mainTabs}>
              <Button
                variant={activeTab === "builder" ? "primary" : "outline"}
                onClick={() => setActiveTab("builder")}
                size="sm"
              >
                <Building size={16} />
                בניית משימה
              </Button>
              <Button
                variant={activeTab === "tips" ? "primary" : "outline"}
                onClick={() => setActiveTab("tips")}
                size="sm"
              >
                <Lightbulb size={16} />
                טיפים פדגוגיים
              </Button>
            </div>
            


          </div>
          

        </div>

        {activeTab === "builder" && renderProgressIndicator()}
        
        <div className={activeTab === "tips" ? styles.workspaceWithTips : styles.workspace}>
          {activeTab === "tips" ? (
            <PedagogicalTips />
          ) : (
            <div className={styles.guidedContent}>
              {renderGuidedStep()}
            </div>
          )}
        </div>

        {activeTab === "builder" && renderGuidedNavigation()}
      </div>
    </AppLayout>
  );
}