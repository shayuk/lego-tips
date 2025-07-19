import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Info, X, Star, ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { Dialog } from "../components/Dialog";
import { assessmentMethods, type AssessmentMethodCategory, type AssessmentMethod } from "../helpers/assessmentTypes";
import styles from "./my-assessments.module.css";

// Mock data for user's assessments. In a real app, this would come from an API.
const mockUserAssessments = [
  {
    id: "asmt_1",
    title: "מבוא לפסיכולוגיה - מבחן אמצע סמסטר",
    description: "מבחן קצר מבוסס על 5 פרקים ראשונים של הקורס.",
    lastModified: "2024-07-15T10:30:00Z",
    status: "Published",
  },
  {
    id: "asmt_2",
    title: "סדנת כתיבה מתקדמת - הגשת פורטפוליו",
    description: "איסוף עבודות לאורך הסמסטר להערכת התקדמות.",
    lastModified: "2024-07-12T15:00:00Z",
    status: "Draft",
  },
  {
    id: "asmt_3",
    title: "אתגר בינה מלאכותית - ניתוח אירוע",
    description: "משימת ניתוח אירוע אקטואלי באמצעות כלי AI.",
    lastModified: "2024-06-28T09:00:00Z",
    status: "Archived",
  },
];

type UserAssessment = (typeof mockUserAssessments)[0];

const AssessmentCard = ({ assessment }: { assessment: UserAssessment }) => (
  <div className={styles.assessmentCard}>
    <div className={styles.assessmentInfo}>
      <h3 className={styles.assessmentTitle}>{assessment.title}</h3>
      <p className={styles.assessmentDescription}>{assessment.description}</p>
      <div className={styles.assessmentMeta}>
        <span>
          עודכן לאחרונה: {new Date(assessment.lastModified).toLocaleDateString("he-IL")}
        </span>
        <Badge
          variant={
            assessment.status === "Published"
              ? "default"
              : assessment.status === "Draft"
              ? "outline"
              : "secondary"
          }
        >
          {assessment.status}
        </Badge>
      </div>
    </div>
    <div className={styles.assessmentActions}>
      <Button variant="ghost" size="icon">
        <Edit size={18} />
      </Button>
      <Button variant="ghost" size="icon" className={styles.destructiveAction}>
        <Trash2 size={18} />
      </Button>
    </div>
  </div>
);

const DifficultyStars = ({ level }: { level: number }) => {
  return (
    <div className={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className={i < level ? styles.filledStar : styles.emptyStar} />
      ))}
    </div>
  );
};

// פונקציה לתיאור כלים
const getToolDescription = (tool: string): string => {
  const toolDescriptions: Record<string, string> = {
    // מערכות LMS
    'Moodle': 'מערכת ניהול למידה עם יכולות הערכה וחידונים מתקדמים',
    'Moodle Quiz': 'מערכת חידונים אוטומטיים במודל עם תזמון וניקוד',
    'Blackboard': 'מערכת ניהול למידה מתקדמת לאוניברסיטאות',
    'Canvas': 'פלטפורמה חינוכית מתקדמת עם כלי הערכה',
    'מערכת LMS של האוניברסיטה': 'מערכת הלמידה הרשמית של המוסד',
    'Google Classroom': 'כלי ניהול כיתות והגשות מבית Google',
    
    // כלי הערכה וחידונים
    'Kahoot': 'חידונים אינטראקטיביים בזמן אמת עם הצבעה',
    'Google Forms': 'יצירת סקרים ובחינות מקוונות פשוטות',
    'Mentimeter': 'הצבעות ושאלות אינטראקטיביות במצגות',
    'Quizizz': 'חידונים מקוונים עם משוב מיידי וניקוד',
    'Socrative': 'מערכת הצבעה ובחינות בזמן אמת',
    'Peergrade': 'מערכת הערכה הדדית בין תלמידים',
    'Turnitin PeerMark': 'כלי הערכה עמיתים עם בדיקת גניבה',
    
    // כלי AI וטכנולוגיה
    'ChatGPT': 'מערכת AI לשיחה וניתוח טקסטים',
    'Claude': 'מערכת AI מתקדמת לניתוח וכתיבה',
    'Gemini': 'מערכת AI של Google לשיחה ומחקר',
    'Perplexity': 'מנוע חיפוש AI עם מקורות מהימנים',
    'כלי השוואה': 'כלים לניתוח השוואתי של תוכן',
    'כלי fact-checking': 'כלים לאימות מידע ובדיקת מקורות',
    
    // שיתוף פעולה וניהול פרויקטים
    'Google Docs': 'עריכת מסמכים שיתופית בזמן אמת',
    'Google Workspace': 'חבילת כלי שיתוף פעולה של Google',
    'Notion': 'מרחב עבודה דיגיטלי לארגון מידע ופרויקטים',
    'Trello': 'ניהול פרויקטים ומשימות בכרטיסיות',
    'Slack': 'תקשורת צוותית ושיתוף קבצים',
    'Microsoft Teams': 'פלטפורמה לשיתוף פעולה וועידות',
    'Miro': 'לוח לבן דיגיטלי לעבודה שיתופית',
    'Padlet': 'לוח וירטואלי לאיסוף רעיונות ותכנים',
    
    // תקשורת ווידאו
    'Zoom': 'פלטפורמה לשיעורים מקוונים וועידות וידאו',
    'Teams': 'פלטפורמה לשיתוף פעולה וועידות של מיקרוסופט',
    'Breakout Rooms': 'חדרי עבודה קטנים בסביבות למידה מקוונות',
    'הקלטה לתיעוד': 'הקלטת פגישות ושיעורים לבדיקה',
    'הקלטה וצילום': 'תיעוד הפגישות והדיונים',
    
    // יצירת תוכן ופורטפוליו
    'Google Sites': 'בניית אתרים פשוטים לפרויקטים',
    'Seesaw': 'פלטפורמה לפורטפוליו דיגיטלי',
    'Mahara': 'מערכת פורטפוליו אקדמי מתקדמת',
    'OneNote': 'מערכת רשימות וארגון מידע',
    'בלוג אישי': 'פלטפורמה לכתיבה אישית ורפלקציה',
    'Canva': 'עיצוב גרפי פשוט ליצירת חומרים חזותיים',
    'Loom': 'הקלטת מסך וסרטונים להסברים',
    
    // מחקר ומידע
    'Google Scholar': 'מנוע חיפוש מאמרים אקדמיים',
    'אתרי חדשות': 'מקורות מידע עכשוויים וחדשות',
    'מאגרי מאמרים': 'בסיסי נתונים אקדמיים',
    'כלי חיפוש מתקדמים': 'כלים מתקדמים לחיפוש מידע',
    'מאגרי מידע עכשוויים': 'בסיסי נתונים מעודכנים',
    
    // פיתוח ובדיקה
    'GitHub': 'מערכת ניהול קוד ושיתוף פעולה',
    'עורכי קוד': 'כלים לכתיבת ועריכת קוד',
    'מערכות בדיקה אוטומטיות': 'כלים לבדיקה אוטומטית של קוד',
    'כלי שיתוף': 'פלטפורמות לשיתוף קוד ופרויקטים',
    
    // מתקדמים וסימולציה
    'פלטפורמות סימולציה': 'כלים לסימולציה ומידול',
    'VR/AR': 'מציאות מדומה ומורחבת לחוויות למידה',
    'משחקי תפקידים דיגיטליים': 'משחקים חינוכיים ללמידה',
    'כלי תיעוד': 'מערכות לתיעוד ומעקב פעילות',
    'רשימת שאלות': 'מאגר שאלות מובנה ומסודר',
    
    // דיון ורפלקציה
    'פורומי דיון': 'פלטפורמות לדיונים מקוונים',
    'יומני למידה דיגיטליים': 'כלים לרפלקציה ומעקב למידה',
    'כלי כתיבה רפלקטיבית': 'פלטפורמות לכתיבה והגיון',
    'פלטפורמות דיון': 'מערכות לדיון ושיח מקוון',
    'יומני עבודה': 'כלים לתיעוד תהליכי עבודה',
    
    // ספציפיים
    'הקלטות כיתתיות': 'הקלטות שיעורים וחומרים מהכיתה',
    'חומרי מחקר פרטיים': 'חומרים ייחודיים של המרצה',
    'דיונים סוקרטיים מוקלטים': 'הקלטות דיונים מהכיתה',
    'מקורות יחודיים': 'חומרים בלעדיים לקורס',
    'ארגון השוואות': 'כלים לניתוח השוואתי מובנה',
    'סקרים דיגיטליים': 'כלי יצירת סקרים ומחקר',
    'כלי ניתוח נתונים': 'מערכות לניתוח מידע ונתונים',
    'ספרות מחקר': 'מאגרי מחקר ספרות אקדמית',
    'רשתות חברתיות': 'פלטפורמות מידע חברתיות'
  };
  
  return toolDescriptions[tool] || `כלי דיגיטלי מומלץ: ${tool}`;
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
  
  if (!method) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} dir="rtl" onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{method.title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className={styles.closeButton}
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

          {/* Tools Section */}
          {(method.toolsWithLinks || method.suggested_tools.length > 0) && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>כלים מומלצים</h3>
              <div className={styles.toolsSection}>
                <p className={styles.toolsDescription}>
                  כלים דיגיטליים מומלצים לביצוע השיטה הפדגוגית:
                </p>
                <div className={styles.toolsList}>
                  {method.toolsWithLinks ? (
                    method.toolsWithLinks.map((tool, index) => (
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
                    ))
                  ) : (
                    method.suggested_tools.map((tool, index) => (
                      <div key={index} className={styles.toolItem}>
                        <div className={styles.toolName}>{tool}</div>
                        <div className={styles.toolDescription}>
                          {getToolDescription(tool)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
    </Dialog>
  );
};

const MethodCard = ({ 
  method, 
  onShowDetails 
}: { 
  method: AssessmentMethod; 
  onShowDetails: (method: AssessmentMethod) => void;
}) => (
  <div className={styles.methodCard}>
    <div className={styles.methodHeader}>
      <h3 className={styles.methodTitle}>{method.title}</h3>
      <Button 
        variant="ghost" 
        size="icon-sm"
        onClick={() => onShowDetails(method)}
      >
        <Info size={16} />
      </Button>
    </div>
    <p className={styles.methodDescription}>
      {method.description.length > 120 
        ? `${method.description.substring(0, 120)}...` 
        : method.description}
    </p>
    <div className={styles.methodTags}>
      {method.categories.map((cat) => (
        <Badge key={cat} variant="secondary">
          {
            {
              introduction: "קורסי מבוא",
              large: "כיתות גדולות",
              advanced: "קורסים מתקדמים",
            }[cat]
          }
        </Badge>
      ))}
    </div>
    <div className={styles.methodFooter}>
      <div className={styles.methodComplexity}>
        <span>קושי: </span>
        <DifficultyStars level={method.implementation_difficulty} />
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onShowDetails(method)}
      >
        מידע נוסף
      </Button>
    </div>
  </div>
);

export default function MyAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AssessmentMethodCategory | "all">("all");
  const [selectedMethodForModal, setSelectedMethodForModal] = useState<AssessmentMethod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowMethodDetails = (method: AssessmentMethod) => {
    setSelectedMethodForModal(method);
    setIsModalOpen(true);
  };

  const filteredMethods = useMemo(() => {
    return assessmentMethods.filter((method) => {
      const matchesCategory =
        activeCategory === "all" || method.categories.includes(activeCategory);
      const matchesSearch =
        method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Helmet>
        <title>ההערכות שלי - AssessmentBuilder</title>
        <meta
          name="description"
          content="נהל את ההערכות שלך וגלה שיטות הערכה חלופיות חדשניות."
        />
      </Helmet>
      
      <AppLayout>
        <div className={styles.container} dir="rtl">
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>ההערכות שלי</h1>
            <p className={styles.subtitle}>
              נהל את ההערכות שלך וגלה שיטות הערכה חדשות.
            </p>
          </div>
          <Link to="/assessment-builder">
            <Button size="lg">
              <Plus size={20} />
              <span>צור הערכה חדשה</span>
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="my-assessments" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="my-assessments">ההערכות שלי</TabsTrigger>
            <TabsTrigger value="explore-methods">גלה שיטות הערכה</TabsTrigger>
          </TabsList>

          <TabsContent value="my-assessments" className={styles.tabContent}>
            {mockUserAssessments.length > 0 ? (
              <div className={styles.assessmentsGrid}>
                {mockUserAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h2>עדיין לא יצרת הערכות.</h2>
                <p>לחץ על "צור הערכה חדשה" כדי להתחיל.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explore-methods" className={styles.tabContent}>
            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <Search size={20} className={styles.searchIcon} />
                <Input
                  type="search"
                  placeholder="חפש שיטת הערכה..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.categoryFilters}>
                <Button
                  variant={activeCategory === "all" ? "primary" : "outline"}
                  onClick={() => setActiveCategory("all")}
                >
                  הכל
                </Button>
                <Button
                  variant={
                    activeCategory === "introduction" ? "primary" : "outline"
                  }
                  onClick={() => setActiveCategory("introduction")}
                >
                  קורסי מבוא
                </Button>
                <Button
                  variant={activeCategory === "large" ? "primary" : "outline"}
                  onClick={() => setActiveCategory("large")}
                >
                  כיתות גדולות
                </Button>
                <Button
                  variant={
                    activeCategory === "advanced" ? "primary" : "outline"
                  }
                  onClick={() => setActiveCategory("advanced")}
                >
                  קורסים מתקדמים
                </Button>
              </div>
            </div>
            <div className={styles.methodsGrid}>
              {filteredMethods.map((method) => (
                <MethodCard 
                  key={method.id} 
                  method={method} 
                  onShowDetails={handleShowMethodDetails}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <MethodDetailsModal
          method={selectedMethodForModal}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMethodForModal(null);
          }}
        />
        </div>
      </AppLayout>
    </>
  );
}
