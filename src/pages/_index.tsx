import { Link } from "react-router-dom";
import { PlusCircle, FileText, Info, Brain, Lightbulb } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./_index.module.css";

// קומפוננטה: כותרת, כפתורים, ותמונה ראשית – כולם מוצמדים לימין
export default function HomePage() {
  return (
    <div className={styles.container}>


      {/* אזור הירו הראשי עם תמונה וכפתורים */}
      <section className={styles.hero}>
        {/* תוכן הירו */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            פלטפורמה פדגוגית חכמה  <span className={styles.highlight}>– הכל במקום אחד</span>
          </h1>
          <p className={styles.heroDescription}>
            אפליקציה חדשנית שמאפשרת למרצים באקדמיה לבנות הערכות מותאמות אישית בלחיצת כפתור, משלבת בין קובץ הסילבוס, דרישות המרצה, וטיפים פדגוגיים מבוססי ניסיון – כדי להפיק משימה אינטגרטיבית, עשירה ומדויקת., .<br />
            המערכת משמשת כספרייה חיה של רעיונות פדגוגיים, כמנוע ליצירת מטלות, וכבסיס לפלטפורמה שיתופית של סגלי הוראה — אג'ילית, דינמית ומתפתחת, שמותאמת לשינויים מתמידים בעולם ההשכלה הגבוהה. כל אלו עטופים בממשק עברי אקדמי מתקדם, הנתמך בבינה מלאכותית
          </p>
          <div className={styles.heroActions}>
            <Link to="/assessment-builder">
              <Button size="lg">
                <PlusCircle size={20} />
                צור לי הערכה חדשה
              </Button>
            </Link>
            <Link to="/my-assessments">
              <Button variant="outline" size="lg">
                <FileText size={20} />
                ההערכות שלי
              </Button>
            </Link>
          </div>
        </div>

        {/* תמונה ראשית */}
        <div className={styles.heroImageContainer}>
          <img
            src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Lego-Tips"
            className={styles.image}
          />
        </div>
      </section>

      {/* ספריית הפיצ'רים – צמודה לימין, מתחת לכפתורים */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>
          <span role="img" aria-label="books">📚</span> לעיון בספריית ההוראה – תוכן פדגוגי
        </h2>
        <div className={styles.libraryLinks}>
          <Link to="/teaching-library?tab=methods">
            <Button variant="outline" size="lg">
              <Lightbulb size={18} style={{ marginLeft: 6 }} /> עיין בשיטות הערכה
            </Button>
          </Link>
          <Link to="/teaching-library?tab=bloom">
            <Button variant="outline" size="lg">
              <Brain size={18} style={{ marginLeft: 6 }} /> ניתוח הערכות על פי טקסטונומית בלום
            </Button>
          </Link>
          <Link to="/teaching-library?tab=help">
            <Button variant="outline" size="lg">
              <Info size={18} style={{ marginLeft: 6 }} /> מידע ועזרה
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}