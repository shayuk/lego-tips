import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Info } from "lucide-react";
import { Helmet } from "react-helmet";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Badge } from "../components/Badge";
import { assessmentMethods, type AssessmentMethodCategory } from "../helpers/assessmentTypes";
import styles from "./my-assessments.module.css";

// Mock data for user's assessments. In a real app, this would come from an API.
const mockUserAssessments = [
  {
    id: "asmt_1",
    title: "מבוא לפסיכולוגיה - מבחן אמצע סמסטר",
    description: "מבחן קצר מבוסס על 5 פרקים ראשונים של הקורס.",
    lastModified: "2024-07-15T10:30:00Z",
    status: "Published",
  },
  {
    id: "asmt_2",
    title: "סדנת כתיבה מתקדמת - הגשת פורטפוליו",
    description: "איסוף עבודות לאורך הסמסטר להערכת התקדמות.",
    lastModified: "2024-07-12T15:00:00Z",
    status: "Draft",
  },
  {
    id: "asmt_3",
    title: "אתגר בינה מלאכותית - ניתוח אירוע",
    description: "משימת ניתוח אירוע אקטואלי באמצעות כלי AI.",
    lastModified: "2024-06-28T09:00:00Z",
    status: "Archived",
  },
];

type UserAssessment = (typeof mockUserAssessments)[0];

const AssessmentCard = ({ assessment }: { assessment: UserAssessment }) => (
  <div className={styles.assessmentCard}>
    <div className={styles.assessmentInfo}>
      <h3 className={styles.assessmentTitle}>{assessment.title}</h3>
      <p className={styles.assessmentDescription}>{assessment.description}</p>
      <div className={styles.assessmentMeta}>
        <span>
          עודכן לאחרונה: {new Date(assessment.lastModified).toLocaleDateString("he-IL")}
        </span>
        <Badge
          variant={
            assessment.status === "Published"
              ? "default"
              : assessment.status === "Draft"
              ? "outline"
              : "secondary"
          }
        >
          {assessment.status}
        </Badge>
      </div>
    </div>
    <div className={styles.assessmentActions}>
      <Button variant="ghost" size="icon">
        <Edit size={18} />
      </Button>
      <Button variant="ghost" size="icon" className={styles.destructiveAction}>
        <Trash2 size={18} />
      </Button>
    </div>
  </div>
);

const MethodCard = ({ method }: { method: (typeof assessmentMethods)[0] }) => (
  <div className={styles.methodCard}>
    <div className={styles.methodHeader}>
      <h3 className={styles.methodTitle}>{method.title}</h3>
      <Button variant="ghost" size="icon-sm">
        <Info size={16} />
      </Button>
    </div>
    <p className={styles.methodDescription}>{method.description}</p>
    <div className={styles.methodTags}>
      {method.categories.map((cat) => (
        <Badge key={cat} variant="secondary">
          {
            {
              introduction: "קורסי מבוא",
              large: "כיתות גדולות",
              advanced: "קורסים מתקדמים",
            }[cat]
          }
        </Badge>
      ))}
    </div>
  </div>
);

export default function MyAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<AssessmentMethodCategory | "all">("all");

  const filteredMethods = useMemo(() => {
    return assessmentMethods.filter((method) => {
      const matchesCategory =
        activeCategory === "all" || method.categories.includes(activeCategory);
      const matchesSearch =
        method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Helmet>
        <title>ההערכות שלי - AssessmentBuilder</title>
        <meta
          name="description"
          content="נהל את ההערכות שלך וגלה שיטות הערכה חלופיות חדשניות."
        />
      </Helmet>
      <div className={styles.container} dir="rtl">
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>ההערכות שלי</h1>
            <p className={styles.subtitle}>
              נהל את ההערכות שלך וגלה שיטות הערכה חדשות.
            </p>
          </div>
          <Link to="/assessment-builder">
            <Button size="lg">
              <Plus size={20} />
              <span>צור הערכה חדשה</span>
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="my-assessments" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="my-assessments">ההערכות שלי</TabsTrigger>
            <TabsTrigger value="explore-methods">גלה שיטות הערכה</TabsTrigger>
          </TabsList>

          <TabsContent value="my-assessments" className={styles.tabContent}>
            {mockUserAssessments.length > 0 ? (
              <div className={styles.assessmentsGrid}>
                {mockUserAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h2>עדיין לא יצרת הערכות.</h2>
                <p>לחץ על "צור הערכה חדשה" כדי להתחיל.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explore-methods" className={styles.tabContent}>
            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <Search size={20} className={styles.searchIcon} />
                <Input
                  type="search"
                  placeholder="חפש שיטת הערכה..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.categoryFilters}>
                <Button
                  variant={activeCategory === "all" ? "primary" : "outline"}
                  onClick={() => setActiveCategory("all")}
                >
                  הכל
                </Button>
                <Button
                  variant={
                    activeCategory === "introduction" ? "primary" : "outline"
                  }
                  onClick={() => setActiveCategory("introduction")}
                >
                  קורסי מבוא
                </Button>
                <Button
                  variant={activeCategory === "large" ? "primary" : "outline"}
                  onClick={() => setActiveCategory("large")}
                >
                  כיתות גדולות
                </Button>
                <Button
                  variant={
                    activeCategory === "advanced" ? "primary" : "outline"
                  }
                  onClick={() => setActiveCategory("advanced")}
                >
                  קורסים מתקדמים
                </Button>
              </div>
            </div>
            <div className={styles.methodsGrid}>
              {filteredMethods.map((method) => (
                <MethodCard key={method.id} method={method} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
