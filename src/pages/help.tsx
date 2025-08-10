import { Users, BookOpen, Award, Zap } from 'lucide-react';
import styles from './help.module.css';

export default function HelpPage() {
  return (
    <div className={styles.container}>
      <h1>עזרה ומידע</h1>

      <section className={styles.section}>
        <h2>ברוכים הבאים למרכז העזרה והמידע</h2>
        <p>
          כאן תוכלו למצוא תשובות לשאלות נפוצות ומידע על השימוש במערכת "בונה הערכות".
        </p>
      </section>

      <section className={styles.section}>
        <h2>יכולות המערכת</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users size={24} />
            </div>
            <h3 className={styles.featureTitle}>ספרייה של טיפים מרצים</h3>
            <p className={styles.featureDescription}>
              מאגר של טיפים פדגוגיים שמרצים שיתפו מניסיונם האישי והצלחותיהם. כל הטיפים הטובים ביותר במקום אחד.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BookOpen size={24} />
            </div>
            <h3 className={styles.featureTitle}>התאמה אישית חכמה</h3>
            <p className={styles.featureDescription}>
              איחוד טיפים לבניית מטלה או הערכה בהתאמה לרכיבים מאתגרים: גודל כיתה, סוג שיעור, אופן למידה ורמת הלמידה.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Award size={24} />
            </div>
            <h3 className={styles.featureTitle}>טקסונומיה של בלום</h3>
            <p className={styles.featureDescription}>
              חלוקה לפי טקסונומיה של בלום עם הסבר מפורט על כל טיפ, כולל קישורים להרחבת הידע על השיטות הפדגוגיות.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={24} />
            </div>
            <h3 className={styles.featureTitle}>הוראות ומחוון הערכה</h3>
            <p className={styles.featureDescription}>
              המטלה הנבנית כוללת הוראות ברורות לתלמיד, מחוון הערכה מפורט למרצה, ורמת קושי בבניית המטלה.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>שאלות נפוצות (FAQ)</h2>
        
        <div className={styles.faqItem}>
          <h3>מהי מטרת האפליקציה?</h3>
          <p>
            מטרת "בונה הערכות" היא לספק למרצים כלי יעיל ונוח ליצירת מטלות והערכות פדגוגיות מגוונות, תוך שימוש במאגר טיפים ושיטות המותאמות לעידן הבינה המלאכותית.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>כיצד אני יוצר הערכה חדשה?</h3>
          <p>
            לחצו על כפתור "צור הערכה חדשה" בעמוד הבית או בתפריט הניווט. המערכת תדריך אתכם בתהליך בחירת רכיבים, התאמה אישית, ויצירת המטלה הסופית.
          </p>
        </div>
        
        <div className={styles.faqItem}>
          <h3>היכן נשמרות ההערכות שלי?</h3>
          <p>
            כל ההערכות שתיצרו ותשמרו יופיעו בעמוד "ההערכות שלי", אליו ניתן לגשת מתפריט הניווט הראשי.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>מהי ספריית הטיפים הפדגוגיים?</h3>
          <p>
            זוהי ספרייה עשירה של שיטות הערכה וטיפים פדגוגיים שנאספו ממרצים ומומחים. תוכלו לסנן ולעיין בטיפים לפי קטגוריות שונות, כמו הטקסונומיה של בלום, כדי לקבל השראה למטלות שלכם.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>צריכים עזרה נוספת?</h2>
        <p>
          אם לא מצאתם תשובה לשאלתכם, אתם מוזמנים ליצור קשר עם צוות הרשות לחדשנות בהוראה של אוניברסיטת אריאל בכתובת המייל: teachinginnovation@ariel.ac.il
        </p>
      </section>
    </div>
  );
} 