// *** החלף את כל הקובץ שלך בקוד הזה ***

import React, { useState, useMemo } from 'react';
import { assessmentMethods } from '../lib/assessmentMethods';
import { CourseParameters, AssessmentMethod } from '../lib/assessmentTypes';
// אחרי
import { getTopCompatibleMethods } from '../../../helpers/compatibilityCalculator';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/Dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Info, ChevronDown, Check, ExternalLink, Zap, Trash2 } from 'lucide-react';
import styles from './PedagogicalMethodSelector.module.css';

interface PedagogicalMethodSelectorProps {
  courseParams: CourseParameters;
  onMethodsSelect: (methods: AssessmentMethod[]) => void;
  selectedMethods: AssessmentMethod[];
  allMethods?: AssessmentMethod[];
  refreshKey?: number;
  onDeletePrivateTip?: (tipId: string) => void;
}

const DifficultyStars = ({ level }: { level: number }) => (
  <div className={styles.stars}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < level ? styles.filledStar : styles.emptyStar} />
    ))}
  </div>
);

const CompatibilityBadge = ({ score }: { score: number }) => {
  const getBadgeStyle = () => {
    if (score > 85) return styles.badgeExcellent;
    if (score > 70) return styles.badgeGood;
    if (score > 50) return styles.badgeFair;
    return styles.badgeLow;
  };

  return (
    <div className={`${styles.compatibilityBadge} ${getBadgeStyle()}`}>
      <Zap size={14} />
      <span>{score}% התאמה</span>
    </div>
  );
};

export const PedagogicalMethodSelector: React.FC<PedagogicalMethodSelectorProps> = ({
  courseParams,
  onMethodsSelect,
  selectedMethods,
  allMethods,
  refreshKey,
  onDeletePrivateTip
}) => {

  const recommendedMethods = useMemo(() => {
    const methodsToUse = allMethods || assessmentMethods;
    const filteredMethods = methodsToUse.filter((method: AssessmentMethod) => {
      if ((method as any).isPrivate) {
        return (method as any).isPrivate === true;
      }
      return true;
    });
    return getTopCompatibleMethods(courseParams, 6, filteredMethods);
  }, [courseParams, allMethods, refreshKey]);

  const recommendedIds = useMemo(() => new Set(recommendedMethods.map((m: AssessmentMethod) => m.id)), [recommendedMethods]);

  const otherMethods = useMemo(() => {
    const methodsToUse = allMethods || assessmentMethods;
    const filteredMethods = methodsToUse.filter((method: AssessmentMethod) => {
      if ((method as any).isPrivate) {
        return (method as any).isPrivate === true;
      }
      return true;
    });
    return filteredMethods
      .filter((method: AssessmentMethod) => !recommendedIds.has(method.id))
      .sort((a: AssessmentMethod, b: AssessmentMethod) => a.title.localeCompare(b.title));
  }, [recommendedIds, allMethods, refreshKey]);

  const handleToggleMethod = (method: AssessmentMethod) => {
    const isSelected = selectedMethods.some(m => m.id === method.id);
    if (isSelected) {
      onMethodsSelect(selectedMethods.filter(m => m.id !== method.id));
    } else {
      onMethodsSelect([...selectedMethods, method]);
      // Log tip selection for analytics
      import("../../../analytics/analyticsLogger").then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent("tip_selection", {
          tipId: method.id,
          tipTitle: method.title,
        });
      });
    }
  };

  // --- הקוד המתוקן מתחיל כאן ---

  // פונקציה שמחזירה רק את התוכן של הפופאפ, עטוף ב-div רגיל
  const renderMethodDetails = (method: AssessmentMethod) => (
    <div className={styles.dialogContent} dir="rtl">
      <DialogHeader>
        <DialogTitle>{method.title}</DialogTitle>
        <DialogDescription>{method.description}</DialogDescription>
      </DialogHeader>
      <div className={styles.dialogBody}>
        {method.fullDescription && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>תיאור מלא</h4>
            <div className={styles.descriptionContent}>
              {method.fullDescription.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        <div className={styles.detailSection}>
          <h4 className={styles.sectionTitle}>מאפיינים טכניים</h4>
          <div className={styles.technicalInfo}>
            <div className={styles.techItem}>
              <span>רמת קושי:</span>
              <DifficultyStars level={method.implementation_difficulty} />
            </div>
            <div className={styles.techItem}>
              <span>השקעת זמן:</span>
              <Badge variant="secondary">{method.time_investment}</Badge>
            </div>
            <div className={styles.techItem}>
              <span>גודל כיתה:</span>
              {method.class_size_suitability.map(s => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
            {method.implementation_guidelines?.length > 0 && (
              <div className={styles.techItem}>
                <span>הנחיות יישום:</span>
                <ul className={styles.guidelinesList}>
                  {method.implementation_guidelines.map((guideline, index) => (
                    <li key={index}>{guideline}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {(method.advantages.pedagogical.length > 0 || method.advantages.practical.length > 0 || method.advantages.student_engagement.length > 0) && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>יתרונות</h4>
            <ul className={styles.advantagesList}>
              {method.advantages.pedagogical.map((adv: string, index: number) => <li key={`ped-${index}`}><strong>פדגוגי:</strong> {adv}</li>)}
              {method.advantages.practical.map((adv: string, index: number) => <li key={`pra-${index}`}><strong>מעשי:</strong> {adv}</li>)}
              {method.advantages.student_engagement.map((adv: string, index: number) => <li key={`eng-${index}`}><strong>מעורבות:</strong> {adv}</li>)}
            </ul>
          </div>
        )}

        {(method.disadvantages.challenges.length > 0 || method.disadvantages.limitations.length > 0 || method.disadvantages.resource_requirements.length > 0) && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>חסרונות ואתגרים</h4>
            <ul className={styles.disadvantagesList}>
              {method.disadvantages.challenges.map((dis: string, index: number) => <li key={`cha-${index}`}><strong>אתגר:</strong> {dis}</li>)}
              {method.disadvantages.limitations.map((dis: string, index:number) => <li key={`lim-${index}`}><strong>מגבלה:</strong> {dis}</li>)}
              {method.disadvantages.resource_requirements.map((dis: string, index: number) => <li key={`res-${index}`}><strong>דרישות:</strong> {dis}</li>)}
            </ul>
          </div>
        )}

        {method.toolsWithLinks?.[0]?.name && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>כלים מומלצים</h4>
            <div className={styles.toolsGrid}>
              {method.toolsWithLinks.map((tool: any, index: number) => (
                <a href={tool.link} target="_blank" rel="noopener noreferrer" key={index} className={styles.toolLinkCard}>
                  <div className={styles.toolLinkHeader}>
                    <span className={styles.toolName}>{tool.name}</span>
                    <ExternalLink size={14} />
                  </div>
                  <p className={styles.toolDescription}>{tool.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {method.furtherReading?.[0]?.title && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>מקורות להעמקה</h4>
            <ul className={styles.readingList}>
              {method.furtherReading.map((item: {title: string, link: string}, index: number) => (
                <li key={index}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                    <ExternalLink size={14} className={styles.readingLinkIcon}/>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {method.suggested_tools?.length > 0 && (
          <div className={styles.detailSection}>
            <h4 className={styles.sectionTitle}>כלים מומלצים</h4>
            <div className={styles.toolsList}>
              {method.suggested_tools.map((tool: string, index: number) => (
                <Badge key={index} variant="outline" className={styles.toolBadge}>
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // פונקציה שמציגה כרטיס ויוצרת את הפופאפ, כשהיא עוטפת את התוכן ב-DialogContent
  const renderMethodCard = (method: AssessmentMethod & { compatibilityScore?: number }, isRecommended: boolean) => {
    const isSelected = selectedMethods.some(m => m.id === method.id);
    const compatibilityScore = method.compatibilityScore;

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`${styles.methodCard} ${isSelected ? styles.selected : ''}`}
        key={method.id}
        onClick={() => handleToggleMethod(method)}
      >
        {isRecommended && compatibilityScore && compatibilityScore > 0 && (
            <CompatibilityBadge score={compatibilityScore} />
        )}

        <div className={styles.cardHeader}>
          <div className={`${styles.checkbox} ${isSelected ? styles.checkboxSelected : ''}`}>
            {isSelected && <Check size={16} color="white" />}
          </div>
          <h3 className={styles.methodTitle}>
            {method.title}
            {(method as any).isPrivate && <span className={styles.privateBadge}>פרטי</span>}
          </h3>
          {isRecommended && <Badge variant="secondary" className={styles.recommendedBadge}>מומלץ</Badge>}
        </div>
        <p className={styles.methodDescription}>{method.description}</p>
        <div className={styles.cardFooter}>
          <div className={styles.difficulty}>
            <span className={styles.difficultyText}>רמת קושי:</span>
            <DifficultyStars level={method.implementation_difficulty} />
          </div>
          <div className={styles.cardActions}>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                  <Info size={16} /> פרטים נוספים
                </Button>
              </DialogTrigger>
              <DialogContent>
                {renderMethodDetails(method)}
              </DialogContent>
            </Dialog>
            {(method as any).isPrivate && onDeletePrivateTip && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('האם אתה בטוח שברצונך למחוק את הטיפ הזה?')) {
                    onDeletePrivateTip(method.id);
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.grid}>
        <AnimatePresence>
          {recommendedMethods.map((method: AssessmentMethod) => renderMethodCard(method, true))}
        </AnimatePresence>
      </div>

      <details className={styles.otherMethodsDetails}>
        <summary className={styles.otherMethodsSummary}>
          <ChevronDown className={styles.summaryIcon} />
          הצג {otherMethods.length} שיטות נוספות
        </summary>
        <div className={styles.grid}>
          <AnimatePresence>
            {otherMethods.map((method: AssessmentMethod) => renderMethodCard(method, false))}
          </AnimatePresence>
        </div>
      </details>
    </div>
  );
};