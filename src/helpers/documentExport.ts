import type {
  Paragraph as DocxParagraph,
  TextRun as DocxTextRun,
} from 'docx';
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

let docxModule: typeof import('docx') | null = null;

async function loadDocx() {
  if (!docxModule) {
    docxModule = await import('docx');
  }
  return docxModule;
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
    const { Document, HeadingLevel, Paragraph, Packer, AlignmentType } =
      await loadDocx();

    const children: DocxParagraph[] = [
      new Paragraph({
        text: options.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    ];

    if (options.courseName)
      children.push(
        new Paragraph({
          text: `קורס: ${options.courseName}`,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      );
    if (options.faculty)
      children.push(
        new Paragraph({
          text: `פקולטה: ${options.faculty}`,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      );
    if (options.department)
      children.push(
        new Paragraph({
          text: `מחלקה: ${options.department}`,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      );

    children.push(
      new Paragraph({
        text: `תאריך יצירה: ${options.createdAt.toLocaleDateString('he-IL')}`,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    );
    children.push(new Paragraph({}));

    children.push(...htmlToDocxParagraphs(options.htmlContent));
    children.push(new Paragraph({}));

    const footerInfo = [
      `יוצר באמצעות: ${options.modelUsed}`,
      'מערכת: פדגוגיקל-לגו',
      `זמן יצירה: ${(options.createdAt ?? new Date()).toLocaleString('he-IL')}`,
    ];
    footerInfo.forEach((line) =>
      children.push(
        new Paragraph({
          text: line,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      ),
    );

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

function htmlToDocxParagraphs(html: string): DocxParagraph[] {
  if (!docxModule) {
    throw new Error('docx module not loaded');
  }

  const { Paragraph, TextRun, HeadingLevel, AlignmentType } = docxModule;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());

  const paragraphs: DocxParagraph[] = [];

  const headingMap: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    H1: HeadingLevel.HEADING_1,
    H2: HeadingLevel.HEADING_2,
    H3: HeadingLevel.HEADING_3,
    H4: HeadingLevel.HEADING_4,
    H5: HeadingLevel.HEADING_5,
    H6: HeadingLevel.HEADING_6,
  };

  interface RunStyle {
    bold?: boolean;
    italics?: boolean;
    underline?: {};
  }

  const parseNode = (
    node: Node,
    style: RunStyle = {},
  ): DocxTextRun[] => {
    const runs: DocxTextRun[] = [];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, ' ') ?? '';
      if (text.trim()) runs.push(new TextRun({ text, ...style }));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'BR') {
        runs.push(new TextRun({ break: 1 }));
        return runs;
      }
      const nextStyle = { ...style };
      if (el.tagName === 'B' || el.tagName === 'STRONG') nextStyle.bold = true;
      if (el.tagName === 'I' || el.tagName === 'EM') nextStyle.italics = true;
      if (el.tagName === 'U') nextStyle.underline = {};
      el.childNodes.forEach((child) => {
        runs.push(...parseNode(child, nextStyle));
      });
    }
    return runs;
  };

  const parseInline = (el: HTMLElement): DocxTextRun[] => {
    const runs: DocxTextRun[] = [];
    el.childNodes.forEach((child) => {
      runs.push(...parseNode(child));
    });
    return runs;
  };

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (headingMap[el.tagName]) {
        const children = parseInline(el);
        if (children.length)
          paragraphs.push(
            new Paragraph({
              children,
              heading: headingMap[el.tagName],
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
      } else if (el.tagName === 'P') {
        const children = parseInline(el);
        if (children.length)
          paragraphs.push(
            new Paragraph({
              children,
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
      } else if (el.tagName === 'UL') {
        Array.from(el.querySelectorAll(':scope > li')).forEach((li) => {
          const children = parseInline(li as HTMLElement);
          if (children.length)
            paragraphs.push(
              new Paragraph({
                children,
                bullet: { level: 0 },
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
              }),
            );
        });
      } else if (el.tagName === 'OL') {
        const items = Array.from(el.querySelectorAll(':scope > li'));
        items.forEach((li, idx) => {
          const children = parseInline(li as HTMLElement);
          if (children.length)
            paragraphs.push(
              new Paragraph({
                children: [new TextRun(`${idx + 1}. `), ...children],
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
              }),
            );
        });
      } else if (el.tagName === 'BR') {
        paragraphs.push(
          new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true }),
        );
      } else {
        const children = parseInline(el);
        if (children.length)
          paragraphs.push(
            new Paragraph({
              children,
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim();
      if (text)
        paragraphs.push(
          new Paragraph({
            text,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        );
    }
  });

  return paragraphs;
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

