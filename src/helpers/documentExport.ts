import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { downloadDocx } from '../utils/downloadDocx';

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
    const lines = htmlToLines(options.htmlContent);
    const children: Paragraph[] = [
      new Paragraph({ text: options.title, heading: HeadingLevel.HEADING_1 }),
    ];

    if (options.courseName)
      children.push(new Paragraph(`קורס: ${options.courseName}`));
    if (options.faculty)
      children.push(new Paragraph(`פקולטה: ${options.faculty}`));
    if (options.department)
      children.push(new Paragraph(`מחלקה: ${options.department}`));

    children.push(new Paragraph(`תאריך יצירה: ${options.createdAt.toLocaleDateString('he-IL')}`));
    children.push(new Paragraph(""));

    lines.forEach((line) => {
      children.push(new Paragraph(line));
    });

    children.push(new Paragraph(""));
    children.push(new Paragraph(`נוצר באמצעות: ${options.modelUsed}`));

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = generateFileName(options);
    downloadDocx(blob, fileName);
  } catch (error) {
    console.error('❌ Error exporting to Word:', error);
    throw new Error(`שגיאה ביצוא לקובץ Word. בדוק את הקונסולה לפרטים טכניים.`);
  }
}

function htmlToLines(html: string): string[] {
  return html
    .replace(/<br\s*\/?>(?=\s*<)/gi, '\n')
    .replace(/<\/?p>/gi, '\n')
    .replace(/<\/?li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
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

