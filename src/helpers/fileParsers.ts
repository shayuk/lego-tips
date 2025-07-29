// src/helpers/fileParsers.ts

import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist'; // נתיב מתוקן

if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

export const parseFileContent = async (file: File): Promise<string> => {
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();

    try {
        if (fileType === 'application/pdf') {
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
            }
            return textContent;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } else if (fileType.startsWith('text/')) {
            const decoder = new TextDecoder();
            return decoder.decode(arrayBuffer);
        } else {
            console.warn(`Unsupported file type: ${fileType}. Returning empty string.`);
            return '';
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw new Error('Failed to parse file content.');
    }
}; 