import { Link } from "react-router-dom";
import { FileText, PlusCircle, Award, BookOpen, Users, Zap } from "lucide-react";
import { Button } from "../components/Button";
import { AppLayout } from "../components/AppLayout";
import styles from "./_index.module.css";

export default function HomePage() {
  return (
    <AppLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              בנו הערכות טובות יותר
              <span className={styles.highlight}> כמו לגו</span>
            </h1>
            <p className={styles.heroDescription}>
              צרו הערכות אקדמיות מותאמות אישית עם הגישה האינטואיטיבית שלנו לבניית אבני בניין.
              עצבו, סדרו וחברו רכיבי הערכה באופן ויזואלי כדי ליצור כלי הערכה מעניינים ויעילים.
            </p>
            <div className={styles.heroActions}>
              <Link to="/assessment-builder">
                <Button size="lg">
                  <PlusCircle size={18} />
                  צור הערכה חדשה
                </Button>
              </Link>
              <Link to="/my-assessments">
                <Button variant="outline" size="lg">
                  <FileText size={18} />
                  ההערכות שלי
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="בונה ההערכות" 
              className={styles.image}
            />
          </div>
        </section>
        
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>למה להשתמש בבונה ההערכות?</h2>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Zap size={24} />
              </div>
              <h3 className={styles.featureTitle}>עיצוב אינטואיטיבי</h3>
              <p className={styles.featureDescription}>
                בנו הערכות באופן ויזואלי על ידי גרירה וחיבור של רכיבים, בדיוק כמו הרכבת אבני בניין.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Award size={24} />
              </div>
              <h3 className={styles.featureTitle}>יושרה אקדמית</h3>
              <p className={styles.featureDescription}>
                צרו הערכות שמעריכות ידע באופן יעיל תוך מזעור הזדמנויות לרמאות בעזרת בינה מלאכותית.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <BookOpen size={24} />
              </div>
              <h3 className={styles.featureTitle}>מצוינות פדגוגית</h3>
              <p className={styles.featureDescription}>
                גישה לשיטות הטובות ביותר בתכנון הערכות, המובנות ישירות בספריית הרכיבים של הפלטפורמה.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3 className={styles.featureTitle}>ממוקד סטודנט</h3>
              <p className={styles.featureDescription}>
                עצבו הערכות שמעסיקות סטודנטים ומספקות חוויות למידה משמעותיות.
              </p>
            </div>
          </div>
        </section>
        
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>מוכנים לשנות את ההערכות שלכם?</h2>
            <p className={styles.ctaDescription}>
              התחילו לבנות את ההערכה הראשונה שלכם היום וחוו את ההבדל.
            </p>
            <Link to="/assessment-builder">
              <Button size="lg">התחילו עכשיו</Button>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
