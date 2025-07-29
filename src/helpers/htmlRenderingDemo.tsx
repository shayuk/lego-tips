import React from 'react';
import { renderToString } from 'react-dom/server';
import { TaskTemplate } from '../components/TaskTemplate';

/**
 * דמו להמחשת ההבדל בין יצירת HTML במחרוזות ליצירה עם React
 */

// ❌ הדרך הישנה - קשה לקריאה ותחזוקה
export function generateHTMLTheOldWay(courseName: string, faculty: string) {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h1 style="color: blue; font-size: 24px;">
        ${courseName}
      </h1>
      <p style="color: gray;">
        פקולטה: ${faculty}
      </p>
      <div style="background: lightblue; padding: 10px;">
        <ul style="margin: 0; padding-right: 20px;">
          <li>מטרה 1</li>
          <li>מטרה 2</li>
        </ul>
      </div>
    </div>
  `;
}

// ✅ הדרך החדשה - קריאה וניתנת לתחזוקה
export function generateHTMLTheNewWay(courseName: string, faculty: string) {
  const props = {
    courseName,
    faculty,
    department: 'מחלקה לדוגמה',
    courseDescription: 'תיאור הקורס',
    selectedPedagogicalComponents: ['למידה פעילה', 'הערכה פורמטיבית']
  };

  return renderToString(React.createElement(TaskTemplate, props));
}

// דמו להשוואה
export function demonstrateImprovement() {
  const courseName = "מבוא לפסיכולוגיה";
  const faculty = "מדעי החברה";

  console.log('=== השוואת שיטות יצירת HTML ===');
  
  // הדרך הישנה
  console.time('Old Way Performance');
  const oldWayHTML = generateHTMLTheOldWay(courseName, faculty);
  console.timeEnd('Old Way Performance');
  console.log('📏 אורך HTML הישן:', oldWayHTML.length, 'תווים');
  
  // הדרך החדשה
  console.time('New Way Performance');
  const newWayHTML = generateHTMLTheNewWay(courseName, faculty);
  console.timeEnd('New Way Performance');
  console.log('📏 אורך HTML החדש:', newWayHTML.length, 'תווים');
  
  console.log('\n✅ היתרונות של הדרך החדשה:');
  console.log('• קריאות קוד משופרת');
  console.log('• ניתן לשימוש חוזר');
  console.log('• Type safety מלא');
  console.log('• קל לדיבוג');
  console.log('• ניתן לבדיקות unit testing');
  console.log('• תמיכה מלאה ב-JSX');
  
  return {
    oldWay: {
      html: oldWayHTML,
      benefits: ['פשוט לכתיבה מהירה'],
      drawbacks: ['קשה לקריאה', 'שגיאות syntax', 'קשה לתחזוקה', 'אין type safety', 'קשה לדיבוג']
    },
    newWay: {
      html: newWayHTML,
      benefits: [
        'קריאות מעולה', 
        'Type safety מלא',
        'שימוש חוזר',
        'קל לבדיקות',
        'תמיכת IDE מלאה',
        'JSX syntax מוכר'
      ],
      drawbacks: ['דורש הבנת React (קל ללמידה)']
    }
  };
} 