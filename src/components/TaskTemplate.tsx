import React from 'react';

export interface TaskTemplateProps {
  courseName?: string;
  faculty?: string;
  department?: string;
  courseDescription: string;
  selectedPedagogicalComponents: string[];
}

export const TaskTemplate: React.FC<TaskTemplateProps> = ({
  courseName,
  faculty,
  department,
  courseDescription,
  selectedPedagogicalComponents
}) => {
  const actualCourseName = courseName || 'קורס אקדמי';
  const actualFaculty = faculty || 'מדעי הרוח';
  const actualDepartment = department || 'חינוך';
  const actualDescription = courseDescription || 'נושאי הקורס המרכזיים';
  const actualTips = selectedPedagogicalComponents?.length > 0 ? selectedPedagogicalComponents : ['הערכה פורמטיבית', 'למידה פעילה'];

  const containerStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '900px',
    margin: '0 auto',
    padding: '25px',
    lineHeight: 1.7,
    background: '#fafafa'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '40px',
    borderBottom: '3px solid #2563eb',
    paddingBottom: '20px'
  };

  const titleStyle: React.CSSProperties = {
    color: '#1e40af',
    fontSize: '2.2rem',
    margin: '0 0 10px 0',
    fontWeight: 700
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#3b82f6',
    fontSize: '1.5rem',
    margin: '0',
    fontWeight: 400
  };

  const sectionStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    padding: '20px',
    borderRadius: '10px',
    margin: '25px 0',
    borderRight: '5px solid #3b82f6'
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: '#1e40af',
    margin: '0 0 15px 0',
    fontSize: '1.3rem',
    display: 'flex',
    alignItems: 'center'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  };

  const tipStyle: React.CSSProperties = {
    background: '#fef3c7',
    padding: '4px 8px',
    borderRadius: '6px',
    margin: '0 5px',
    display: 'inline-block'
  };

  const objectiveStyle: React.CSSProperties = {
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px 0',
    borderRight: '4px solid #0ea5e9'
  };

  const instructionStyle: React.CSSProperties = {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px 0',
    border: '1px solid #e2e8f0'
  };

  const listStyle: React.CSSProperties = {
    paddingRight: '20px',
    margin: '10px 0'
  };

  const listItemStyle: React.CSSProperties = {
    marginBottom: '8px',
    lineHeight: 1.6
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const thStyle: React.CSSProperties = {
    background: '#f1f5f9',
    padding: '12px',
    textAlign: 'right',
    fontWeight: 600,
    border: '1px solid #e2e8f0',
    color: '#334155'
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'right',
    verticalAlign: 'top'
  };

  const requirementStyle: React.CSSProperties = {
    background: '#fff7ed',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px 0',
    borderRight: '4px solid #f97316'
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>
            🎯 מטלה אינטגרטיבית מתקדמת
          </h1>
          <h2 style={subtitleStyle}>
            {actualCourseName}
          </h2>
        </header>

        {/* Course Info Section */}
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            📋 מידע כללי על המטלה
          </h3>
          <div style={gridStyle}>
            <div><strong>פקולטה:</strong> {actualFaculty}</div>
            <div><strong>מחלקה:</strong> {actualDepartment}</div>
            <div><strong>משך ביצוע:</strong> 3-4 שבועות</div>
            <div><strong>סוג הגשה:</strong> עבודה כתובה + מצגת</div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <strong>שיטות פדגוגיות משולבות:</strong>{' '}
            {actualTips.map((tip, index) => (
              <span key={index} style={tipStyle}>
                {tip}
              </span>
            ))}
          </div>
        </section>

        {/* Objectives */}
        <section style={objectiveStyle}>
          <h3 style={sectionTitleStyle}>
            🎯 מטרות המטלה
          </h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              פיתוח הבנה מעמיקה של נושאי הקורס המרכזיים ושילובם בפרקטיקה
            </li>
            <li style={listItemStyle}>
              חיזוק יכולות החשיבה הביקורתית והאנליטית
            </li>
            <li style={listItemStyle}>
              פיתוח מיומנויות מחקר אקדמי ופרזנטציה מקצועית
            </li>
            <li style={listItemStyle}>
              יישום השיטות הפדגוגיות שנבחרו בהקשר אקדמי מתאים
            </li>
          </ul>
        </section>

        {/* Instructions */}
        <section style={instructionStyle}>
          <h3 style={sectionTitleStyle}>
            📝 הוראות המטלה
          </h3>
          <ol style={listStyle}>
            <li style={listItemStyle}>
              <strong>בחירת נושא:</strong> בחרו נושא מרכזי מתוך {actualDescription}
            </li>
            <li style={listItemStyle}>
              <strong>איסוף מידע:</strong> אספו חומרים אקדמיים מהימנים (מינימום 5 מקורות)
            </li>
            <li style={listItemStyle}>
              <strong>ניתוח והשוואה:</strong> נתחו את הנושא מזוויות שונות
            </li>
            <li style={listItemStyle}>
              <strong>שילוב השיטות הפדגוגיות:</strong> יישמו את השיטות שנבחרו: {actualTips.join(', ')}
            </li>
            <li style={listItemStyle}>
              <strong>הכנת מצגת:</strong> הכינו מצגת של 15-20 דקות
            </li>
            <li style={listItemStyle}>
              <strong>כתיבת עבודה:</strong> כתבו עבודה של 2000-3000 מילים
            </li>
          </ol>
        </section>

        {/* Rubric */}
        <section>
          <h3 style={sectionTitleStyle}>
            📊 מחוון הערכה
          </h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>קריטריון</th>
                <th style={thStyle}>משקל</th>
                <th style={thStyle}>מצוין (90-100)</th>
                <th style={thStyle}>טוב (80-89)</th>
                <th style={thStyle}>בסיסי (70-79)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}><strong>תוכן ואיכות מחקר</strong></td>
                <td style={tdStyle}>30%</td>
                <td style={tdStyle}>מחקר מעמיק, מקורות מהימנים ועדכניים</td>
                <td style={tdStyle}>מחקר טוב עם מקורות רלוונטיים</td>
                <td style={tdStyle}>מחקר בסיסי, מקורות חלקיים</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong>ניתוח וביקורת</strong></td>
                <td style={tdStyle}>25%</td>
                <td style={tdStyle}>ניתוח מקורי ותובנות חדשות</td>
                <td style={tdStyle}>ניתוח טוב עם קשרים ברורים</td>
                <td style={tdStyle}>ניתוח שטחי, חסרה עומק</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong>שילוב שיטות פדגוגיות</strong></td>
                <td style={tdStyle}>20%</td>
                <td style={tdStyle}>שילוב מעולה ויצירתי</td>
                <td style={tdStyle}>שילוב טוב ומותאם</td>
                <td style={tdStyle}>שילוב בסיסי וחלקי</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong>הצגה ועיצוב</strong></td>
                <td style={tdStyle}>15%</td>
                <td style={tdStyle}>מצגת מקצועית ומרשימה</td>
                <td style={tdStyle}>מצגת ברורה ומאורגנת</td>
                <td style={tdStyle}>מצגת בסיסית</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong>כתיבה ועיצוב</strong></td>
                <td style={tdStyle}>10%</td>
                <td style={tdStyle}>כתיבה זורמת, מבנה מצוין</td>
                <td style={tdStyle}>כתיבה ברורה, מבנה טוב</td>
                <td style={tdStyle}>כתיבה בסיסית</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Requirements */}
        <section style={requirementStyle}>
          <h3 style={sectionTitleStyle}>
            ⚡ דרישות הגשה
          </h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>הגשה עד תאריך: _____ (יוגדר על ידי המרצה)</li>
            <li style={listItemStyle}>פורמט: קובץ Word + מצגת PowerPoint</li>
            <li style={listItemStyle}>אורך: 2000-3000 מילים + מצגת 15-20 דקות</li>
            <li style={listItemStyle}>גופן: Arial או Times New Roman, גודל 12</li>
            <li style={listItemStyle}>ציטוטים: לפי תקן APA או כל תקן אקדמי מקובל</li>
            <li style={listItemStyle}>הגשה דרך: מערכת ה-LMS של המוסד</li>
          </ul>
        </section>

        {/* Footer */}
        <footer style={footerStyle}>
          <p style={{ margin: '10px 0', color: '#64748b', fontSize: '0.9rem' }}>
            <strong>שימו לב:</strong> מטלה זו נוצרה באמצעות מערכת בונה הערכות חכמה{' '}
            <em>(Generated by Advanced Assessment Builder {new Date().getFullYear()})</em>
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>
            סיסטם זה מבוסס על מחקרי חינוך מתקדמים ועקרונות פדגוגיה דיגיטלית 🚀
          </p>
        </footer>
      </div>
    </div>
  );
}; 