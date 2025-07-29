import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './TipDetailsModal.module.css';

interface TipDetailsModalProps {
  tip: {
    id: string;
    title: string;
    description: string;
    example: string;
    bloomExplanation: string;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    courseProfile?: {
      level: string;
      size: string;
      delivery: string;
    };
    recommendedTools?: {
      name: string;
      description: string;
      link: string;
    }[];
    furtherReading?: {
      title: string;
      link: string;
    }[];
  };
  onClose: () => void;
}

const bloomLevelNames = {
  remember: 'זכירה',
  understand: 'הבנה',
  apply: 'יישום',
  analyze: 'ניתוח',
  evaluate: 'הערכה',
  create: 'יצירה'
};

const bloomConnections = {
  remember: {
    buildsTo: ['understand'],
    description: 'זכירה מהווה את הבסיס לכל למידה מתקדמת יותר'
  },
  understand: {
    buildsFrom: ['remember'],
    buildsTo: ['apply'],
    description: 'הבנה מחברת בין זכירה ליישום מעשי'
  },
  apply: {
    buildsFrom: ['understand'],
    buildsTo: ['analyze'],
    description: 'יישום מעמיק את ההבנה ומכין לניתוח'
  },
  analyze: {
    buildsFrom: ['apply'],
    buildsTo: ['evaluate'],
    description: 'ניתוח מפרק מערכות מורכבות להבנה מעמיקה'
  },
  evaluate: {
    buildsFrom: ['analyze'],
    buildsTo: ['create'],
    description: 'הערכה מפתחת שיפוט ביקורתי הנדרש ליצירה'
  },
  create: {
    buildsFrom: ['evaluate'],
    description: 'יצירה משלבת את כל הרמות הקודמות'
  }
};

const bloomLevelColors = {
  remember: 'bg-blue-100 text-blue-800',
  understand: 'bg-green-100 text-green-800',
  apply: 'bg-yellow-100 text-yellow-800',
  analyze: 'bg-orange-100 text-orange-800',
  evaluate: 'bg-red-100 text-red-800',
  create: 'bg-purple-100 text-purple-800'
};

export const TipDetailsModal: React.FC<TipDetailsModalProps> = ({ tip, onClose }) => {
  if (!tip) return null;

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
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {tip.title}
          </h2>
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
          {/* Bloom Level Badge */}
          <div className={styles.badgeContainer}>
            <span className={`${styles.bloomBadge} ${bloomLevelColors[tip.bloomLevel]}`}>
              רמת בלום: {bloomLevelNames[tip.bloomLevel]}
            </span>
          </div>

          {/* Full Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>תיאור מפורט:</h3>
            <p className={styles.description}>{tip.description}</p>
          </div>

          {/* Example */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>דוגמה:</h3>
            <p className={styles.example}>{tip.example}</p>
          </div>

          {/* Bloom Explanation */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>הקשר לטקסונומיה של בלום:</h3>
            <p className={styles.bloomExplanation}>{tip.bloomExplanation}</p>
          </div>

          {/* Bloom Connections */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>קשרים ברמות בלום:</h3>
            <div className={styles.bloomConnections}>
              {(bloomConnections[tip.bloomLevel] as any).buildsFrom && (
                <div className={styles.connectionItem}>
                  <span className={styles.connectionLabel}>בונה על:</span>
                  <div className={styles.connectionTags}>
                    {(bloomConnections[tip.bloomLevel] as any).buildsFrom.map((level: string) => (
                      <span key={level} className={`${styles.connectionTag} ${(bloomLevelColors as any)[level]}`}>
                        {(bloomLevelNames as any)[level]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.connectionItem}>
                <span className={styles.connectionLabel}>תפקיד:</span>
                <span className={styles.connectionDescription}>
                  {bloomConnections[tip.bloomLevel].description}
                </span>
              </div>
              
              {(bloomConnections[tip.bloomLevel] as any).buildsTo && (
                <div className={styles.connectionItem}>
                  <span className={styles.connectionLabel}>מכין ל:</span>
                  <div className={styles.connectionTags}>
                    {(bloomConnections[tip.bloomLevel] as any).buildsTo.map((level: string) => (
                      <span key={level} className={`${styles.connectionTag} ${(bloomLevelColors as any)[level]}`}>
                        {(bloomLevelNames as any)[level]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Profile */}
          {tip.courseProfile && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>מתאים לקורס:</h3>
              <div className={styles.courseProfile}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>רמת קורס:</span>
                  <span className={styles.profileValue}>{tip.courseProfile.level}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>גודל כיתה:</span>
                  <span className={styles.profileValue}>{tip.courseProfile.size}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>שיטת הוראה:</span>
                  <span className={styles.profileValue}>{tip.courseProfile.delivery}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Tools */}
          {tip.recommendedTools && tip.recommendedTools.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>כלים מומלצים:</h3>
              <ul className={styles.toolsList}>
                {tip.recommendedTools.map((tool, index) => (
                  <li key={index} className={styles.toolItem}>
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.toolLink}
                    >
                      {tool.name}
                    </a>
                    <span className={styles.toolDescription}>: {tool.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Further Reading */}
          {tip.furtherReading && tip.furtherReading.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>מקורות להעמקה:</h3>
              <ul className={styles.readingList}>
                {tip.furtherReading.map((item, index) => (
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