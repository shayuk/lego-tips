import { useState, useMemo } from 'react';
import { CourseParameters, AssessmentMethod, assessmentMethods } from '../helpers/assessmentTypes';
import { getTopCompatibleMethods } from '../helpers/compatibilityCalculator';
import { Button } from './Button';
import { Badge } from './Badge';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Dialog } from './Dialog';
import { Star, Sparkles, ThumbsUp, ThumbsDown, Wrench, Plus, X } from 'lucide-react';
import styles from './PedagogicalMethodSelector.module.css';

interface PedagogicalMethodSelectorProps {
  courseParameters: CourseParameters;
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

export const PedagogicalMethodSelector = ({
  courseParameters,
  onSelectMethods,
  className,
}: PedagogicalMethodSelectorProps) => {
  const [selectedMethodIds, setSelectedMethodIds] = useState<Set<string>>(new Set());
  const [customMethods, setCustomMethods] = useState<AssessmentMethod[]>([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [customMethodForm, setCustomMethodForm] = useState({
    title: '',
    description: '',
  });

  const recommendedMethods = useMemo(() => {
    return getTopCompatibleMethods(courseParameters, 6);
  }, [courseParameters]);

  const allMethods = useMemo(() => {
    return [...recommendedMethods, ...customMethods];
  }, [recommendedMethods, customMethods]);

  const availableOtherMethods = useMemo(() => {
    const recommendedIds = new Set(recommendedMethods.map(m => m.id));
    return assessmentMethods.filter(method => !recommendedIds.has(method.id));
  }, [recommendedMethods]);

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
    onSelectMethods(selectedMethods);
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
          בחרנו עבורך את שיטות ההערכה המתאימות ביותר על סמך מאפייני הקורס שהזנת. ניתן לבחור שיטה אחת או יותר.
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
                <div className={styles.compatibilityBadge}>
                  <Sparkles size={16} />
                  <span>{method.id.startsWith('custom-') ? '100' : '95'}% התאמה</span>
                </div>
              </div>
              <p className={styles.description}>{method.description}</p>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <h4 className={styles.detailTitle}><ThumbsUp size={16} /> יתרונות</h4>
                  <ul className={styles.list}>
                    {method.advantages.pedagogical.slice(0, 1).map(adv => <li key={adv}>{adv}</li>)}
                    {method.advantages.practical.slice(0, 1).map(adv => <li key={adv}>{adv}</li>)}
                  </ul>
                </div>
                <div className={styles.detailItem}>
                  <h4 className={styles.detailTitle}><ThumbsDown size={16} /> חסרונות</h4>
                  <ul className={styles.list}>
                    {method.disadvantages.challenges.slice(0, 1).map(dis => <li key={dis}>{dis}</li>)}
                    {method.disadvantages.limitations.slice(0, 1).map(dis => <li key={dis}>{dis}</li>)}
                  </ul>
                </div>
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

      <div className={styles.actions}>
        <Button
          size="lg"
          onClick={handleCreateAssessment}
          disabled={selectedMethodIds.size === 0}
        >
          צור מטלה מהשיטות שנבחרו ({selectedMethodIds.size})
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
    </div>
  );
};