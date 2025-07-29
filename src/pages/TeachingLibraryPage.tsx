import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { PedagogicalLibrary } from "../components/PedagogicalLibrary";
import { PedagogicalTips } from "../features/pedagogicalTips/components/PedagogicalTips";
import styles from "./TeachingLibraryPage.module.css";

export default function TeachingLibraryPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        📚 ספריית הטיפים הפדגגוגיים
      </h1>

      <a href="https://ai-practices.iucc.ac.il/" target="_blank" rel="noopener noreferrer" className={styles.meitalBanner}>
        <img src="/logos/LOGO MEITAL.png" alt="לוגו מיט,ל" className={styles.meitalLogo} />
        <div className={styles.meitalText}>
          <p className={styles.meitalTitle}><strong>מקור ידע מומלץ: אתר מיט"ל</strong></p>
          <p>מאגר פרקטיקות וכלים לשילוב מושכל של בינה מלאכותית בהוראה ובלמידה.</p>
        </div>
      </a>

      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">💡 ספריית שיטות הערכה</TabsTrigger>
          <TabsTrigger value="bloom">🧠 הערכות ממוקדות בלום</TabsTrigger>
        </TabsList>

        <TabsContent value="methods">
          <PedagogicalLibrary />
        </TabsContent>

        <TabsContent value="bloom">
          <PedagogicalTips />
        </TabsContent>
      </Tabs>
    </div>
  );
}
