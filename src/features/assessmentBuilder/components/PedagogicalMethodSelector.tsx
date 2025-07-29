import React, { useState, useMemo } from 'react';
import { CourseParameters, AssessmentMethod, assessmentMethods } from '../lib/assessmentTypes.tsx'; 
import { getTopCompatibleMethods } from '../../../helpers/compatibilityCalculator'; // נתיב מתוקן
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Checkbox } from '../../../components/Checkbox';
import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import { Dialog } from '../../../components/Dialog';
import { Star, Sparkles, Wrench, Plus, X, Info, ChevronDown } from 'lucide-react';
import styles from './PedagogicalMethodSelector.module.css';

interface PedagogicalMethodSelectorProps {
  courseParameters: CourseParameters;
  courseContent?: string;
  onSelectMethods: (selectedMethods: AssessmentMethod[]) => void;
  className?: string;
}

const DifficultyStars = ({ level }: { level: number }) => {
  return (
    <div className={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className={i < level ? styles.filledStar : styles.emptyStar} />
      ))}
    </div>
  );
};

// Modal component for displaying detailed method information
const MethodDetailsModal = ({ 
  method, 
  isOpen, 
  onClose 
}: { 
  method: AssessmentMethod | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Handle escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!method) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="method-modal-title"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className={styles.modalContent} dir="rtl">
        <div className={styles.modalHeader}>
          <h2 id="method-modal-title" className={styles.modalTitle}>{method.title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="סגור"
          >
            <X size={20} />
          </Button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>תיאור</h3>
            <p className={styles.description}>{method.description}</p>
            
            {/* תיאור מלא בפורמט דרופ-דאון */}
            {method.fullDescription && (
              <div className={styles.fullDescriptionSection}>
                <button
                  className={styles.expandButton}
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  <span>תיאור מלא</span>
                  <ChevronDown 
                    size={20} 
                    className={`${styles.chevron} ${isDescriptionExpanded ? styles.chevronExpanded : ''}`}
                  />
                </button>
                
                {isDescriptionExpanded && (
                  <div className={styles.expandedContent}>
                    <div className={styles.fullDescriptionText}>
                      {method.fullDescription.split('\n').map((paragraph, index) => (
                        <p key={index} className={styles.fullDescriptionParagraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>יתרונות</h3>
            <div className={styles.advantagesGrid}>
              <div className={styles.advantageCategory}>
                <h4 className={styles.categoryTitle}>יתרונות פדגוגיים:</h4>
                <ul className={styles.modalList}>
                  {method.advantages.pedagogical.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.advantageCategory}>
                <h4 className={styles.categoryTitle}>יתרונות מעשיים:</h4>
                <ul className={styles.modalList}>
                  {method.advantages.practical.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.advantageCategory}>
                <h4 className={styles.categoryTitle}>עידוד מעורבות:</h4>
                <ul className={styles.modalList}>
                  {method.advantages.student_engagement.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>חסרונות ואתגרים</h3>
            <div className={styles.disadvantagesGrid}>
              <div className={styles.disadvantageCategory}>
                <h4 className={styles.categoryTitle}>אתגרים:</h4>
                <ul className={styles.modalList}>
                  {method.disadvantages.challenges.map((dis, index) => (
                    <li key={index}>{dis}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.disadvantageCategory}>
                <h4 className={styles.categoryTitle}>מגבלות:</h4>
                <ul className={styles.modalList}>
                  {method.disadvantages.limitations.map((dis, index) => (
                    <li key={index}>{dis}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.disadvantageCategory}>
                <h4 className={styles.categoryTitle}>דרישות משאבים:</h4>
                <ul className={styles.modalList}>
                  {method.disadvantages.resource_requirements.map((dis, index) => (
                    <li key={index}>{dis}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>מאפיינים טכניים</h3>
            <div className={styles.technicalInfo}>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>רמת קושי ביישום:</span>
                <DifficultyStars level={method.implementation_difficulty} />
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>השקעת זמן:</span>
                <Badge variant="secondary">
                  {method.time_investment === 'minimal' ? 'מינימלי' :
                   method.time_investment === 'moderate' ? 'בינוני' :
                   method.time_investment === 'substantial' ? 'רב' : 'נרחב'}
                </Badge>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>מתאים לכיתות:</span>
                <div className={styles.badgeGroup}>
                  {method.class_size_suitability.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size === 'small' ? 'קטנות' :
                       size === 'medium' ? 'בינוניות' :
                       size === 'large' ? 'גדולות' : 'גדולות מאוד'}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>קטגוריות:</span>
                <div className={styles.badgeGroup}>
                  {method.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category === 'introduction' ? 'מבוא' :
                       category === 'large' ? 'קורס גדול' : 'מתקדם'}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>תחומי לימוד מתאימים:</span>
                <div className={styles.badgeGroup}>
                  {method.subject_areas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area === 'humanities' ? 'מדעי הרוח' :
                       area === 'social-sciences' ? 'מדעי החברה' :
                       area === 'natural-sciences' ? 'מדעי הטבע' :
                       area === 'engineering' ? 'הנדסה' :
                       area === 'arts' ? 'אמנויות' :
                       area === 'business' ? 'עסקים' :
                       area === 'law' ? 'משפטים' :
                       area === 'medicine' ? 'רפואה' :
                       area === 'education' ? 'חינוך' : 'בין-תחומי'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>הנחיות יישום</h3>
            <ul className={styles.modalList}>
              {method.implementation_guidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </div>

          {/* Rubric Template */}
          {method.rubric_template && method.rubric_template.length > 0 && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>מחוון הערכה מוצע</h3>
              <div className={styles.rubricContainer}>
                {method.rubric_template.map((criteria, index) => (
                  <div key={index} className={styles.rubricCriteria}>
                    <h4 className={styles.criteriaTitle}>
                      {criteria.name} ({criteria.weight}%)
                    </h4>
                    <p className={styles.criteriaDescription}>{criteria.description}</p>
                    <div className={styles.rubricLevels}>
                      <div className={styles.rubricLevel}>
                        <span className={styles.levelName}>מצוין:</span>
                        <span className={styles.levelDescription}>{criteria.levels.excellent}</span>
                      </div>
                      <div className={styles.rubricLevel}>
                        <span className={styles.levelName}>טוב:</span>
                        <span className={styles.levelDescription}>{criteria.levels.good}</span>
                      </div>
                      <div className={styles.rubricLevel}>
                        <span className={styles.levelName}>מספק:</span>
                        <span className={styles.levelDescription}>{criteria.levels.satisfactory}</span>
                      </div>
                      <div className={styles.rubricLevel}>
                        <span className={styles.levelName}>דורש שיפור:</span>
                        <span className={styles.levelDescription}>{criteria.levels.needs_improvement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {(method.toolsWithLinks || method.suggested_tools.length > 0) && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>כלים מומלצים</h3>
              {method.toolsWithLinks ? (
                <div className={styles.toolsList}>
                  {method.toolsWithLinks.map((tool, index) => (
                    <div key={index} className={styles.toolItem}>
                      <div className={styles.toolName}>
                        <a 
                          href={tool.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.toolLink}
                        >
                          {tool.name}
                        </a>
                      </div>
                      <div className={styles.toolDescription}>
                        {tool.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.toolsGrid}>
                  {method.suggested_tools.map((tool, index) => (
                    <Badge key={index} variant="secondary">{tool}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>מתאים לשיטות הוראה</h3>
            <div className={styles.badgeGroup}>
              {method.teaching_methods.map((method_type, index) => (
                <Badge key={index} variant="outline">
                  {method_type === 'lecture' ? 'הרצאה' :
                   method_type === 'seminar' ? 'סמינר' :
                   method_type === 'workshop' ? 'סדנה' :
                   method_type === 'lab' ? 'מעבדה' :
                   method_type === 'fieldwork' ? 'עבודת שטח' :
                   method_type === 'online' ? 'מקוון' : 'היברידי'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Further Reading */}
          {method.furtherReading && method.furtherReading.length > 0 && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>מקורות להעמקה</h3>
              <ul className={styles.modalList}>
                {method.furtherReading.map((item, index) => (
                  <li key={index} className={styles.readingItem}>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.readingLink}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PedagogicalMethodSelector = ({
  courseParameters,
  courseContent,
  onSelectMethods,
  className,
}: PedagogicalMethodSelectorProps) => {
  // State for modal management
  const [selectedMethodForModal, setSelectedMethodForModal] = useState<AssessmentMethod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for selected methods
  const [selectedMethodIds, setSelectedMethodIds] = useState<Set<string>>(new Set());

  // פונקציה לחישוב בונוס על בסיס תוכן הקורס
  const calculateContentBonus = (method: AssessmentMethod): number => {
    if (!courseContent || 
        courseContent.trim().length < 50 || 
        courseContent.includes('לא הועלה תוכן קורס ספציפי')) {
      return 0; // אין בונוס אם אין תוכן ספציפי
    }

    let bonus = 0; // בונוס נוסף על הציון הבסיסי
    const content = courseContent.toLowerCase();
    
    // ניתוח מילות מפתח
    const keywords = {
      // מילות מפתח לשיטות פדגוגיות ספציפיות
      group_work: ['קבוצ', 'צוות', 'שיתוף', 'עבודה משותפת', 'פרויקט', 'קולקטיב'],
      current_events: ['אקטואל', 'חדש', 'עכשווי', 'אירוע', 'חדשות', 'מעוכב', 'זמן אמת', 'עכשיו'],
      ai_analysis: ['בינה מלאכותית', 'ai', 'טכנולוגי', 'דיגיטל', 'מחשב', 'אלגוריתם', 'נתונים', 'ניתוח נתונים'],
      reflection: ['רפלקציה', 'חשיבה', 'הרהור', 'הגיון', 'מחשבה', 'חוויה אישית', 'למידה אישית'],
      article_analysis: ['מאמר', 'טקסט', 'ספרות', 'חומר', 'ניתוח', 'הקושי', 'פרשנות', 'ביקורת'],
      obfuscation: ['התחכמות', 'חומר יחיד', 'הקלטה', 'ייחודי', 'לא זמין', 'פרטי', 'מיוחד'],
      method_8200: ['תיאוריה', 'מודל', 'גישה', 'סיג', 'חוק', 'עקרון', 'שיטה', 'מתודולוגי']
    };

    // בדיקת התאמה ספציפית לכל שיטה
    switch (method.id) {
      case 'am_11': // עבודה בקבוצות
        if (keywords.group_work.some(word => content.includes(word))) bonus += 20;
        if (content.includes('פרויקט') || content.includes('מטלה גדולה')) bonus += 10;
        break;
        
      case 'am_14': // אירועים אקטואליים
        if (keywords.current_events.some(word => content.includes(word))) bonus += 25;
        if (content.includes('חדשות') || content.includes('עכשיו')) bonus += 10;
        break;
        
      case 'am_05': // ניתוח AI
      case 'am_03': // ניתוח פרומפטים
      case 'am_12': // אתגרים ביקורתיים על AI
        if (keywords.ai_analysis.some(word => content.includes(word))) bonus += 25;
        if (content.includes('chatgpt') || content.includes('claude')) bonus += 15;
        break;
        
      case 'am_04': // רפלקציה
      case 'am_10': // יומני למידה
        if (keywords.reflection.some(word => content.includes(word))) bonus += 20;
        if (content.includes('אישי') || content.includes('חוויה')) bonus += 10;
        break;
        
      case 'am_02': // מטלות התחכמות
        if (keywords.obfuscation.some(word => content.includes(word))) bonus += 30;
        if (content.includes('הקלטה') || content.includes('ייחודי')) bonus += 15;
        break;
        
      case 'am_18': // משימות 8200
        if (keywords.method_8200.some(word => content.includes(word))) bonus += 25;
        if (content.includes('תיאוריה') && content.includes('שימוש')) bonus += 15;
        break;
        
      default:
        // בדיקה כללית למאמרים וניתוח טקסט
        if (keywords.article_analysis.some(word => content.includes(word))) bonus += 10;
    }

     // הגבלת הבונוס למקסימום
     const finalBonus = Math.min(bonus, 30);
     
     // דיבוג - הצגת החישוב
     console.log(`🎯 ניתוח בונוס עבור ${method.title}:`, {
       methodId: method.id,
       calculatedBonus: finalBonus,
       hasContent: !!courseContent && courseContent.trim().length >= 50,
       contentLength: courseContent?.length || 0
     });
     
     return finalBonus;
   };

  const [customMethods, setCustomMethods] = useState<AssessmentMethod[]>([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [customMethodForm, setCustomMethodForm] = useState({
    title: '',
    description: '',
  });

  const recommendedMethods = useMemo(() => {
    // נקבל את השיטות הבסיסיות עם החישוב הבסיסי המתוקן
    const baseMethods = getTopCompatibleMethods(courseParameters, 6);
    
    // אם אין תוכן ספציפי, נחזיר את הציון הבסיסי
    if (!courseContent || 
        courseContent.trim().length < 50 || 
        courseContent.includes('לא הועלה תוכן קורס ספציפי')) {
      return baseMethods; // החזר את הציון הבסיסי שמחושב נכון
    }
    
    // אם יש תוכן, נוסיף בונוס על הציון הבסיסי
    return baseMethods.map(method => ({
      ...method,
      compatibilityScore: Math.min(100, method.compatibilityScore + calculateContentBonus(method))
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [courseParameters, courseContent]);

  const allMethods = useMemo(() => {
    return [...recommendedMethods, ...customMethods];
  }, [recommendedMethods, customMethods]);

  const availableOtherMethods = useMemo(() => {
    const recommendedIds = new Set(recommendedMethods.map(m => m.id));
    return assessmentMethods.filter(method => !recommendedIds.has(method.id));
  }, [recommendedMethods]);

  // Auto-update parent when selection changes
  React.useEffect(() => {
    const selectedMethods = [...allMethods, ...availableOtherMethods].filter(method => selectedMethodIds.has(method.id));
    console.log('🔄 PedagogicalMethodSelector - Auto update:', {
      selectedMethodIdsArray: Array.from(selectedMethodIds),
      selectedMethodsLength: selectedMethods.length,
      selectedMethodsTitles: selectedMethods.map(m => m.title)
    });
    onSelectMethods(selectedMethods);
  }, [selectedMethodIds, allMethods, availableOtherMethods, onSelectMethods]);

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethodIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
  };

  const handleCreateAssessment = () => {
    const selectedMethods = [...allMethods, ...availableOtherMethods].filter(method => selectedMethodIds.has(method.id));
    console.log('🎯 PedagogicalMethodSelector - handleCreateAssessment נקראת');
    console.log('📊 selectedMethodIds:', Array.from(selectedMethodIds));
    console.log('📋 selectedMethods לפני קריאה ל-onSelectMethods:', selectedMethods);
    console.log('📊 allMethods length:', allMethods.length);
    console.log('📊 availableOtherMethods length:', availableOtherMethods.length);
    
    onSelectMethods(selectedMethods);
    console.log('✅ onSelectMethods נקרא עם', selectedMethods.length, 'שיטות');
  };

  const handleAddFromBrowse = (methodId: string) => {
    const method = availableOtherMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedMethodIds(prev => new Set([...prev, methodId]));
    }
  };

  const handleAddCustomMethod = () => {
    if (customMethodForm.title.trim() && customMethodForm.description.trim()) {
      const newMethod: AssessmentMethod = {
        id: `custom-${Date.now()}`,
        title: customMethodForm.title,
        description: customMethodForm.description,
        categories: ['introduction'],
        teaching_methods: ['lecture', 'seminar', 'workshop', 'lab', 'fieldwork', 'online', 'hybrid'],
        class_size_suitability: ['small', 'medium', 'large', 'very-large'],
        subject_areas: ['multidisciplinary'],
        implementation_difficulty: 3,
        advantages: {
          pedagogical: ['טיפ מותאם אישית'],
          practical: ['גמישות בהתאמה'],
          student_engagement: ['מותאם לצרכי הקורס']
        },
        disadvantages: {
          challenges: ['דורש תכנון נוסף'],
          limitations: ['לא נבדק מראש'],
          resource_requirements: ['זמן הכנה נוסף']
        },
        implementation_guidelines: [customMethodForm.description],
        suggested_tools: [],
        time_investment: 'moderate'
      };

      setCustomMethods(prev => [...prev, newMethod]);
      setCustomMethodForm({ title: '', description: '' });
      setShowCustomDialog(false);
    }
  };

  const handleRemoveCustomMethod = (methodId: string) => {
    setCustomMethods(prev => prev.filter(method => method.id !== methodId));
    setSelectedMethodIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(methodId);
      return newSet;
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>שיטות הערכה מומלצות</h2>
        <p className={styles.subtitle}>
          {(!courseContent || courseContent.includes('לא הועלה תוכן קורס ספציפי')) ? (
            <>
              המערכת מציגה המלצות כלליות מכיוון שלא הועלה תוכן ספציפי. 
              <strong> לקבלת המלצות מותאמות יותר, חזור לשלב הקודם והעלה תוכן קורס.</strong>
            </>
          ) : (
            <>
              המערכת מחשבת התאמה אמיתית על בסיס תוכן הקורס שהעלית. 
              אחוזי ההתאמה משתנים לפי התוכן: 
              <span style={{color: '#22c55e', fontWeight: 600}}> ירוק = 85%+</span>, 
              <span style={{color: '#f59e0b', fontWeight: 600}}> כתום = 70-84%</span>, 
              <span style={{color: '#ef4444', fontWeight: 600}}> אדום = מתחת ל-70%</span>
            </>
          )}
        </p>
      </div>

      <div className={styles.grid}>
        {allMethods.map(method => {
          const isSelected = selectedMethodIds.has(method.id);
          return (
            <div
              key={method.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelectMethod(method.id)}
            >
              <div className={styles.cardHeader}>
                <Checkbox
                  id={`method-${method.id}`}
                  checked={isSelected}
                  onChange={() => handleSelectMethod(method.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor={`method-${method.id}`} className={styles.cardTitle} onClick={(e) => e.stopPropagation()}>
                  {method.title}
                </label>
                <div className={`${styles.compatibilityBadge} ${
                  method.id.startsWith('custom-') 
                    ? styles.compatibilityHigh
                    : (() => {
                        const score = (method as any).compatibilityScore || 0;
                        if (score >= 85) return styles.compatibilityHigh;
                        if (score >= 70) return styles.compatibilityMedium;
                        return styles.compatibilityLow;
                      })()
                }`}>
                  <Sparkles size={16} />
                  <span>
                    {method.id.startsWith('custom-') 
                      ? '100' 
                      : (method as any).compatibilityScore || 0
                    }% התאמה
                  </span>
                </div>
              </div>
              <p className={styles.description}>
                {method.description.length > 150 
                  ? `${method.description.substring(0, 150)}...` 
                  : method.description}
              </p>

              <div className={styles.cardActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMethodForModal(method);
                    setIsModalOpen(true);
                  }}
                  className={styles.moreInfoButton}
                >
                  <Info size={16} />
                  מידע נוסף
                </Button>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.difficulty}>
                  <span>רמת קושי ביישום:</span>
                  <DifficultyStars level={method.implementation_difficulty} />
                </div>
                {method.suggested_tools.length > 0 && (
                  <div className={styles.tools}>
                    <Wrench size={16} />
                    <div className={styles.toolBadges}>
                      {method.suggested_tools.slice(0, 2).map(tool => (
                        <Badge key={tool} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {method.id.startsWith('custom-') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomMethod(method.id);
                    }}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                    הסר
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.customMethodSection}>
        <Button
          variant="outline"
          onClick={() => setShowBrowseDialog(true)}
          className={styles.addCustomButton}
        >
          <Plus size={16} />
          עיון בטיפים נוספים
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowCustomDialog(true)}
          className={styles.addCustomButton}
        >
          <Plus size={16} />
          הוסף טיפ מותאם אישית
        </Button>
      </div>



      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <div className={styles.dialogContent}>
          <h3 className={styles.dialogTitle}>הוספת טיפ פדגוגי מותאם אישית</h3>
          <div className={styles.dialogForm}>
            <div className={styles.formGroup}>
              <label htmlFor="customTitle" className={styles.label}>
                כותרת הטיפ
              </label>
              <Input
                id="customTitle"
                value={customMethodForm.title}
                onChange={(e) => setCustomMethodForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="הכנס כותרת לטיפ הפדגוגי"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="customDescription" className={styles.label}>
                תיאור הטיפ
              </label>
              <Textarea
                id="customDescription"
                value={customMethodForm.description}
                onChange={(e) => setCustomMethodForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="הכנס תיאור מפורט של הטיפ הפדגוגי"
                rows={4}
                className={styles.textarea}
              />
            </div>
            <div className={styles.dialogActions}>
              <Button
                variant="outline"
                onClick={() => setShowCustomDialog(false)}
              >
                בטל
              </Button>
              <Button
                onClick={handleAddCustomMethod}
                disabled={!customMethodForm.title.trim() || !customMethodForm.description.trim()}
              >
                הוסף טיפ
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog open={showBrowseDialog} onOpenChange={setShowBrowseDialog}>
        <div className={styles.browseDialogContent}>
          <h3 className={styles.dialogTitle}>טיפים פדגוגיים נוספים</h3>
          <p className={styles.browseSubtitle}>
            בחר טיפים נוספים מהמאגר המלא של שיטות ההערכה
          </p>
          <div className={styles.browseGrid}>
            {availableOtherMethods.map(method => {
              const isSelected = selectedMethodIds.has(method.id);
              return (
                <div
                  key={method.id}
                  className={`${styles.browseCard} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.browseCardHeader}>
                    <h4 className={styles.browseCardTitle}>{method.title}</h4>
                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMethodIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(method.id);
                            return newSet;
                          });
                        } else {
                          handleAddFromBrowse(method.id);
                        }
                      }}
                    >
                      {isSelected ? 'נבחר' : 'בחר'}
                    </Button>
                  </div>
                  <p className={styles.browseCardDescription}>{method.description}</p>
                  <div className={styles.browseCardFooter}>
                    <div className={styles.difficulty}>
                      <span>רמת קושי:</span>
                      <DifficultyStars level={method.implementation_difficulty} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.dialogActions}>
            <Button
              onClick={() => setShowBrowseDialog(false)}
            >
              סגור
            </Button>
          </div>
        </div>
      </Dialog>

      <MethodDetailsModal
        method={selectedMethodForModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMethodForModal(null);
        }}
      />
    </div>
  );
};
