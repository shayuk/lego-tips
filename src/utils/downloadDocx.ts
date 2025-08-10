import { saveAs } from 'file-saver';

/**
 * Trigger a download of DOCX data.
 * Accepts either a Blob or a Uint8Array and ensures
 * the correct MIME type and file extension.
 */
export function downloadDocx(data: Blob | Uint8Array, fileName: string): void {
  const blob = data instanceof Blob
    ? data
    : new Blob([data], {
        type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

  const finalName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  saveAs(blob, finalName);
}
