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
              הטיפים הפדגוגיים הטובים ביותר
              <span className={styles.highlight}> במקום אחד</span>
            </h1>
            <p className={styles.heroDescription}>
              הטיפים הפדגוגיים הטובים ביותר במקום אחד. בנו הערכות באופן ויזואלי עם רכיבים מוכנים שמרצים שיתפו מניסיונם. שתפו, למדו, ובנו יחד הערכות מותאמות עידן AI 
              <br /><br />
              הצטרפו עכשיו.
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
          <div className={styles.heroImageContainer}>
            <div className={styles.logoContainer}>
              <img 
                src="/logos/ariel-innovation-official.png" 
                alt="אוניברסיטת אריאל בשומרון" 
                className={styles.logo}
              />
            </div>
            <div className={styles.heroImage}>
              <img 
                src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="בונה ההערכות" 
                className={styles.image}
              />
            </div>
          </div>
        </section>
        
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>למה להשתמש בבונה ההערכות?</h2>
          
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
