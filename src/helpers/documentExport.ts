// This file provides functions for exporting assessments to various formats.

/**
 * Interface for document export options
 */
export interface ExportOptions {
  title: string;
  htmlContent: string;
  modelUsed: string;
  createdAt: Date;
  courseName?: string;
  faculty?: string;
  department?: string;
}

/**
 * יצוא המטלה לקובץ Word (.docx) ושמירה במחשב המשתמש
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
  try {
    console.log('📄 Starting Word export process...', {
      title: options.title,
    });

    // 1. Dynamic import of libraries only when needed
    const { default: HTMLtoDOCX } = await import('html-to-docx');
    const { saveAs } = await import('file-saver');
    console.log('✅ Libraries dynamically loaded.');

    // הכנת תוכן מעוצב לקובץ Word
    const documentContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Arial', 'David', sans-serif; 
            direction: rtl; 
            text-align: right;
            line-height: 1.6;
            margin: 20px;
          }
          h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px;
            font-size: 24px;
          }
          h2 { 
            color: #34495e; 
            margin-top: 25px;
            font-size: 20px;
          }
          h3 { 
            color: #7f8c8d; 
            font-size: 18px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 14px;
          }
          th, td { 
            border: 1px solid #bdc3c7; 
            padding: 12px; 
            text-align: right;
          }
          th { 
            background-color: #ecf0f1; 
            font-weight: bold;
          }
          p { 
            margin-bottom: 10px;
            font-size: 14px;
          }
          ul, ol { 
            padding-right: 20px;
          }
          li { 
            margin-bottom: 5px;
          }
          .document-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .document-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            font-size: 12px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="document-header">
          <h1>${options.title}</h1>
          ${options.courseName ? `<p><strong>קורס:</strong> ${options.courseName}</p>` : ''}
          ${options.faculty ? `<p><strong>פקולטה:</strong> ${options.faculty}</p>` : ''}
          ${options.department ? `<p><strong>מחלקה:</strong> ${options.department}</p>` : ''}
          <p><strong>תאריך יצירה:</strong> ${options.createdAt.toLocaleDateString('he-IL')}</p>
        </div>
        
        ${options.htmlContent}
        
        <div class="document-footer">
          <p><strong>נוצר באמצעות:</strong> ${options.modelUsed}</p>
          <p><strong>מערכת:</strong> פדגוגיקל לגו - מחולל מטלות חכם</p>
          <p><strong>זמן יצירה:</strong> ${options.createdAt.toLocaleDateString('he-IL')} בשעה ${options.createdAt.toLocaleTimeString('he-IL')}</p>
        </div>
      </body>
      </html>
    `;

    // המרה ל-DOCX
    const docxBlob = await HTMLtoDOCX(documentContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: 'Arial'
    });

    // שם קובץ מובנה
    const fileName = generateFileName(options);
    
    console.log('💾 Saving Word document:', fileName);
    
    // שמירת הקובץ
    saveAs(docxBlob, fileName);
    
    console.log('✅ Word export completed successfully');
    
  } catch (error) {
    console.error('❌ Error exporting to Word:', error);
    // Provide a user-friendly error message
    throw new Error(`שגיאה ביצוא לקובץ Word. בדוק את הקונסולה לפרטים טכניים.`);
  }
}

/**
 * יצירת שם קובץ מובנה ומתאים
 */
function generateFileName(options: ExportOptions): string {
  const date = options.createdAt;
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  // ניקוי שם הקורס מתווים לא חוקיים לשם קובץ
  const safeCourseOrTitle = (options.courseName || options.title || 'מטלה')
    .replace(/[<>:"/\\|?*]/g, '') // הסרת תווים לא חוקיים
    .replace(/\s+/g, '_') // החלפת רווחים בקווים תחתונים
    .substring(0, 30); // הגבלת אורך
  
  return `מטלה_${safeCourseOrTitle}_${dateStr}_${timeStr}.docx`;
}

/**
 * שמירה מקומית (placeholder לעתיד - כאשר יהיה חשבון משתמש)
 */
export async function saveToPersonalLibrary(options: ExportOptions): Promise<void> {
  // TODO: יישום עתידי עם מסד נתונים
  console.log('💾 [Future Feature] Save to personal library:', options.title);
  
  // כרגע נשמור ב-localStorage כ-placeholder
  const savedAssignments = JSON.parse(localStorage.getItem('personalAssignments') || '[]');
  const newAssignment = {
    id: Date.now().toString(),
    title: options.title,
    htmlContent: options.htmlContent,
    modelUsed: options.modelUsed,
    createdAt: options.createdAt.toISOString(),
    courseName: options.courseName,
    faculty: options.faculty,
    department: options.department,
    savedAt: new Date().toISOString()
  };
  
  savedAssignments.push(newAssignment);
  localStorage.setItem('personalAssignments', JSON.stringify(savedAssignments));
  
  console.log('✅ Saved to personal library (localStorage)');
}

/**
 * שמירה לארכיון משותף (placeholder לעתיד - כאשר יהיה שרת)
 */
export async function saveToSharedArchive(options: ExportOptions): Promise<void> {
  // TODO: יישום עתידי עם שרת ומסד נתונים
  console.log('📚 [Future Feature] Save to shared archive:', options.title);
  
  // כרגע נדמה שמירה לשרת
  await new Promise(resolve => setTimeout(resolve, 1000)); // סימולציה של קריאת שרת
  
  console.log('✅ Would save to shared archive (server not implemented yet)');
}

/**
 * קבלת רשימת המטלות השמורות מקומית
 */
export function getPersonalAssignments(): any[] {
  return JSON.parse(localStorage.getItem('personalAssignments') || '[]');
}

/**
 * מחיקת מטלה מהשמירה המקומית
 */
export function deletePersonalAssignment(id: string): void {
  const savedAssignments = getPersonalAssignments();
  const filtered = savedAssignments.filter(assignment => assignment.id !== id);
  localStorage.setItem('personalAssignments', JSON.stringify(filtered));
} 