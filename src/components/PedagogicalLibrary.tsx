import React, { useState, useMemo, useEffect } from 'react';
import { assessmentMethods } from '../features/assessmentBuilder/lib/assessmentMethods';
import { AssessmentMethod } from '../features/assessmentBuilder/lib/assessmentTypes';
import { getPrivateTips, savePrivateTip, deletePrivateTip, NewTipData } from '../features/pedagogicalTips/lib/pedagogicalTipStorage';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';
import { Dialog, DialogContent } from './Dialog';
import { Star, Info, Search, Filter, Plus, ExternalLink, X, User } from 'lucide-react';
import styles from '../features/assessmentBuilder/components/PedagogicalMethodSelector.module.css';

interface PedagogicalLibraryProps {
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

export const PedagogicalLibrary: React.FC<PedagogicalLibraryProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTipModalOpen, setIsAddTipModalOpen] = useState(false);
  const [newTip, setNewTip] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    categories: [] as string[],
    classSizes: [] as string[],
    teachingMethods: [] as string[],
    subjectAreas: [] as string[],
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
  const [allMethods, setAllMethods] = useState<AssessmentMethod[]>([]);

  useEffect(() => {
    const publicTips = assessmentMethods;
    const privateTips = getPrivateTips();
    // Add a flag to distinguish private tips
    const privateTipsWithFlag = privateTips.map(tip => ({ ...tip, isPrivate: true }));
    setAllMethods([...publicTips, ...privateTipsWithFlag]);
  }, []);


  const filteredMethods = useMemo(() => {
    return allMethods.filter(method => {
      const matchesSearch = searchQuery === '' || 
        method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        method.categories.includes(categoryFilter as any);
      
      const matchesDifficulty = difficultyFilter === 'all' || 
        method.implementation_difficulty.toString() === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, categoryFilter, difficultyFilter, allMethods]);

  const filteredAndSortedMethods = useMemo(() => {
    return filteredMethods.sort((a, b) => {
      if (a.isPrivate && !b.isPrivate) return -1;
      if (!a.isPrivate && b.isPrivate) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [filteredMethods]);

  const handleViewDetails = (method: AssessmentMethod) => {
    setSelectedMethod(method);
    setIsModalOpen(true);
  };

  const handleAddToolLink = () => {
    setNewTip(prev => ({
      ...prev,
      toolsWithLinks: [...prev.toolsWithLinks, { name: '', link: '', description: '' }]
    }));
  };

  const handleAddFurtherReading = () => {
    setNewTip(prev => ({
      ...prev,
      furtherReading: [...prev.furtherReading, { title: '', link: '' }]
    }));
  };

  const handleSaveNewTip = (isPublic: boolean) => {
    if (isPublic) {
      // Logic for public submission will be handled later
      console.log('Submitting tip for public review:', newTip);
      alert('הטיפ הוגש לבדיקה ויופיע במאגר הציבורי לאחר אישור.');
    } else {
      savePrivateTip(newTip as NewTipData);
      const privateTips = getPrivateTips().map(tip => ({ ...tip, isPrivate: true }));
      setAllMethods([...assessmentMethods, ...privateTips]);
      alert('הטיפ נשמר בהצלחה במאגר הפרטי שלך!');
    }
    
    setIsAddTipModalOpen(false);
    // איפוס הטופס
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
    deletePrivateTip(tipId);
    const privateTips = getPrivateTips().map(tip => ({ ...tip, isPrivate: true }));
    setAllMethods([...assessmentMethods, ...privateTips]);
    setIsModalOpen(false);
  };

  const uniqueCategories = useMemo(() => {
    const categories = new Set(allMethods.flatMap(method => method.categories));
    return ['all', ...Array.from(categories)];
  }, [allMethods]);

  const uniqueDifficulties = useMemo(() => {
    const difficulties = new Set(allMethods.map(method => method.implementation_difficulty.toString()));
    return ['all', ...Array.from(difficulties)];
  }, [allMethods]);


  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Add new tip button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-4)'
      }}>
        <h2 style={{ color: 'var(--foreground)', margin: 0 }}>ספריית שיטות הערכה</h2>
        <Button 
          onClick={() => setIsAddTipModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-2)',
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        >
          <Plus size={18} />
          הוסף טיפ פדגוגי חדש
        </Button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <Input
            placeholder="חפש שיטות הערכה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="סוג קורס" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'כל הסוגים' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="רמת קושי" />
          </SelectTrigger>
          <SelectContent>
            {uniqueDifficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'כל הרמות' : `רמה ${difficulty}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: 'var(--spacing-4)' 
      }}>
        {filteredAndSortedMethods.map((method, index) => (
          <div key={method.id || index} className={`${styles.methodCard} ${method.isPrivate ? styles.privateTipCard : ''}`}>
            {method.isPrivate && <div className={styles.privateBadge}><User size={14} /> טיפ פרטי</div>}
            <div className={styles.cardContent}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: 'var(--spacing-2)',
                color: 'var(--foreground)'
              }}>
                {method.isPrivate && <User size={16} style={{ marginRight: '8px', color: 'var(--primary)' }} />}
                {method.title}
              </h4>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--spacing-2)', 
                marginBottom: 'var(--spacing-3)' 
              }}>
                {method.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category === 'introduction' ? 'מבוא' : 
                     category === 'large' ? 'רב משתתפים' : 
                     category === 'advanced' ? 'מתקדם' : category}
                  </Badge>
                ))}
              </div>
            </div>

            <p style={{ 
              color: 'var(--muted-foreground)', 
              lineHeight: '1.6',
              marginBottom: 'var(--spacing-4)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {method.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  רמת קושי:
                </span>
                <DifficultyStars level={method.implementation_difficulty} />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(method);
                }}
              >
                <Info size={16} />
                מידע נוסף
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedMethods.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-8)',
          color: 'var(--muted-foreground)'
        }}>
          <Filter size={48} style={{ margin: '0 auto var(--spacing-4)' }} />
          <h3 style={{ marginBottom: 'var(--spacing-2)' }}>לא נמצאו תוצאות</h3>
          <p>נסו לשנות את מילות החיפוש או הסינונים</p>
        </div>
      )}

      {/* Enhanced Modal for method details */}
      <div 
        className={styles.modalOverlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsModalOpen(false);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="method-modal-title"
        style={{ display: isModalOpen ? 'flex' : 'none' }}
      >
        <div className={styles.modalContent} dir="rtl">
          <div className={styles.modalHeader}>
            <h2 id="method-modal-title" className={styles.modalTitle}>
              {selectedMethod?.title}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsModalOpen(false)}
              className={styles.closeButton}
              aria-label="סגור"
            >
              <X size={20} />
            </Button>
          </div>

          <div className={styles.modalBody}>
            {selectedMethod && (
              <>
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>📋 תיאור</h3>
                  <p className={styles.description}>{selectedMethod.description}</p>
                  
                  {selectedMethod.fullDescription && (
                    <div className={styles.fullDescription}>
                      <h4 className={styles.subsectionTitle}>תיאור מלא</h4>
                      <div className={styles.descriptionContent}>
                        {selectedMethod.fullDescription.split('\n\n').map((paragraph: string, index: number) => (
                          <p key={index} style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Characteristics */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>מאפיינים טכניים</h3>
              <div className={styles.technicalInfo}>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>רמת קושי ביישום:</span>
                  <DifficultyStars level={selectedMethod.implementation_difficulty} />
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>השקעת זמן:</span>
                  <Badge variant="secondary">
                    {selectedMethod.time_investment === 'minimal' ? 'מינימלי' :
                     selectedMethod.time_investment === 'moderate' ? 'בינוני' :
                     selectedMethod.time_investment === 'substantial' ? 'רב' : 'נרחב'}
                  </Badge>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>מתאים לכיתות:</span>
                  <div className={styles.badgeGroup}>
                    {selectedMethod.class_size_suitability.map((size: string, index: number) => (
                      <Badge key={index} style={{ marginLeft: '5px', backgroundColor: '#e3f2fd' }}>
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>קטגוריות:</span>
                  <div className={styles.badgeGroup}>
                    {selectedMethod.categories.map((category: string, index: number) => (
                      <Badge key={index} style={{ marginLeft: '5px', backgroundColor: '#f3e5f5' }}>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>תחומי לימוד מתאימים:</span>
                  <div className={styles.badgeGroup}>
                    {selectedMethod.subject_areas.map((area: string, index: number) => (
                      <Badge key={index} style={{ marginLeft: '5px', backgroundColor: '#e8f5e9' }}>
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techLabel}>שיטות הוראה מתאימות:</span>
                  <div className={styles.badgeGroup}>
                    {selectedMethod.teaching_methods.map((method: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {method === 'lecture' ? 'הרצאה' :
                         method === 'seminar' ? 'סמינר' :
                         method === 'workshop' ? 'סדנה' :
                         method === 'lab' ? 'מעבדה' :
                         method === 'fieldwork' ? 'עבודת שטח' :
                         method === 'online' ? 'מקוון' : 'היברידי'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advantages */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>יתרונות</h3>
              <div className={styles.advantagesGrid}>
                <div className={styles.advantageCategory}>
                  <h4 className={styles.categoryTitle}>יתרונות פדגוגיים:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.advantages.pedagogical.map((adv: string, index: number) => (
                      <li key={index}>{adv}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.advantageCategory}>
                  <h4 className={styles.categoryTitle}>יתרונות מעשיים:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.advantages.practical.map((adv: string, index: number) => (
                      <li key={index}>{adv}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.advantageCategory}>
                  <h4 className={styles.categoryTitle}>עידוד מעורבות:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.advantages.student_engagement.map((adv: string, index: number) => (
                      <li key={index}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Disadvantages */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>חסרונות ואתגרים</h3>
              <div className={styles.disadvantagesGrid}>
                <div className={styles.disadvantageCategory}>
                  <h4 className={styles.categoryTitle}>אתגרים:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.disadvantages.challenges.map((dis: string, index: number) => (
                      <li key={index}>{dis}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.disadvantageCategory}>
                  <h4 className={styles.categoryTitle}>מגבלות:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.disadvantages.limitations.map((dis: string, index: number) => (
                      <li key={index}>{dis}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.disadvantageCategory}>
                  <h4 className={styles.categoryTitle}>דרישות משאבים:</h4>
                  <ul className={styles.modalList}>
                    {selectedMethod.disadvantages.resource_requirements.map((dis: string, index: number) => (
                      <li key={index}>{dis}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Suggested Tools */}
            {selectedMethod.suggested_tools && selectedMethod.suggested_tools.length > 0 && (
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>כלים מומלצים</h3>
                <div className={styles.toolsGrid}>
                  {selectedMethod.suggested_tools.map((tool: string, index: number) => (
                    <div key={index} className={styles.toolItem}>
                      <span className={styles.toolName}>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools with Links */}
            {selectedMethod.toolsWithLinks && selectedMethod.toolsWithLinks.length > 0 && (
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>כלים עם קישורים</h3>
                <div className={styles.toolsGrid}>
                  {selectedMethod.toolsWithLinks.map((tool: any, index: number) => (
                    <div key={index} className={styles.toolItem}>
                      <div className={styles.toolInfo}>
                        <span className={styles.toolName}>{tool.name}</span>
                        {tool.description && (
                          <p className={styles.toolDescription}>{tool.description}</p>
                        )}
                      </div>
                      {tool.link && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(tool.link, '_blank')}
                          className={styles.toolLink}
                        >
                          <ExternalLink size={16} />
                          פתח
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Further Reading */}
            {selectedMethod.furtherReading && selectedMethod.furtherReading.length > 0 && (
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>מקורות להעמקה</h3>
                <div className={styles.readingGrid}>
                  {selectedMethod.furtherReading.map((reading: any, index: number) => (
                    <div key={index} className={styles.readingItem}>
                      <span className={styles.readingTitle}>{reading.title}</span>
                      {reading.link && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(reading.link, '_blank')}
                          className={styles.readingLink}
                        >
                          <ExternalLink size={16} />
                          קרא
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Implementation Guidelines */}
            {selectedMethod.implementation_guidelines && (
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>הנחיות יישום</h3>
                <ul className={styles.modalList}>
                  {selectedMethod.implementation_guidelines.map((guideline: string, index: number) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{guideline}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rubric Template */}
            {selectedMethod.rubric_template && selectedMethod.rubric_template.length > 0 && (
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>מחוון הערכה מוצע</h3>
                <div className={styles.rubricContainer}>
                  {selectedMethod.rubric_template.map((criteria: any, index: number) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>{criteria.name}</h5>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>{criteria.description}</p>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '3px' }}><strong>מעולה:</strong> {criteria.levels.excellent}</div>
                        <div style={{ marginBottom: '3px' }}><strong>טוב:</strong> {criteria.levels.good}</div>
                        <div style={{ marginBottom: '3px' }}><strong>מספק:</strong> {criteria.levels.satisfactory}</div>
                        <div><strong>זקוק לשיפור:</strong> {criteria.levels.needs_improvement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom section with difficulty and close button */}
            <div className={styles.modalSection}>
              <div className={styles.modalFooter}>
                <div className={styles.difficultyInfo}>
                  <span className={styles.difficultyLabel}>רמת קושי ביישום:</span>
                  <DifficultyStars level={selectedMethod.implementation_difficulty} />
                </div>
                
                <Button onClick={() => setIsModalOpen(false)}>
                  סגור
                </Button>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add New Tip Modal */}
      <Dialog open={isAddTipModalOpen} onOpenChange={setIsAddTipModalOpen}>
        <DialogContent className={styles.addTipModalContent}>
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: 'var(--spacing-2)' }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              marginBottom: 'var(--spacing-4)',
              color: 'var(--foreground)',
              textAlign: 'center'
            }}>
              ✨ הוסף טיפ פדגוגי חדש
            </h2>
            
            <div style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--spacing-6)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              📋 <strong>הטופס כולל 7 קטגוריות מקצועיות</strong> - מלא רק את השדות הרלוונטיים עבורך
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
              {/* Basic Info */}
              <div style={{ 
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>
                  📝 מידע בסיסי
                </h4>
                
                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      כותרת הטיפ *
                    </label>
                    <Input 
                      placeholder="לדוגמה: מבחנים עם הגבלת זמן דרסטית" 
                      value={newTip.title}
                      onChange={(e) => setNewTip(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      תיאור קצר *
                    </label>
                    <Textarea 
                      placeholder="תיאור קצר ותמציתי של הטיפ (1-2 שורות)"
                      rows={2}
                      value={newTip.shortDescription}
                      onChange={(e) => setNewTip(prev => ({ ...prev, shortDescription: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      תיאור מפורט (אופציונלי)
                    </label>
                    <Textarea 
                      placeholder="הסבר מפורט יותר על הטיפ, איך הוא עובד ומתי להשתמש בו"
                      rows={4}
                      value={newTip.fullDescription}
                      onChange={(e) => setNewTip(prev => ({ ...prev, fullDescription: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Pedagogical Suitability */}
              <div style={{ 
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>
                  🎯 התאמות פדגוגיות
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      קטגוריות קורס
                    </label>
                    <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                      {['קורס מבוא', 'קורס רב משתתפים', 'קורס מתקדם'].map(category => (
                        <label key={category} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <input 
                            type="checkbox" 
                            checked={newTip.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTip(prev => ({ ...prev, categories: [...prev.categories, category] }));
                              } else {
                                setNewTip(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
                              }
                            }}
                          />
                          <span>{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      גדלי כיתה מתאימים
                    </label>
                    <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                      {['כיתה קטנה (עד 30)', 'כיתה בינונית (30-70)', 'כיתה גדולה (70-150)', 'כיתה רבת משתתפים (150+)'].map(size => (
                        <label key={size} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <input 
                            type="checkbox"
                            checked={newTip.classSizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTip(prev => ({ ...prev, classSizes: [...prev.classSizes, size] }));
                              } else {
                                setNewTip(prev => ({ ...prev, classSizes: prev.classSizes.filter(s => s !== size) }));
                              }
                            }}
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Aspects */}
              <div style={{ 
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>
                  ⚙️ מאפיינים טכניים
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      רמת קושי יישום
                    </label>
                    <Select value={newTip.difficulty} onValueChange={(value) => setNewTip(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר רמת קושי" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">קל מאוד (1/5)</SelectItem>
                        <SelectItem value="2">קל (2/5)</SelectItem>
                        <SelectItem value="3">בינוני (3/5)</SelectItem>
                        <SelectItem value="4">מאתגר (4/5)</SelectItem>
                        <SelectItem value="5">מורכב מאוד (5/5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      השקעת זמן נדרשת
                    </label>
                    <Select value={newTip.timeInvestment} onValueChange={(value) => setNewTip(prev => ({ ...prev, timeInvestment: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר השקעת זמן" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">מינימלית</SelectItem>
                        <SelectItem value="moderate">בינונית</SelectItem>
                        <SelectItem value="substantial">משמעותית</SelectItem>
                        <SelectItem value="extensive">נרחבת</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tools & Links */}
              <div style={{ 
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>
                  🔗 כלים וקישורים פעילים
                </h4>

                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      כלים מומלצים (רשימה)
                    </label>
                    <Textarea 
                      placeholder="למשל: Google Forms, Kahoot, Moodle Quiz, Mentimeter (הפרד בפסיקים)"
                      rows={2}
                      value={newTip.recommendedTools}
                      onChange={(e) => setNewTip(prev => ({ ...prev, recommendedTools: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      כלים עם קישורים פעילים
                    </label>
                    {newTip.toolsWithLinks.map((tool, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                        <Input 
                          placeholder="שם הכלי"
                          value={tool.name}
                          onChange={(e) => {
                            const updated = [...newTip.toolsWithLinks];
                            updated[index].name = e.target.value;
                            setNewTip(prev => ({ ...prev, toolsWithLinks: updated }));
                          }}
                        />
                        <Input 
                          placeholder="קישור"
                          value={tool.link}
                          onChange={(e) => {
                            const updated = [...newTip.toolsWithLinks];
                            updated[index].link = e.target.value;
                            setNewTip(prev => ({ ...prev, toolsWithLinks: updated }));
                          }}
                        />
                        <Input 
                          placeholder="תיאור הכלי"
                          value={tool.description}
                          onChange={(e) => {
                            const updated = [...newTip.toolsWithLinks];
                            updated[index].description = e.target.value;
                            setNewTip(prev => ({ ...prev, toolsWithLinks: updated }));
                          }}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddToolLink} style={{ justifySelf: 'start' }}>
                      ➕ הוסף כלי נוסף
                    </Button>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                      מקורות להעמקה (מאמרים אקדמיים)
                    </label>
                    {newTip.furtherReading.map((reading, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                        <Input 
                          placeholder="כותרת המאמר/המקור"
                          value={reading.title}
                          onChange={(e) => {
                            const updated = [...newTip.furtherReading];
                            updated[index].title = e.target.value;
                            setNewTip(prev => ({ ...prev, furtherReading: updated }));
                          }}
                        />
                        <Input 
                          placeholder="קישור"
                          value={reading.link}
                          onChange={(e) => {
                            const updated = [...newTip.furtherReading];
                            updated[index].link = e.target.value;
                            setNewTip(prev => ({ ...prev, furtherReading: updated }));
                          }}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddFurtherReading} style={{ justifySelf: 'start' }}>
                      ➕ הוסף מקור נוסף
                    </Button>
                  </div>
                </div>
              </div>

              {/* Implementation Guidelines */}
              <div style={{ 
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>
                  📋 הנחיות יישום
                </h4>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>
                    שלבי היישום (כל שלב בשורה נפרדת)
                  </label>
                  <Textarea 
                    placeholder={`למשל:
• הכן בנק שאלות מגוון ורחב
• קבע זמן מוגבל לכל שאלה
• הכן הודעות ברורות למשתתפים
• בצע מבחן טכני לפני התחלה`}
                    rows={6}
                    value={newTip.implementationGuidelines}
                    onChange={(e) => setNewTip(prev => ({ ...prev, implementationGuidelines: e.target.value }))}
                  />
                </div>
              </div>

              {/* Save buttons */}
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--spacing-6)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '2px solid var(--primary)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)' }}>
                  🎯 איך תרצה לשמור את הטיפ?
                </h4>
                <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => handleSaveNewTip(false)}
                    disabled={!newTip.title.trim() || !newTip.shortDescription.trim()}
                  >
                    💾 שמור למאגר הפרטי שלי
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => handleSaveNewTip(true)}
                    disabled={!newTip.title.trim() || !newTip.shortDescription.trim()}
                  >
                    🌟 הוסף למאגר הציבורי
                  </Button>
                </div>
                <p style={{ 
                  marginTop: 'var(--spacing-3)', 
                  fontSize: '0.9rem', 
                  color: 'var(--muted-foreground)' 
                }}>
                  * שדות חובה: כותרת ותיאור קצר בלבד. שאר השדות יעזרו לבניית טיפ מקצועי יותר
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 