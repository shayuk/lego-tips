import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { AssessmentMethod, CourseParameters } from '../features/assessmentBuilder/lib/assessmentTypes';
import { PedagogicalMethodSelector } from '../features/assessmentBuilder/components/PedagogicalMethodSelector';
import { FileDropzone } from '../components/FileDropzone';
import { Button } from '../components/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/Dialog';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/Select';
import { SetupStep } from '../features/assessmentBuilder/components/SetupStep';
import { GeneratedAssessmentDisplay } from '../features/assessmentBuilder/components/GeneratedAssessmentDisplay';
import { AppLayout, useAppToast } from '../components/AppLayout';
import useAssessmentGenerator from '../features/assessmentBuilder/hooks/useAssessmentGenerator';
import styles from './assessment-builder.module.css';
import modalStyles from './AddTipModal.module.css'; // Import modal-specific styles
import { Plus, Trash2, X } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../components/Collapsible';
import { performDynamicAnalysis } from "../features/assessmentBuilder/lib/knowledgeAnalyzer";
import { savePrivateTip, getPrivateTips, deletePrivateTip, NewTipData } from '../features/pedagogicalTips/lib/pedagogicalTipStorage';
import { assessmentMethods } from '../features/assessmentBuilder/lib/assessmentMethods';

// 🚀 LAZY LOADING - הקובץ הענק יטען רק כשצריך!
// const PedagogicalMethodSelector = lazy(() => import('../components/PedagogicalMethodSelector').then(module => ({ 
//   default: module.PedagogicalMethodSelector 
// })));

// 🎨 Loading Component יפה לזמן הטעינה
// const SelectorLoading = () => (
//   <div style={{ 
//     display: 'flex', 
//     flexDirection: 'column', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     padding: '3rem',
//     minHeight: '200px',
//     backgroundColor: '#f8fafc',
//     borderRadius: '12px',
//     border: '2px dashed #cbd5e1'
//   }}>
//     <div style={{
//       width: '50px',
//       height: '50px',
//       border: '4px solid #e2e8f0',
//       borderTop: '4px solid #3b82f6',
//       borderRadius: '50%',
//       animation: 'spin 1s linear infinite',
//       marginBottom: '1rem'
//     }}></div>
//     <div style={{fontSize: '1.1rem', color: '#666', fontWeight: '500'}}>
//       🧠 טוען מאגר השיטות הפדגוגיות...
//     </div>
//     <div style={{fontSize: '0.9rem', color: '#999', marginTop: '0.5rem'}}>
//       זה יקרה רק פעם אחת בביקור
//     </div>
//     <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
//   </div>
// );

export default function AssessmentBuilderPage() {
  // 📊 Performance tracking for main component
  const renderTime = new Date().toLocaleTimeString();
  console.log(`🔄 [MAIN] AssessmentBuilderPage rendered at ${renderTime}`);
  
  const [currentStep, setCurrentStep] = useState<'setup' | 'recommendations' | 'task-generation'>('setup');
  const [selectedMethods, setSelectedMethods] = useState<AssessmentMethod[]>([]);
  const [shouldGenerateTask, setShouldGenerateTask] = useState(false);

  console.log('📊 [MAIN] Current step:', currentStep);
  console.log('📊 [MAIN] Selected methods count:', selectedMethods.length);

  console.log('🔄 AssessmentBuilderPage נטען עם:', {
    currentStep,
    selectedMethodsLength: selectedMethods.length,
    shouldGenerateTask
  });

  console.log('🔍 [DEBUG] AssessmentBuilderPage נטען - currentStep:', currentStep);
  console.log('🔍 [DEBUG] selectedMethods.length:', selectedMethods.length);
  console.log('🔍 [DEBUG] shouldGenerateTask:', shouldGenerateTask);

  // Add tip modal state
  const [isAddTipModalOpen, setIsAddTipModalOpen] = useState(false);
  const [newTip, setNewTip] = useState<NewTipData>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    categories: [],
    classSizes: [],
    teachingMethods: [],
    subjectAreas: [],
    difficulty: '',
    timeInvestment: '',
    advantages: {
      pedagogical: '',
      practical: '',
      engagement: ''
    },
    disadvantages: {
      challenges: '',
      limitations: '',
      resources: ''
    },
    recommendedTools: '',
    toolsWithLinks: [{ name: '', link: '', description: '' }],
    furtherReading: [{ title: '', link: '' }],
    implementationGuidelines: '',
    rubricTemplate: ''
  });

  const [courseDetails, setCourseDetails] = useState({
    courseName: '',
    faculty: '',
    department: '',
    courseType: '',
    studentCount: '',
    focusAreas: '',
    uploadedFiles: [] as File[],
    customFaculty: '',
    customDepartment: '',
    customCourseType: '',
    customStudentCount: ''
  });

  const courseParameters: CourseParameters = useMemo(() => ({
    course_type: courseDetails.courseType as any || 'introduction',
    teaching_method: 'lecture' as any,
    class_size: courseDetails.studentCount as any || 'medium',
    subject_area: 'humanities' as any,
    instructor_experience: 3,
    available_time: 'moderate' as any,
    technology_access: true,
    courseContent: courseDetails.focusAreas || 'לא הועלה תוכן קורס ספציפי'
  }), [courseDetails]);

  // Use the assessment generator hook with correct parameters
  const {
    generatedAssessment,
    generatedRubric,
    rubricHtml,
    modelUsed,
    loadingState,
    error,
    groundingMode,
    sourcesUsed,
    apa7References,
    materialQualityReport,
    getAPIStats
  } = useAssessmentGenerator({
    selectedMethods,
    courseParams: courseParameters, // ✅ משתמש ב-courseParameters עטוף ב-useMemo
    courseName: courseDetails.courseName,
    faculty: courseDetails.faculty,
    department: courseDetails.department,
    courseContent: courseDetails.focusAreas || 'לא הועלה תוכן קורס ספציפי',
    shouldGenerate: shouldGenerateTask
  });

  // Toast hook for notifications
  const toast = useAppToast();

  // Auto-trigger task generation when entering task-generation step
  useEffect(() => {
    console.log('🎯 [useEffect] currentStep שונה ל:', currentStep);
    console.log('🎯 [useEffect] selectedMethods.length:', selectedMethods.length);
    console.log('🎯 [useEffect] shouldGenerateTask:', shouldGenerateTask);
    
    // ❌ הסרנו את הלוגיקה האוטומטית - רק ידנית!
    if (currentStep === 'task-generation' && selectedMethods.length === 0) {
      console.error('🚨 [ERROR] הגענו לשלב task-generation בלי טיפים! חוזרים לשלב setup');
      setCurrentStep('setup');
    }
  }, [currentStep, selectedMethods.length, shouldGenerateTask]);

  // Reset shouldGenerateTask when leaving task-generation step
  useEffect(() => {
    if (currentStep !== 'task-generation' && shouldGenerateTask) {
      console.log('🔄 useEffect - מאפס shouldGenerateTask כי יצאנו משלב task-generation');
      setShouldGenerateTask(false);
    }
  }, [currentStep, shouldGenerateTask]);

  const handleAddTip = () => {
    setIsAddTipModalOpen(true);
  };

  // 🎯 Stable functions with useCallback (חיוני ל-React.memo)
  const handleInputChange = useCallback((field: string, value: string) => {
    console.log('🔧 [Stable] handleInputChange called:', field, value);
    setCourseDetails(prev => ({
      ...prev,
      [field]: value
    }));
  }, []); // Empty dependency - הפונקציה יציבה

  const handleFileUpload = useCallback((files: File[]) => {
    console.log('📎 [Stable] handleFileUpload called:', files.length, 'files');
    
    setCourseDetails(prev => {
      // Filter out files with duplicate names to prevent key conflicts
      const newFiles = files.filter(newFile => 
        !prev.uploadedFiles.some(existingFile => 
          existingFile.name === newFile.name
        )
      );
      
      // Warn user if some files were skipped due to duplicate names  
      if (newFiles.length < files.length) {
        const skippedCount = files.length - newFiles.length;
        if (toast) {
          toast.showWarning(
            'קבצים עם שמות זהים', 
            `${skippedCount} קבצים דולגו כי קבצים עם שמות זהים כבר קיימים`
          );
        } else {
          alert(`${skippedCount} קבצים דולגו כי קבצים עם שמות זהים כבר קיימים`);
        }
      }
      
      return {
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles]
      };
    });
  }, [toast]); // תלוי רק ב-toast, courseDetails.uploadedFiles מטופל בתוך setState

  const handleRemoveFile = useCallback((fileName: string) => {
    console.log('🗑️ [Stable] handleRemoveFile called:', fileName);
    setCourseDetails(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.name !== fileName)
    }));
  }, []); // Empty dependency - הפונקציה יציבה

  const handleProceedToRecommendations = useCallback(() => {
    console.log('➡️ [Stable] handleProceedToRecommendations called');
    console.log('📝 [Validation] Course name:', courseDetails.courseName);
    
    // Validation logic
    if (!courseDetails.courseName.trim()) {
      if (toast) {
        toast.showWarning('שדה חסר', 'אנא הזן שם קורס');
      } else {
        alert('אנא הזן שם קורס');
      }
      return; // Don't proceed
    }
    
    // If validation passes, proceed to next step
    console.log('✅ [Validation] Proceeding to recommendations step');
    setCurrentStep('recommendations');
  }, [courseDetails.courseName, toast]); // תלוי בשם הקורס ו-toast

  // 🎯 Stable method selector with useCallback (חיוני ל-lazy loading)
  const handleMethodSelect = useCallback((methods: AssessmentMethod[]) => {
    console.log('🎯 [Lazy] טיפים נבחרו:', methods);
    console.log('📊 [Lazy] מספר הטיפים שנבחרו:', methods.length);
    console.log('📋 [Lazy] שמות הטיפים:', methods.map(m => m.title || 'ללא שם'));
    
    setSelectedMethods(methods);
    
    console.log('✅ [Lazy] State עודכן - selectedMethods length:', methods.length);
    
    // Performance tracking
    if (methods.length > 0) {
      console.log('⚡ [Performance] PedagogicalMethodSelector loaded and methods selected!');
    }
  }, []); // Empty dependency - הפונקציה יציבה

  const handleSelectMethods = useCallback((methods: AssessmentMethod[]) => {
    console.log('--- [0] handleSelectMethods CALLED ---');
    console.log('Methods received from PedagogicalMethodSelector:', methods);
    console.log('Is methods array:', Array.isArray(methods));
    console.log('Methods length:', methods?.length || 0);
    console.log('Method details:', methods?.map(m => ({ 
      id: m?.id, 
      title: m?.title, 
      hasTitle: !!m?.title 
    })) || []);
    
    handleMethodSelect(methods);
    
    console.log('--- [0.5] handleSelectMethods COMPLETED ---');
    console.log('Should now have selectedMethods updated in next render');
  }, [handleMethodSelect]);

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  // Add tip functions
  const handleAddToolLink = () => {
    setNewTip(prev => ({ ...prev, toolsWithLinks: [...prev.toolsWithLinks, { name: '', link: '', description: '' }] }));
  };

  const handleRemoveToolLink = (index: number) => {
    setNewTip(prev => ({ ...prev, toolsWithLinks: prev.toolsWithLinks.filter((_, i) => i !== index) }));
  };

  const handleAddFurtherReading = () => {
    setNewTip(prev => ({ ...prev, furtherReading: [...prev.furtherReading, { title: '', link: '' }] }));
  };
    
  const handleRemoveFurtherReading = (index: number) => {
    setNewTip(prev => ({ ...prev, furtherReading: prev.furtherReading.filter((_, i) => i !== index) }));
  };

  const handleSaveNewTip = (isPublic: boolean) => {
    if (!newTip.title.trim() || !newTip.difficulty) {
      alert('אנא מלא את שדות החובה: כותרת ורמת קושי.');
      return;
    }

    if (isPublic) {
      console.log('Submitting tip for public review:', newTip);
      alert('הטיפ הוגש לבדיקה ויופיע במאגר הציבורי לאחר אישור.');
    } else {
      const savedTip = savePrivateTip(newTip);
      setAllMethods(prev => [...prev, { ...savedTip, isPrivate: true }]);
      setRecommendationsVersion(prev => prev + 1); // Increment to force refresh
      alert('הטיפ נשמר בהצלחה במאגר הפרטי שלך!');
    }
    
    setIsAddTipModalOpen(false);
    // Reset form
    setNewTip({
      title: '',
      shortDescription: '',
      fullDescription: '',
      categories: [],
      classSizes: [],
      teachingMethods: [],
      subjectAreas: [],
      difficulty: '',
      timeInvestment: '',
      advantages: { pedagogical: '', practical: '', engagement: '' },
      disadvantages: { challenges: '', limitations: '', resources: '' },
      recommendedTools: '',
      toolsWithLinks: [{ name: '', link: '', description: '' }],
      furtherReading: [{ title: '', link: '' }],
      implementationGuidelines: '',
      rubricTemplate: ''
    });
  };

  const handleDeletePrivateTip = (tipId: string) => {
    // Remove from localStorage
    deletePrivateTip(tipId);
    
    // Remove from allMethods state
    setAllMethods(prev => prev.filter(method => method.id !== tipId));
    
    // Remove from selected methods if selected
    setSelectedMethods(prev => prev.filter(method => method.id !== tipId));
    
    // Force refresh of recommendations
    setRecommendationsVersion(prev => prev + 1);
    
    alert('הטיפ נמחק בהצלחה!');
  };

  const handleGenerateTask = () => {
    // שלב 1: בדיקת הטריגר
    console.log('--- [1] handleGenerateTask TRIGGERED ---');
    console.log('Current selectedMethods:', selectedMethods);
    console.log('Is selectedMethods an Array:', Array.isArray(selectedMethods));
    console.log('Number of selected methods:', selectedMethods.length);
    console.log('Method titles:', selectedMethods.map(m => m?.title || 'NO TITLE'));
    console.log('Current state:', {
      currentStep,
      shouldGenerateTask,
      courseDetailsName: courseDetails.courseName,
      courseDetailsFaculty: courseDetails.faculty
    });

    // שלב 2: בדיקת תנאי העצירה
    if (selectedMethods.length === 0) {
      console.error('--- ABORTING: No pedagogical methods were selected! ---');
      // הודעת toast
      if (toast) {
        toast.showWarning('⚠️ יש לבחור לפחות טיפ פדגוגי אחד', 'אנא בחר טיפ פדגוגי כדי ליצור מטלה מותאמת אישית');
      } else {
        alert('⚠️ אנא בחר לפחות טיפ פדגוגי אחד כדי ליצור מטלה מותאמת אישית');
      }
      return;
    }
    
    // שלב 3: אימות שינוי המצב
    console.log('--- [2] Setting state to trigger generator... ---');
    console.log('Before state update:', { currentStep, shouldGenerateTask });
    
    // ✅ התיקון החשוב - הוספת הטריגר החסר!
    setCurrentStep('task-generation');
    setShouldGenerateTask(true); // 🚨 זהו הטריגר העיקרי שהיה חסר!
    
    console.log('--- [3] State update commands sent ---');
    console.log('Next render should have:', { 
      currentStep: 'task-generation', 
      shouldGenerateTask: true 
    });
  };

  // פונקציות חדשות לכפתורי הפעולה
  const handleSaveAssignment = () => {
    if (!generatedAssessment) return;
    
    const assignmentData = {
      title: generatedAssessment.title,
      description: generatedAssessment.description,
      instructions: generatedAssessment.instructions,
      requirements: generatedAssessment.requirements,
      rubric: generatedRubric,
      courseDetails: courseDetails,
      selectedMethods: selectedMethods,
      createdAt: new Date().toISOString(),
      modelUsed: modelUsed
    };
    
    // שמירה ב-localStorage
    const savedAssignments = JSON.parse(localStorage.getItem('savedAssignments') || '[]');
    savedAssignments.push(assignmentData);
    localStorage.setItem('savedAssignments', JSON.stringify(savedAssignments));
    
    alert('✅ המטלה נשמרה בהצלחה! תוכל למצוא אותה ב"המטלות שלי"');
  };

  const handleShareAssignment = () => {
    if (!generatedAssessment) return;
    
    // יצירת קישור לשיתוף (בפועל זה יהיה URL של המטלה)
    const shareData = {
      title: generatedAssessment.title,
      text: `מטלה חדשה: ${generatedAssessment.title}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback - העתקה ללוח
      const assignmentText = `
${generatedAssessment.title}

${generatedAssessment.description}

הנחיות:
${generatedAssessment.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

דרישות:
${generatedAssessment.requirements.map((requirement, index) => `${index + 1}. ${requirement}`).join('\n')}

נוצר בעזרת: ${modelUsed}
      `.trim();
      
      navigator.clipboard.writeText(assignmentText).then(() => {
        alert('📋 המטלה הועתקה ללוח!');
      }).catch(() => {
        alert('❌ לא הצלחנו להעתיק ללוח. נסה שוב.');
      });
    }
  };

  const handleEmailAssignment = () => {
    if (!generatedAssessment) return;
    
    const subject = encodeURIComponent(`מטלה חדשה: ${generatedAssessment.title}`);
    const body = encodeURIComponent(`
שלום,

הנני שולח/ת מטלה חדשה שנוצרה במערכת Lego-Tips:

${generatedAssessment.title}

${generatedAssessment.description}

הנחיות:
${generatedAssessment.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

דרישות:
${generatedAssessment.requirements.map((requirement, index) => `${index + 1}. ${requirement}`).join('\n')}

נוצר בעזרת: ${modelUsed}

בברכה
    `.trim());
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleExportToWord = () => {
    if (!generatedAssessment) return;
    
    // יצירת תוכן טקסט פשוט למסמך Word
    const textContent = `
${generatedAssessment.title}

מטרת המשימה:
${generatedAssessment.description}

תיאור המשימה והוראות:
${generatedAssessment.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

דרישות הגשה:
${generatedAssessment.requirements.map((requirement, index) => `${index + 1}. ${requirement}`).join('\n')}

מחוון הערכה:
${generatedRubric.map(crit => `
${crit.name}:
${crit.description}

רמות ביצוע:
${crit.levels.map((level, idx) => `- ${level}`).join('\n')}
`).join('\n')}

נוצר בעזרת: ${modelUsed}
תאריך יצירה: ${new Date().toLocaleDateString('he-IL')}
    `.trim();
    
    // יצירת blob והורדה
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedAssessment.title.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('📄 המטלה יוצאה לקובץ טקסט! (פתח ב-Word)');
  };

  const handleCopyAssignment = () => {
    if (!generatedAssessment) return;
    
    const assignmentText = `
${generatedAssessment.title}

${generatedAssessment.description}

הנחיות:
${generatedAssessment.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

דרישות:
${generatedAssessment.requirements.map((requirement, index) => `${index + 1}. ${requirement}`).join('\n')}

נוצר בעזרת: ${modelUsed}
תאריך: ${new Date().toLocaleDateString('he-IL')}
    `.trim();
    
    navigator.clipboard.writeText(assignmentText).then(() => {
      alert('📋 המטלה הועתקה ללוח!');
    }).catch(() => {
      alert('❌ לא הצלחנו להעתיק ללוח. נסה שוב.');
    });
  };

  // Advanced analysis of course materials for topic generation
  const searchCourseContentOnline = (): string => {
    console.log('🔍 מבצע ניתוח דינמי של חומרי הקורס...');
    
    // ניתוח דינמי של קבצים ופרטי קורס
    const analysisResult = performDynamicAnalysis(
      courseDetails.uploadedFiles,
      courseDetails.courseName,
      courseDetails.faculty,
      courseDetails.department
    );

    if (analysisResult.bestMatch) {
      console.log('✅ זוהה תחום:', analysisResult.bestMatch.domain);
      console.log('🎯 נושאים זוהו:', analysisResult.specificTopics);
      console.log('📊 ציון התאמה:', analysisResult.bestMatch.score);
      
      return `
        **תחום מזוהה:** ${analysisResult.bestMatch.domain}
        **מילות מפתח זוהו:** ${analysisResult.bestMatch.keywords.join(', ')}
        **נושאים ספציפיים:** ${analysisResult.specificTopics.join(', ')}
        **מיקוד מחקר:** ${analysisResult.researchFocus}
        
        **פרטי הקורס:**
        - שם הקורס: ${courseDetails.courseName || 'לא צוין'}
        - פקולטה: ${courseDetails.faculty || 'לא צוין'}
        - מחלקה: ${courseDetails.department || 'לא צוין'}
        - תיאור: ${courseDetails.focusAreas || 'לא צוין'}
        - גודל כיתה: ${courseDetails.studentCount || 'לא צוין'}
        - קבצים מועלים: ${courseDetails.uploadedFiles.length} קבצים
        
        **הוראות למטלה:**
        בצע ניתוח מעמיק המתמקד ב-${analysisResult.specificTopics[0] || 'נושאים מרכזיים'} 
        תוך שילוב התיאוריות והמושגים הרלוונטיים לתחום ${analysisResult.bestMatch.domain}.
        ${analysisResult.specificTopics.length > 1 ? 
          `כלול גם התייחסות ל: ${analysisResult.specificTopics.slice(1, 3).join(', ')}.` : ''}
      `;
    } else {
      console.log('⚠️ לא זוהה תחום ספציפי - משתמש בניתוח כללי');
      
      return `
        **תחום לא זוהה באופן ספציפי**
        
        **פרטי הקורס:**
        - שם הקורס: ${courseDetails.courseName || 'לא צוין'}
        - פקולטה: ${courseDetails.faculty || 'לא צוין'}
        - מחלקה: ${courseDetails.department || 'לא צוין'}
        - תיאור: ${courseDetails.focusAreas || 'לא צוין'}
        - גודל כיתה: ${courseDetails.studentCount || 'לא צוין'}
        - קבצים מועלים: ${courseDetails.uploadedFiles.length} קבצים
        
        **הוראות למטלה:**
        בצע ניתוח אקדמי מתקדם המתאים לרמת הקורס ולתחום הלימוד,
        תוך שילוב תיאוריות ומושגים מרכזיים מתחום ${courseDetails.courseName || 'הלימוד'}.
        ${analysisResult.researchFocus}
      `;
    }
  };

  const [allMethods, setAllMethods] = useState<AssessmentMethod[]>(() => {
    const publicTips = assessmentMethods;
    const privateTips = getPrivateTips();
    const privateTipsWithFlag = privateTips.map(tip => ({ ...tip, isPrivate: true }));
    return [...publicTips, ...privateTipsWithFlag];
  });

  const [recommendationsVersion, setRecommendationsVersion] = useState(0);

  const handleNewTipChange = (field: keyof NewTipData, value: any) => {
    setNewTip(prev => ({ ...prev, [field]: value }));
  };

  const handleNewTipAdvantagesChange = (field: keyof NewTipData['advantages'], value: string) => {
    setNewTip(prev => ({ ...prev, advantages: { ...prev.advantages, [field]: value } }));
  };

  const handleNewTipDisadvantagesChange = (field: keyof NewTipData['disadvantages'], value: string) => {
    setNewTip(prev => ({ ...prev, disadvantages: { ...prev.disadvantages, [field]: value } }));
  };
  
  const handleToolsWithLinksChange = (index: number, field: string, value: string) => {
    const updatedTools = [...newTip.toolsWithLinks];
    updatedTools[index] = { ...updatedTools[index], [field]: value };
    setNewTip(prev => ({ ...prev, toolsWithLinks: updatedTools }));
  };
  
  const handleFurtherReadingChange = (index: number, field: string, value: string) => {
    const updatedReading = [...newTip.furtherReading];
    updatedReading[index] = { ...updatedReading[index], [field]: value };
    setNewTip(prev => ({ ...prev, furtherReading: updatedReading }));
  };

  const handleCheckboxChange = (field: keyof NewTipData, value: string) => {
    const currentValues = newTip[field] as string[];
    const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
    handleNewTipChange(field, newValues);
  };

  // Add option arrays
  const COURSE_CATEGORIES = ['קורס מבוא', 'קורס רב משתתפים', 'קורס מתקדם'];
  const CLASS_SIZES = ['כיתה קטנה (≤30)', 'כיתה בינונית (31-70)', 'כיתה גדולה (71-150)', 'קורס ענק (150+)'];
  const TEACHING_METHODS = ['הרצאה', 'סמינר', 'סדנה', 'מקוון', 'היברידי'];
  const SUBJECT_AREAS = ['מדעי הרוח', 'מדעים מדויקים', 'מדעי החברה', 'הנדסה', 'בריאות'];

  // 🎯 Setup step - מאופטם עם React.memo
  if (currentStep === 'setup') {
    console.log('🔄 [Performance] Rendering MAIN Component - Setup Step');
    return (
      <AppLayout>
        <SetupStep
          courseDetails={courseDetails}
          handleInputChange={handleInputChange}
          handleFileUpload={handleFileUpload}
          handleRemoveFile={handleRemoveFile}
          handleProceedToRecommendations={handleProceedToRecommendations}
          styles={styles}
        />
      </AppLayout>
    );
  }

  // Recommendations step
  if (currentStep === 'recommendations') {
    return (
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              🎯 הטיפים הפדגוגיים המתאימים ביותר עבורך
            </h1>
            <p className={styles.description}>
              על בסיס הפרטים שהזנת, המערכת מציגה את 6 הטיפים הפדגוגיים בעלי ההתאמה הגבוהה ביותר
            </p>
            <Button 
              variant="outline" 
              onClick={handleBackToSetup}
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              ← חזור לעריכת פרטי הקורס
            </Button>
          </div>
          
          <div className={styles.content}>
            {/* Course summary */}
            <div style={{ 
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius)',
              padding: 'var(--spacing-6)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--spacing-6)'
            }}>
              <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)' }}>
                📋 סיכום פרטי הקורס שלך
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-4)'
              }}>
                <div>
                  <strong>שם הקורס:</strong> {courseDetails.courseName}
                </div>
                <div>
                  <strong>פקולטה:</strong> {courseDetails.customFaculty || courseDetails.faculty}
                </div>
                <div>
                  <strong>מחלקה:</strong> {courseDetails.customDepartment || courseDetails.department}
                </div>
                <div>
                  <strong>סוג קורס:</strong> {courseDetails.customCourseType || courseDetails.courseType}
                </div>
                <div>
                  <strong>מספר סטודנטים:</strong> {courseDetails.customStudentCount || courseDetails.studentCount}
                </div>
              </div>
              {courseDetails.focusAreas && (
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <strong>תחומי התמקדות:</strong> {courseDetails.focusAreas}
                </div>
              )}
              {courseDetails.uploadedFiles.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <strong>קבצים שהועלו:</strong> {courseDetails.uploadedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* Top 6 tips */}
            <div style={{ 
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius)',
              padding: 'var(--spacing-6)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--spacing-6)'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-6)'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  flex: 1,
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius)',
                  color: 'white'
                }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: 'var(--spacing-2)' 
                  }}>
                    🏆 הטיפים הפדגוגיים המתאימים ביותר עבורך
                  </h2>
                  <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                    מסודרים לפי אחוז התאמה מדויק על בסיס פרטי הקורס שהזנת
                  </p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: 'var(--spacing-2)' }}>
                    💡 שים לב לאחוז ההתאמה בפינה הימנית העליונה של כל טיפ
                  </p>
                </div>
                
                <Button 
                  onClick={handleAddTip}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-2)',
                    marginRight: 'var(--spacing-4)',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none'
                  }}
                  size="lg"
                >
                  <Plus size={18} />
                  הוסף טיפ משלך
                </Button>
              </div>
              
              <PedagogicalMethodSelector 
                courseParams={courseParameters}
                onMethodsSelect={setSelectedMethods}
                selectedMethods={selectedMethods}
                allMethods={allMethods}
                refreshKey={recommendationsVersion}
              />

              {/* Generate Task Button - מיד אחרי הטיפים */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: 'var(--spacing-6)',
                padding: 'var(--spacing-6)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '2px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
              }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)' }}>
                  🚀 יצירת מטלה מותאמת אישית
                </h3>
                <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--muted-foreground)' }}>
                  המערכת תיצור מטלה מפורטת ומותאמת אישית על בסיס:{selectedMethods.length > 0 ? ` ${selectedMethods.length} טיפים פדגוגיים שנבחרו,` : ''} פרטי הקורס שהזנת{courseDetails.uploadedFiles.length > 0 ? `, ו-${courseDetails.uploadedFiles.length} קבצים שהועלו` : ''}
                </p>
                <Button 
                  size="lg"
                  onClick={() => {
                    console.log('🔥 כפתור "צור מטלה" נלחץ!');
                    handleGenerateTask();
                  }}
                  style={{ 
                    fontSize: '1.1rem',
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    minWidth: '300px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  ✨ צור מטלה מותאמת אישית ✨
                </Button>
              </div>
            </div>


          </div>
        </div>
         <Dialog open={isAddTipModalOpen} onOpenChange={setIsAddTipModalOpen}>
          <DialogContent className={modalStyles.addTipModalContent}>
            <div className={modalStyles.modalHeader}>
              <h2>✨ הוסף טיפ פדגוגי חדש</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddTipModalOpen(false)}><X/></Button>
            </div>
            
            <div className={modalStyles.formContainer}>
              {/* Basic Info */}
              <div className={modalStyles.formSection}>
                <h4>📝 מידע בסיסי</h4>
                <Input required placeholder="כותרת הטיפ *" value={newTip.title} onChange={(e) => handleNewTipChange('title', e.target.value)} />
                <Textarea placeholder="תיאור קצר" value={newTip.shortDescription} onChange={(e) => handleNewTipChange('shortDescription', e.target.value)} />
                <Textarea placeholder="תיאור מלא (אופציונלי)" value={newTip.fullDescription} onChange={(e) => handleNewTipChange('fullDescription', e.target.value)} />
              </div>

              {/* Pedagogical Suitability */}
              <div className={modalStyles.formSection}>
                <h4>🎯 התאמות פדגוגיות</h4>
                <div className={modalStyles.checkboxGroupWrapper}>
                  <div>
                    <h5 className={modalStyles.checkboxGroupTitle}>סוג קורס</h5>
                    <div className={modalStyles.checkboxGroup}>
                      {COURSE_CATEGORIES.map(opt => (
                        <label key={opt}><input type="checkbox" checked={newTip.categories.includes(opt)} onChange={() => handleCheckboxChange('categories', opt)} /> {opt}</label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className={modalStyles.checkboxGroupTitle}>גודל כיתה</h5>
                    <div className={modalStyles.checkboxGroup}>
                      {CLASS_SIZES.map(opt => (
                        <label key={opt}><input type="checkbox" checked={newTip.classSizes.includes(opt)} onChange={() => handleCheckboxChange('classSizes', opt)} /> {opt}</label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className={modalStyles.checkboxGroupTitle}>שיטת הוראה</h5>
                    <div className={modalStyles.checkboxGroup}>
                      {TEACHING_METHODS.map(opt => (
                        <label key={opt}><input type="checkbox" checked={newTip.teachingMethods.includes(opt)} onChange={() => handleCheckboxChange('teachingMethods', opt)} /> {opt}</label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className={modalStyles.checkboxGroupTitle}>תחום דעת</h5>
                    <div className={modalStyles.checkboxGroup}>
                      {SUBJECT_AREAS.map(opt => (
                        <label key={opt}><input type="checkbox" checked={newTip.subjectAreas.includes(opt)} onChange={() => handleCheckboxChange('subjectAreas', opt)} /> {opt}</label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technical Aspects */}
              <div className={modalStyles.formSection}>
                <h4>⚙️ מאפיינים טכניים</h4>
                <Select required onValueChange={(value) => handleNewTipChange('difficulty', value)}>
                  <SelectTrigger><SelectValue placeholder="רמת קושי *" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">קל מאוד (1/5)</SelectItem>
                    <SelectItem value="2">קל (2/5)</SelectItem>
                    <SelectItem value="3">בינוני (3/5)</SelectItem>
                    <SelectItem value="4">מאתגר (4/5)</SelectItem>
                    <SelectItem value="5">מורכב מאוד (5/5)</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleNewTipChange('timeInvestment', value)}>
                  <SelectTrigger><SelectValue placeholder="השקעת זמן נדרשת" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">מינימלית</SelectItem>
                    <SelectItem value="moderate">בינונית</SelectItem>
                    <SelectItem value="substantial">משמעותית</SelectItem>
                    <SelectItem value="extensive">נרחבת</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Advantages/Disadvantages */}
              <div className={modalStyles.formSection}>
                <h4>👍👎 יתרונות וחסרונות</h4>
                <Textarea placeholder="יתרונות פדגוגיים (כל יתרון בשורה חדשה)" value={newTip.advantages.pedagogical} onChange={(e) => handleNewTipAdvantagesChange('pedagogical', e.target.value)} />
                <Textarea placeholder="חסרונות ואתגרים (כל חיסרון בשורה חדשה)" value={newTip.disadvantages.challenges} onChange={(e) => handleNewTipDisadvantagesChange('challenges', e.target.value)} />
              </div>

              {/* Tools & Links */}
              <div className={modalStyles.formSection}>
                <h4>🔗 כלים וקישורים</h4>
                {newTip.toolsWithLinks.map((tool, index) => (
                  <div key={index} className={modalStyles.linkInputGroup}>
                    <Input placeholder="שם הכלי" value={tool.name} onChange={e => handleToolsWithLinksChange(index, 'name', e.target.value)} />
                    <Input placeholder="קישור" value={tool.link} onChange={e => handleToolsWithLinksChange(index, 'link', e.target.value)} />
                    <Textarea placeholder="תיאור" value={tool.description} onChange={e => handleToolsWithLinksChange(index, 'description', e.target.value)} />
                    <Button variant="destructive" onClick={() => handleRemoveToolLink(index)}><Trash2 size={16}/></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddToolLink}>+ הוסף כלי</Button>
              </div>

              {/* Further Reading */}
              <div className={modalStyles.formSection}>
                <h4>📚 מקורות להעמקה</h4>
                {newTip.furtherReading.map((reading, index) => (
                  <div key={index} className={modalStyles.linkInputGroup}>
                    <Input placeholder="כותרת המאמר" value={reading.title} onChange={e => handleFurtherReadingChange(index, 'title', e.target.value)} />
                    <Input placeholder="קישור" value={reading.link} onChange={e => handleFurtherReadingChange(index, 'link', e.target.value)} />
                    <Button variant="destructive" onClick={() => handleRemoveFurtherReading(index)}><Trash2 size={16}/></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddFurtherReading}>+ הוסף מקור</Button>
              </div>
            </div>

            <DialogFooter className={modalStyles.modalFooter}>
              <Button variant="outline" onClick={() => setIsAddTipModalOpen(false)}>ביטול</Button>
              <div className={modalStyles.saveButtons}>
                <Button onClick={() => handleSaveNewTip(false)} disabled={!newTip.title.trim() || !newTip.difficulty}>💾 שמור למאגר הפרטי</Button>
                <Button onClick={() => handleSaveNewTip(true)} disabled={!newTip.title.trim() || !newTip.difficulty}>🌟 הוסף למאגר הציבורי</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    );
  }

  // Task generation step  
  if (currentStep === 'task-generation') {
    console.log('🔍 Task generation step - DEBUG:', {
      isLoading: loadingState.isLoading,
      hasRubricHtml: !!rubricHtml,
      rubricHtmlLength: rubricHtml?.length || 0,
      modelUsed: modelUsed,
      error: error
    });

    return (
      <AppLayout>
        <div className={styles.container}>
          {loadingState.isLoading ? (
            // Task generation progress
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto', 
              textAlign: 'center',
              padding: 'var(--spacing-8)' 
            }}>
              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  marginBottom: 'var(--spacing-2)',
                  color: 'var(--primary)'
                }}>
                  🤖 יוצר מטלה מותאמת אישית
                </h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                  הבינה המלאכותית מנתחת את הפרטים ויוצרת מטלה מותאמת אישית
                </p>
              </div>

              {/* Spinner */}
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto var(--spacing-6)',
                border: '4px solid var(--muted)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              ` }} />

              {/* Progress info */}
              <div style={{ 
                marginBottom: 'var(--spacing-6)',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <p style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  {loadingState.message}
                </p>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  זמן משוער לסיום: {loadingState.estimatedTime} שניות
                </p>
              </div>

              {/* Checklist */}
              <div style={{ 
                textAlign: 'right',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                padding: 'var(--spacing-6)'
              }}>
                <h3 style={{ 
                  marginBottom: 'var(--spacing-4)',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  📋 תהליך יצירת המטלה
                </h3>
                
                {[
                  'מנתח את פרטי הקורס',
                  'בוחן קבצים שהועלו', 
                  'מחשב התאמות פדגוגיות',
                  'משלב טיפים נבחרים',
                  'חיפוש קורסים דומים באינטרנט',
                  'יוצר מטלה אינטגרטיבית',
                  'בונה מחוון הערכה מפורט'
                ].map((step, index) => {
                  const isCompleted = index < loadingState.currentStepIndex;
                  const isCurrent = index === loadingState.currentStepIndex;
                  
                  return (
                    <div key={index} style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      marginBottom: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      backgroundColor: isCompleted ? '#dcfce7' : isCurrent ? '#e0f2fe' : 'var(--card)',
                      color: isCompleted ? '#15803d' : isCurrent ? '#0369a1' : 'var(--foreground)',
                      borderRadius: 'var(--radius)',
                      transition: 'all 0.3s ease',
                      border: isCompleted ? '1px solid #22c55e' : isCurrent ? '1px solid #0ea5e9' : '1px solid var(--border)',
                      transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isCurrent ? '0 4px 12px rgba(14, 165, 233, 0.1)' : 'none'
                    }}>
                      <div style={{ 
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? '#22c55e' : isCurrent ? '#0ea5e9' : 'var(--border)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                      }}>
                        {isCompleted ? '✓' : isCurrent ? '⚡' : index + 1}
                      </div>
                      <span style={{ fontWeight: isCompleted || isCurrent ? '600' : 'normal' }}>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ 
                marginTop: 'var(--spacing-6)',
                padding: 'var(--spacing-4)',
                backgroundColor: '#e0f2fe',
                borderRadius: 'var(--radius)'
              }}>
                <p style={{ 
                  fontSize: '0.9rem',
                  color: '#0369a1',
                  fontStyle: 'italic'
                }}>
                  💡 הבינה המלאכותית עובדת כעת על יצירת מטלה מותאמת אישית עבורך
                </p>
              </div>
            </div>
                      ) : error ? (
            // Error state
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto', 
              textAlign: 'center',
              padding: 'var(--spacing-8)' 
            }}>
              <div style={{
                backgroundColor: 'var(--destructive/10)',
                border: '1px solid var(--destructive)',
                borderRadius: 'var(--radius)',
                padding: 'var(--spacing-6)',
                marginBottom: 'var(--spacing-4)'
              }}>
                <h2 style={{ color: 'var(--destructive)', marginBottom: 'var(--spacing-4)' }}>
                  ⚠️ שגיאה ביצירת המטלה
                </h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--spacing-4)' }}>
                  {error}
                </p>
                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'center' }}>
                  <Button onClick={() => {
                    console.log('🔄 Retry after error');
                    setShouldGenerateTask(false);
                    setTimeout(() => setShouldGenerateTask(true), 100);
                  }}>
                    🔄 נסה שוב
                  </Button>
                  <Button variant="outline" onClick={() => {
                    console.log('🏠 Back to setup after error');
                    setCurrentStep('setup');
                    setShouldGenerateTask(false);
                  }}>
                    🏠 חזור להתחלה
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Task display using new component
            <GeneratedAssessmentDisplay
              htmlContent={rubricHtml || ''}
              modelUsed={modelUsed || 'Unknown'}
              createdAt={new Date()}
              courseDetails={{
                courseName: courseDetails.courseName,
                faculty: courseDetails.faculty,
                department: courseDetails.department,
              }}
              groundingMode={groundingMode}
              sourcesUsed={sourcesUsed}
              apa7References={apa7References}
              materialQualityReport={materialQualityReport}
              rubricCriteria={generatedRubric}
              onRetry={() => {
                console.log('🔄 Retry generation triggered');
                setShouldGenerateTask(false);
                setTimeout(() => setShouldGenerateTask(true), 100);
              }}
            />
          )}
        </div>
      </AppLayout>
    );
  }

  return null;
}
