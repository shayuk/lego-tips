import { saveAs } from 'file-saver';
// ❌ הוסרו כדי לא לקרוס בפרודקשן
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

import { RubricCriteria } from '../features/assessmentBuilder/lib/assessmentTypes';
import { Packer, Paragraph, TextRun, Document } from 'docx';

export interface ExportOptions {
  title: string;
  htmlContent: string;
  modelUsed: string;
  createdAt: Date;
  courseName?: string;
  faculty?: string;
  department?: string;
}

// ✅ פונקציה חדשה – ייצוא ל־PDF עם טבלת autoTable
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
  }
}

export function exportToPDF(): void {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();
  doc.autoTable({
    head: [['קטגוריה', 'תיאור']],
    body: [
      ['מעורבות', 'משקף את רמת ההשתתפות של הסטודנט'],
      ['דיוק', 'עד כמה התשובות נכונות'],
    ],
  });
  doc.save('rubric.pdf');
}

/**
 * יצוא המטלה לקובץ Word (.docx)
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
  try {
    const { default: HTMLtoDOCX } = await import('html-to-docx');
    const { saveAs } = await import('file-saver');

    const documentContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', 'David', sans-serif; direction: rtl; text-align: right; line-height: 1.6; margin: 20px; }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; font-size: 24px; }
          h2 { color: #34495e; margin-top: 25px; font-size: 20px; }
          h3 { color: #7f8c8d; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
          th, td { border: 1px solid #bdc3c7; padding: 12px; text-align: right; }
          th { background-color: #ecf0f1; font-weight: bold; }
          p { margin-bottom: 10px; font-size: 14px; }
          ul, ol { padding-right: 20px; }
          li { margin-bottom: 5px; }
          .document-header { text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
          .document-footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; font-size: 12px; color: #6c757d; }
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

    const docxBlob = await HTMLtoDOCX(documentContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: 'Arial'
    });

    const fileName = generateFileName(options);
    saveAs(docxBlob, fileName);
  } catch (error) {
    console.error('❌ Error exporting to Word:', error);
    throw new Error(`שגיאה ביצוא לקובץ Word. בדוק את הקונסולה לפרטים טכניים.`);
  }
}

function generateFileName(options: ExportOptions): string {
  const date = options.createdAt;
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  const safeCourseOrTitle = (options.courseName || options.title || 'מטלה')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  return `מטלה_${safeCourseOrTitle}_${dateStr}_${timeStr}.docx`;
}

export async function saveToPersonalLibrary(options: ExportOptions): Promise<void> {
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
}

export async function saveToSharedArchive(options: ExportOptions): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export function getPersonalAssignments(): any[] {
  return JSON.parse(localStorage.getItem('personalAssignments') || '[]');
}

export function deletePersonalAssignment(id: string): void {
  const savedAssignments = getPersonalAssignments();
  const filtered = savedAssignments.filter(assignment => assignment.id !== id);
  localStorage.setItem('personalAssignments', JSON.stringify(filtered));
}

export const exportAssessmentToDOCX = async (assessmentHTML: string, fileName: string) => {
  try {
    const HTMLtoDOCX = (await import('html-to-docx')).default;
    const docxBlob = await HTMLtoDOCX(assessmentHTML, {});
    saveAs(docxBlob, `${fileName}.docx`);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
  }
};
