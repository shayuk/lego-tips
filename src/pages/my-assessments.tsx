// 📁 קובץ: src/pages/my-assessments.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/Dialog';
import { getPersonalAssignments, deletePersonalAssignment } from '../helpers/documentExport';
import { FileText, Trash2, Search, Inbox } from 'lucide-react';
import styles from './my-assessments.module.css';

interface SavedAssessment {
  id: string;
  title: string;
  htmlContent: string;
  modelUsed: string;
  createdAt: string;
  courseName?: string;
}

export default function MyAssessmentsPage() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<SavedAssessment | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = () => {
    const saved = getPersonalAssignments();
    setAssessments(saved.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
  };

  const filteredAssessments = useMemo(() => {
    if (!searchTerm) {
      return assessments;
    }
    return assessments.filter(
      (assessment) =>
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assessments, searchTerm]);

  const handleSelectAssessment = (assessment: SavedAssessment) => {
    setSelectedAssessment(assessment);
  };

  const handleDeleteClick = (assessment: SavedAssessment) => {
    setAssessmentToDelete(assessment);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (assessmentToDelete) {
      deletePersonalAssignment(assessmentToDelete.id);
      loadAssessments();
      if (selectedAssessment?.id === assessmentToDelete.id) {
        setSelectedAssessment(null);
      }
      setAssessmentToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const renderSidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>המטלות שלי ({filteredAssessments.length})</h2>
        {/* Search can be added here */}
      </div>
      <div className={styles.assessmentsList}>
        {filteredAssessments.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={48} className={styles.placeholderIcon} />
            <h3>לא נמצאו מטלות שמורות</h3>
            <p>צור מטלות חדשות ושמור אותן כאן.</p>
          </div>
        ) : (
          filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className={`${styles.assessmentItem} ${selectedAssessment?.id === assessment.id ? styles.selected : ''}`}
              onClick={() => handleSelectAssessment(assessment)}
            >
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{assessment.title}</h3>
                <div className={styles.itemActions}>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(assessment); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className={styles.itemCourse}>{assessment.courseName || 'ללא שם קורס'}</p>
              <p className={styles.itemDate}>
                נשמר ב: {new Date(assessment.createdAt).toLocaleDateString('he-IL')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className={styles.previewArea}>
      {selectedAssessment ? (
        <div
          className="generated-content-wrapper" // You can style this class globally
          dangerouslySetInnerHTML={{ __html: selectedAssessment.htmlContent }}
        />
      ) : (
        <div className={styles.placeholder}>
          <FileText className={styles.placeholderIcon} />
          <h2>בחר מטלה לצפייה</h2>
          <p>רשימת המטלות השמורות שלך מופיעה בצד ימין.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.sidebar}>
        {renderSidebar()}
      </div>
      <div className={styles.previewArea}>
        {renderPreview()}
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.dialogHeader}>
            <DialogTitle>אישור מחיקה</DialogTitle>
          </DialogHeader>
          <p>
            האם אתה בטוח שברצונך למחוק את המטלה "{assessmentToDelete?.title}"?
            <br />
            לא ניתן לשחזר פעולה זו.
          </p>
          <DialogFooter className={styles.dialogFooter}>
            <DialogClose asChild>
              <Button variant="outline">ביטול</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              מחק לצמיתות
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
