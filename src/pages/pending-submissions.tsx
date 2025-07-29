import React from 'react';
import { Clock } from 'lucide-react';
import styles from './pending-submissions.module.css';

export default function PendingSubmissionsPage() {
  return (
    <div className={styles.container}>
      <h1>הגשות ממתינות לאישור</h1>
      
      <div className={styles.placeholder}>
        <Clock size={64} />
        <h2>בקרוב...</h2>
        <p>
          בעתיד, יופיעו כאן הטיפים הפדגוגיים שהגשת למאגר הציבורי, והם ממתינים לבדיקה ואישור על ידי מנהלי המערכת.
        </p>
      </div>
    </div>
  );
} 