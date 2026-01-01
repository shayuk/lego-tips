// *** התחל העתקה: my-assessments.tsx (גרסה מתוקנת) ***

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/Dialog';
import { getPersonalAssignments, deletePersonalAssignment } from '../helpers/documentExport';
import { getPrivateTips, deletePrivateTip } from '../features/pedagogicalTips/lib/pedagogicalTipStorage';
import { FileText, Trash2, Search, Inbox, Lightbulb, Share2, RefreshCw } from 'lucide-react';
import styles from './my-assessments.module.css';

interface SavedAssessment {
  id: string;
  title: string;
  htmlContent: string;
  modelUsed: string;
  createdAt: string;
  savedAt: string;
  courseName?: string;
  // הוספנו את השדה description כדי להתאים לשינויים
  description?: string;
}

interface SavedTip {
  id: string;
  title: string;
  description?: string; // הוספנו תיאור כאן
  shortDescription?: string;
  difficulty: string;
  createdAt: string;
  isPrivate: boolean;
}

export default function MyAssessmentsPage() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [tips, setTips] = useState<SavedTip[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [selectedTip, setSelectedTip] = useState<SavedTip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<SavedAssessment | null>(null);
  const [tipToDelete, setTipToDelete] = useState<SavedTip | null>(null);
  const [activeTab, setActiveTab] = useState<'assessments' | 'tips'>('assessments');

  useEffect(() => {
    loadAssessments();
    loadTips();
  }, []);

  useEffect(() => {
    const handleFocus = () => { loadTips(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadAssessments = () => {
    const saved = getPersonalAssignments();
    // שינוי 1: השדה נקרא savedAt, לא createdAt
    setAssessments(saved.sort((a: SavedAssessment, b: SavedAssessment) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
  };

  const loadTips = () => {
    const privateTips = getPrivateTips();
    const tipsWithMetadata = privateTips.map(tip => ({
      id: tip.id,
      title: tip.title,
      // שינוי 2: השדה נקרא description, לא shortDescription
      description: tip.description, 
      shortDescription: tip.shortDescription,
      difficulty: tip.implementation_difficulty.toString(),
      createdAt: tip.createdAt || new Date().toISOString(),
      isPrivate: true
    }));
    setTips(tipsWithMetadata.sort((a: SavedTip, b: SavedTip) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const filteredAssessments = useMemo(() => {
    if (!searchTerm) return assessments;
    return assessments.filter(
      (assessment) =>
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assessments, searchTerm]);

  const filteredTips = useMemo(() => {
    if (!searchTerm) return tips;
    return tips.filter(
      (tip) =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tips, searchTerm]);

  const handleSelectAssessment = (assessment: SavedAssessment) => {
    setSelectedAssessment(assessment);
    setSelectedTip(null);
  };

  const handleSelectTip = (tip: SavedTip) => {
    setSelectedTip(tip);
    setSelectedAssessment(null);
  };

  const handleDeleteClick = (assessment: SavedAssessment) => {
    setAssessmentToDelete(assessment);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteTipClick = (tip: SavedTip) => {
    setTipToDelete(tip);
    setDeleteConfirmOpen(true);
  };

  const handleRefresh = () => {
    loadAssessments();
    loadTips();
  };

  const handlePublishTip = (tip: SavedTip) => {
    alert(`הטיפ "${tip.title}" הוגש לבדיקה ויופיע במאגר הציבורי לאחר אישור.`);
  };

  const confirmDelete = () => {
    if (assessmentToDelete) {
      deletePersonalAssignment(assessmentToDelete.id);
      loadAssessments();
      if (selectedAssessment?.id === assessmentToDelete.id) setSelectedAssessment(null);
      setAssessmentToDelete(null);
    } else if (tipToDelete) {
      deletePrivateTip(tipToDelete.id);
      loadTips();
      if (selectedTip?.id === tipToDelete.id) setSelectedTip(null);
      setTipToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const renderSidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.tabButtons}>
          <button className={`${styles.tabButton} ${activeTab === 'assessments' ? styles.active : ''}`} onClick={() => setActiveTab('assessments')}>
            <FileText size={16} /> מטלות ({filteredAssessments.length})
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'tips' ? styles.active : ''}`} onClick={() => setActiveTab('tips')}>
            <Lightbulb size={16} /> טיפים ({filteredTips.length})
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className={styles.refreshButton}>
          <RefreshCw size={16} /> רענן
        </Button>
      </div>
      
      {activeTab === 'assessments' && (
        <div className={styles.assessmentsList}>
          {filteredAssessments.length === 0 ? (
            <div className={styles.emptyState}>
              <Inbox size={48} className={styles.placeholderIcon} /><h3>לא נמצאו מטלות שמורות</h3><p>צור מטלות חדשות ושמור אותן כאן.</p>
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <div key={assessment.id} className={`${styles.assessmentItem} ${selectedAssessment?.id === assessment.id ? styles.selected : ''}`} onClick={() => handleSelectAssessment(assessment)}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{assessment.title}</h3>
                  <div className={styles.itemActions}>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(assessment); }}><Trash2 size={16} /></Button>
                  </div>
                </div>
                <p className={styles.itemCourse}>{assessment.courseName || 'ללא שם קורס'}</p>
                <p className={styles.itemDate}>נשמר ב: {new Date(assessment.createdAt).toLocaleDateString('he-IL')}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className={styles.tipsList}>
          {filteredTips.length === 0 ? (
            <div className={styles.emptyState}>
              <Lightbulb size={48} className={styles.placeholderIcon} /><h3>לא נמצאו טיפים שמורים</h3><p>צור טיפים חדשים ושמור אותם כאן.</p>
            </div>
          ) : (
            filteredTips.map((tip) => (
              <div key={tip.id} className={`${styles.tipItem} ${selectedTip?.id === tip.id ? styles.selected : ''}`} onClick={() => handleSelectTip(tip)}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{tip.title}{tip.isPrivate && <span className={styles.privateBadge}>פרטי</span>}</h3>
                  <div className={styles.itemActions}>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleDeleteTipClick(tip); }}><Trash2 size={16} /></Button>
                  </div>
                </div>
                <p className={styles.itemDescription}>{tip.description}</p>
                <p className={styles.itemDifficulty}>רמת קושי: {tip.difficulty}/5</p>
                <p className={styles.itemDate}>נוצר ב: {new Date(tip.createdAt).toLocaleDateString('he-IL')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className={styles.previewArea}>
      {selectedAssessment ? (
        <div className="generated-content-wrapper" dangerouslySetInnerHTML={{ __html: selectedAssessment.htmlContent }} />
      ) : selectedTip ? (
        <div className={styles.tipPreview}>
          <div className={styles.tipHeader}>
            <h2>{selectedTip.title}</h2>
            <div className={styles.tipActions}>
              <Button variant="outline" size="sm" onClick={() => handlePublishTip(selectedTip)}><Share2 size={16} /> פרסם למאגר הציבורי</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteTipClick(selectedTip)}><Trash2 size={16} /> מחק טיפ</Button>
            </div>
          </div>
          <div className={styles.tipContent}>
            <p className={styles.tipDescription}>{selectedTip.description}</p>
            <div className={styles.tipMetadata}>
              <span className={styles.tipDifficulty}>רמת קושי: {selectedTip.difficulty}/5</span>
              <span className={styles.tipDate}>נוצר ב: {new Date(selectedTip.createdAt).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <FileText className={styles.placeholderIcon} /><h2>בחר מטלה או טיפ לצפייה</h2><p>רשימת המטלות והטיפים השמורים שלך מופיעה בצד ימין.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.sidebar}>{renderSidebar()}</div>
      <div className={styles.previewArea}>{renderPreview()}</div>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.dialogHeader}><DialogTitle>אישור מחיקה</DialogTitle></DialogHeader>
          <p>האם אתה בטוח שברצונך למחוק את "{assessmentToDelete?.title || tipToDelete?.title}"?<br/>לא ניתן לשחזר פעולה זו.</p>
          <DialogFooter className={styles.dialogFooter}>
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>מחק לצמיתות</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// *** סיים העתקה: my-assessments.tsx (גרסה מתוקנת) ***