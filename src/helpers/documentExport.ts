import { saveAs } from 'file-saver';
// ❌ הוסרו כדי לא לקרוס בפרודקשן
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

import { RubricCriteria } from '../features/assessmentBuilder/lib/assessmentTypes';

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
 * משתמש בספריית docx בלבד (ללא html-to-docx)
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
  try {
    // Dynamically import docx to avoid bundling issues
    const docxModule = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = docxModule;
    
    // Parse HTML content to extract structured elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = options.htmlContent;
    
    // Convert HTML elements to docx paragraphs
    const children = convertHtmlToDocxElements(tempDiv, docxModule);
    
    // Build document sections
    const doc = new Document({
      sections: [{
        children: [
          // Title
          new Paragraph({
            text: options.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Course details
          ...(options.courseName ? [new Paragraph({
            text: `קורס: ${options.courseName}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          })] : []),
          ...(options.faculty ? [new Paragraph({
            text: `פקולטה: ${options.faculty}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          })] : []),
          ...(options.department ? [new Paragraph({
            text: `מחלקה: ${options.department}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          })] : []),
          new Paragraph({
            text: `תאריך יצירה: ${options.createdAt.toLocaleDateString('he-IL')}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),
          // Content
          ...children,
          // Footer
          new Paragraph({
            text: `נוצר באמצעות: ${options.modelUsed}`,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: `מערכת: פדגוגיקל לגו - מחולל מטלות חכם`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `זמן יצירה: ${options.createdAt.toLocaleDateString('he-IL')} בשעה ${options.createdAt.toLocaleTimeString('he-IL')}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = generateFileName(options);
    saveAs(blob, fileName);
  } catch (error: any) {
    console.error('❌ Error exporting to Word:', error);
    throw new Error(
      `שגיאה ביצוא לקובץ Word: ${error?.message || 'שגיאה לא ידועה'}. ` +
      'בדוק את הקונסולה לפרטים טכניים.'
    );
  }
}

/**
 * Convert HTML elements to docx elements
 */
function convertHtmlToDocxElements(element: HTMLElement, docxModule: any): any[] {
  const { Paragraph, HeadingLevel, AlignmentType } = docxModule;
  const result: any[] = [];
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );
  
  let node: Node | null = walker.nextNode();
  let currentParagraph: string[] = [];
  
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        currentParagraph.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      
      // Flush current paragraph if we hit a block element
      if (currentParagraph.length > 0 && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'li'].includes(tagName)) {
        result.push(new Paragraph({
          text: currentParagraph.join(' '),
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 },
        }));
        currentParagraph = [];
      }
      
      // Handle headings
      if (tagName === 'h1') {
        const text = el.textContent?.trim() || '';
        if (text) {
          result.push(new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 200 },
          }));
        }
      } else if (tagName === 'h2') {
        const text = el.textContent?.trim() || '';
        if (text) {
          result.push(new Paragraph({
            text,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 250, after: 200 },
          }));
        }
      } else if (tagName === 'h3') {
        const text = el.textContent?.trim() || '';
        if (text) {
          result.push(new Paragraph({
            text,
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 200 },
          }));
        }
      } else if (tagName === 'p') {
        const text = el.textContent?.trim() || '';
        if (text) {
          result.push(new Paragraph({
            text,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }));
        }
      } else if (tagName === 'li') {
        const text = el.textContent?.trim() || '';
        if (text) {
          result.push(new Paragraph({
            text: `• ${text}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            indent: { left: 400 },
          }));
        }
      } else if (tagName === 'br') {
        if (currentParagraph.length > 0) {
          result.push(new Paragraph({
            text: currentParagraph.join(' '),
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }));
          currentParagraph = [];
        } else {
          result.push(new Paragraph({
            text: '',
            spacing: { after: 100 },
          }));
        }
      }
    }
    
    node = walker.nextNode();
  }
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    result.push(new Paragraph({
      text: currentParagraph.join(' '),
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
    }));
  }
  
  return result;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
    // Dynamically import docx to avoid bundling issues
    const docxModule = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = docxModule;
    
    // Parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = assessmentHTML;
    
    // Convert HTML elements to docx paragraphs
    const children = convertHtmlToDocxElements(tempDiv, docxModule);
    
    const doc = new Document({
      sections: [{
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
  } catch (error: any) {
    console.error('Error exporting to DOCX:', error);
    const errorDetails = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    };
    console.error('DOCX export error details:', errorDetails);
    throw new Error(`שגיאה ביצוא DOCX: ${error?.message || 'שגיאה לא ידועה'}`);
  }
};
