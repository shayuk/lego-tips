import React, { useState, useMemo } from 'react';
import { CourseParameters, AssessmentMethod, assessmentMethods } from '../lib/assessmentTypes'; 
import { getTopCompatibleMethods } from '../../../helpers/compatibilityCalculator';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/Dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Info, ChevronDown, Check, Plus, ExternalLink, X } from 'lucide-react';
import styles from './PedagogicalMethodSelector.module.css';

interface PedagogicalMethodSelectorProps {
  courseParams: CourseParameters;
  onMethodsSelect: (methods: AssessmentMethod[]) => void;
  selectedMethods: AssessmentMethod[];
}

const DifficultyStars = ({ level }: { level: number }) => (
  <div className={styles.stars}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < level ? styles.filledStar : styles.emptyStar} />
    ))}
  </div>
);

export const PedagogicalMethodSelector: React.FC<PedagogicalMethodSelectorProps> = ({ courseParams, onMethodsSelect, selectedMethods }) => {
  const [activeMethod, setActiveMethod] = useState<AssessmentMethod | null>(null);

  const recommendedMethods = useMemo(() => {
    return getTopCompatibleMethods(courseParams, 5);
  }, [courseParams]);

  const recommendedIds = useMemo(() => new Set(recommendedMethods.map(m => m.id)), [recommendedMethods]);

  const otherMethods = useMemo(() => {
    return assessmentMethods.filter((method: AssessmentMethod) => !recommendedIds.has(method.id));
  }, [recommendedIds]);

  const handleToggleMethod = (method: AssessmentMethod) => {
    const isSelected = selectedMethods.some(m => m.id === method.id);
    if (isSelected) {
      onMethodsSelect(selectedMethods.filter(m => m.id !== method.id));
    } else {
      onMethodsSelect([...selectedMethods, method]);
    }
  };

  const renderMethodDetails = (method: AssessmentMethod) => (
    <DialogContent className={styles.dialogContent}>
      <DialogHeader>
        <DialogTitle>{method.title}</DialogTitle>
        <DialogDescription>{method.description}</DialogDescription>
      </DialogHeader>
      <div className={styles.dialogBody}>
        {method.fullDescription && (
          <div className={styles.detailSection}>
            <h4>Full Description</h4>
            {method.fullDescription.split('\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
        <div className={styles.detailSection}>
          <h4>Advantages</h4>
          <ul>
            {method.advantages.pedagogical.map((adv: string, index: number) => <li key={index}>{adv}</li>)}
            {method.advantages.practical.map((adv: string, index: number) => <li key={index}>{adv}</li>)}
            {method.advantages.student_engagement.map((adv: string, index: number) => <li key={index}>{adv}</li>)}
          </ul>
        </div>
        <div className={styles.detailSection}>
          <h4>Disadvantages</h4>
          <ul>
            {method.disadvantages.challenges.map((dis: string, index: number) => <li key={index}>{dis}</li>)}
            {method.disadvantages.limitations.map((dis: string, index: number) => <li key={index}>{dis}</li>)}
            {method.disadvantages.resource_requirements.map((dis: string, index: number) => <li key={index}>{dis}</li>)}
          </ul>
        </div>
        <div className={styles.detailSection}>
            <h4>Further Reading</h4>
            <ul>
                {method.furtherReading?.map((item: {title: string, link: string}, index: number) => (
                    <li key={index}><a href={item.link} target="_blank" rel="noopener noreferrer">{item.title} <ExternalLink size={12}/></a></li>
                ))}
            </ul>
        </div>
      </div>
    </DialogContent>
  );

  const renderMethodCard = (method: AssessmentMethod, isRecommended: boolean) => {
    const isSelected = selectedMethods.some(m => m.id === method.id);
    return (
      <motion.div 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${styles.methodCard} ${isSelected ? styles.selected : ''}`}
        key={method.id}
      >
        <div className={styles.cardHeader} onClick={() => handleToggleMethod(method)}>
          <div className={isSelected ? styles.checkboxSelected : styles.checkbox}>
            {isSelected && <Check size={16} />}
          </div>
          <h3 className={styles.methodTitle}>{method.title}</h3>
          {isRecommended && <Badge variant="secondary">Recommended</Badge>}
        </div>
        <p className={styles.methodDescription}>{method.description}</p>
        <div className={styles.cardFooter}>
          <DifficultyStars level={method.implementation_difficulty} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm"><Info size={16} /> Details</Button>
            </DialogTrigger>
            {renderMethodDetails(method)}
          </Dialog>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.selectorContainer}>
      <h2 className={styles.sectionTitle}>Recommended Pedagogical Methods</h2>
      <div className={styles.grid}>
        {recommendedMethods.map(method => renderMethodCard(method, true))}
      </div>

      <h2 className={styles.sectionTitle}>Other Methods</h2>
      <div className={styles.grid}>
        {otherMethods.map((method: AssessmentMethod) => renderMethodCard(method, false))}
      </div>
    </div>
  );
};
