import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Document,
  Packer,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Blocks that can be returned by HTML → DOCX conversion
 */
type DocxBlock = Paragraph | Table;

/**
 * Converts HTML string to DOCX blocks.
 * Supports paragraphs, headings, lists, and TABLES (tr/th/td).
 */
export function convertHtmlToDocxElements(html: string): DocxBlock[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const blocks: DocxBlock[] = [];
  doc.body.childNodes.forEach((node) => {
    blocks.push(...convertNodeToBlocks(node));
  });

  return blocks.filter(Boolean);
}

function convertNodeToBlocks(node: Node): DocxBlock[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").trim();
    if (!text) return [];
    return [new Paragraph({ children: [new TextRun(text)] })];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const el = node as HTMLElement;
  const tag = el.tagName.toUpperCase();

  if (tag === "TABLE") {
    return [convertTableElement(el)];
  }

  if (["P", "DIV", "SECTION", "ARTICLE"].includes(tag)) {
    return [new Paragraph({ children: convertInlineChildrenToRuns(el) })];
  }

  if (["H1", "H2", "H3"].includes(tag)) {
    return [
      new Paragraph({
        children: convertInlineChildrenToRuns(el, { bold: true }),
        spacing: { before: 200, after: 120 },
      }),
    ];
  }

  if (tag === "BR") {
    return [new Paragraph("")];
  }

  if (tag === "UL" || tag === "OL") {
    return Array.from(el.children)
      .filter((li) => li.tagName.toUpperCase() === "LI")
      .map(
        (li) =>
          new Paragraph({
            children: convertInlineChildrenToRuns(li as HTMLElement),
            bullet: tag === "UL" ? { level: 0 } : undefined,
          })
      );
  }

  const out: DocxBlock[] = [];
  el.childNodes.forEach((child) =>
    out.push(...convertNodeToBlocks(child))
  );
  return out;
}

function convertInlineChildrenToRuns(
  el: HTMLElement,
  opts?: { bold?: boolean; italics?: boolean }
): TextRun[] {
  const runs: TextRun[] = [];

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: opts?.bold,
            italics: opts?.italics,
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as HTMLElement;
    const tag = child.tagName.toUpperCase();

    if (tag === "BR") {
      runs.push(new TextRun({ break: 1 }));
      return;
    }

    if (tag === "STRONG" || tag === "B") {
      runs.push(
        ...convertInlineChildrenToRuns(child, {
          ...opts,
          bold: true,
        })
      );
      return;
    }

    if (tag === "EM" || tag === "I") {
      runs.push(
        ...convertInlineChildrenToRuns(child, {
          ...opts,
          italics: true,
        })
      );
      return;
    }

    runs.push(...convertInlineChildrenToRuns(child, opts));
  });

  if (!runs.length) runs.push(new TextRun(""));
  return runs;
}

/* ================= TABLE SUPPORT ================= */

function convertTableElement(tableEl: HTMLElement): Table {
  const rows = Array.from(tableEl.querySelectorAll("tr")).map((tr) =>
    convertTableRowElement(tr as HTMLElement)
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
    },
  });
}

function convertTableRowElement(trEl: HTMLElement): TableRow {
  const cells = Array.from(trEl.children)
    .filter((c) =>
      ["TD", "TH"].includes(c.tagName.toUpperCase())
    )
    .map((cell) =>
      convertTableCellElement(cell as HTMLElement)
    );

  return new TableRow({ children: cells });
}

function convertTableCellElement(cellEl: HTMLElement): TableCell {
  const isHeader = cellEl.tagName.toUpperCase() === "TH";

  return new TableCell({
    children: [
      new Paragraph({
        children: convertInlineChildrenToRuns(cellEl, {
          bold: isHeader,
        }),
        alignment: AlignmentType.LEFT,
      }),
    ],
    verticalAlign: "center",
  });
}

/* ================= EXPORT OPTIONS & FUNCTIONS ================= */

export interface ExportOptions {
  title: string;
  htmlContent: string;
  modelUsed: string;
  createdAt: Date;
  courseName?: string;
  faculty?: string;
  department?: string;
}

interface SavedAssignment {
  id: string;
  title: string;
  htmlContent: string;
  modelUsed: string;
  savedAt: string;
  createdAt: string;
  courseName?: string;
  faculty?: string;
  department?: string;
}

const PERSONAL_ASSIGNMENTS_STORAGE_KEY = "pedagogical-lego-personal-assignments";

/**
 * Exports HTML content to a Word document (.docx)
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
  try {
    const docxElements = convertHtmlToDocxElements(options.htmlContent);

    // Create document with title
    const titleParagraph = new Paragraph({
      children: [new TextRun({ text: options.title, bold: true, size: 32 })],
      spacing: { after: 200 },
    });

    // Add metadata paragraph
    const metadataText = [
      options.courseName && `קורס: ${options.courseName}`,
      options.faculty && `פקולטה: ${options.faculty}`,
      options.department && `מחלקה: ${options.department}`,
      `נוצר באמצעות: ${options.modelUsed}`,
      `תאריך יצירה: ${options.createdAt.toLocaleDateString("he-IL")}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const metadataParagraph = new Paragraph({
      children: [new TextRun({ text: metadataText, italics: true, size: 20 })],
      spacing: { after: 400 },
    });

    const doc = new Document({
      sections: [
        {
          children: [titleParagraph, metadataParagraph, ...docxElements],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${options.title.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, "_")}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw new Error(
      `Failed to export to Word: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Saves an assignment to the user's personal library (localStorage)
 */
export async function saveToPersonalLibrary(options: ExportOptions): Promise<void> {
  try {
    const assignments = getPersonalAssignments();
    const newAssignment: SavedAssignment = {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: options.title,
      htmlContent: options.htmlContent,
      modelUsed: options.modelUsed,
      savedAt: new Date().toISOString(),
      createdAt: options.createdAt.toISOString(),
      courseName: options.courseName,
      faculty: options.faculty,
      department: options.department,
    };

    assignments.push(newAssignment);
    localStorage.setItem(PERSONAL_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error("Error saving to personal library:", error);
    throw new Error(
      `Failed to save to personal library: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Saves an assignment to the shared archive (placeholder for future feature)
 */
export async function saveToSharedArchive(options: ExportOptions): Promise<void> {
  // TODO: Implement shared archive functionality
  console.log("Shared archive feature not yet implemented", options);
  throw new Error("Shared archive feature is not yet available");
}

/**
 * Retrieves all personal assignments from localStorage
 */
export function getPersonalAssignments(): SavedAssignment[] {
  try {
    const saved = localStorage.getItem(PERSONAL_ASSIGNMENTS_STORAGE_KEY);
    const assignments: SavedAssignment[] = saved ? JSON.parse(saved) : [];
    // Ensure all assignments have both savedAt and createdAt for compatibility
    return assignments.map((a) => ({
      ...a,
      createdAt: a.createdAt || a.savedAt,
      savedAt: a.savedAt || a.createdAt,
    }));
  } catch (error) {
    console.error("Error retrieving personal assignments:", error);
    return [];
  }
}

/**
 * Deletes a personal assignment by ID
 */
export function deletePersonalAssignment(id: string): void {
  try {
    const assignments = getPersonalAssignments();
    const filtered = assignments.filter((a) => a.id !== id);
    localStorage.setItem(PERSONAL_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting personal assignment:", error);
    throw new Error(
      `Failed to delete assignment: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
