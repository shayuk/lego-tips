/**
 * Advanced text cleaning utility for PDF/DOC files
 * This utility safely removes garbled text while preserving meaningful content
 */

interface CleaningOptions {
  preserveHebrew?: boolean;
  preserveEnglish?: boolean;
  preserveNumbers?: boolean;
  preservePunctuation?: boolean;
  minimumLineLength?: number;
}

const DEFAULT_OPTIONS: CleaningOptions = {
  preserveHebrew: true,
  preserveEnglish: true,
  preserveNumbers: true,
  preservePunctuation: true,
  minimumLineLength: 3
};

/**
 * Main text cleaning function
 */
export const cleanFileText = (text: string, options: CleaningOptions = {}): string => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    let cleaned = text;

    // Step 1: Remove binary signatures and metadata (safe patterns)
    cleaned = removeBinarySignatures(cleaned);
    
    // Step 2: Clean character-by-character (safe approach)
    cleaned = cleanCharacters(cleaned, opts);
    
    // Step 3: Normalize formatting
    cleaned = normalizeFormatting(cleaned);
    
    // Step 4: Filter meaningful content
    cleaned = filterMeaningfulContent(cleaned, opts);
    
    return cleaned.trim();
  } catch (error) {
    console.warn('Text cleaning failed, returning original text:', error);
    return text; // Return original text if cleaning fails
  }
};

/**
 * Remove binary signatures and metadata (Step 1)
 */
const removeBinarySignatures = (text: string): string => {
  return text
    // PDF signatures (safe patterns)
    .replace(/%PDF-[\d.]+/g, '')
    .replace(/%%EOF/g, '')
    .replace(/startxref/g, '')
    .replace(/xref\s+\d+\s+\d+/g, '')
    
    // DOCX signatures
    .replace(/PK\\x03\\x04/g, '')
    .replace(/word\/document\.xml/g, '')
    
    // Generic binary patterns
    .replace(/\\x00+/g, ' ') // null bytes to spaces
    .replace(/[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '') // control characters
    
    // PDF object patterns
    .replace(/\d+\s+\d+\s+obj\b/g, '')
    .replace(/endobj\b/g, '')
    .replace(/stream\b[\s\S]*?endstream\b/gi, ' ')
    
    // Font and formatting commands
    .replace(/\/[A-Z][a-zA-Z]*\s*[\d\s]*/g, '')
    .replace(/BT\b[\s\S]*?ET\b/g, ' ')
    
    // Remove replacement character
    .replace(/\uFFFD/g, '');
};

/**
 * Clean individual characters (Step 2)
 */
const cleanCharacters = (text: string, options: CleaningOptions): string => {
  return text
    .split('')
    .filter(char => {
      const code = char.charCodeAt(0);
      
      // Always allow basic whitespace
      if (code === 32 || code === 9 || code === 10 || code === 13) {
        return true;
      }
      
      // Hebrew characters
      if (options.preserveHebrew) {
        if ((code >= 1488 && code <= 1514) || // Basic Hebrew
            (code >= 1520 && code <= 1524) || // Extended Hebrew
            (code >= 1425 && code <= 1479) || // Hebrew diacritics
            (code >= 8204 && code <= 8207)) { // RTL marks
          return true;
        }
      }
      
      // English and Latin characters
      if (options.preserveEnglish) {
        if ((code >= 65 && code <= 90) ||   // A-Z
            (code >= 97 && code <= 122) ||  // a-z
            (code >= 160 && code <= 255)) { // Extended Latin
          return true;
        }
      }
      
      // Numbers
      if (options.preserveNumbers && code >= 48 && code <= 57) {
        return true;
      }
      
      // Common punctuation
      if (options.preservePunctuation) {
        const punctuationCodes = [
          33, 34, 39, 40, 41, 44, 45, 46, 47, 58, 59, 63, // !"'(),-./;?
          91, 93, 123, 125, // []{}
          8211, 8212, 8216, 8217, 8220, 8221, 8226 // dashes, quotes, bullet
        ];
        if (punctuationCodes.includes(code)) {
          return true;
        }
      }
      
      return false;
    })
    .join('');
};

/**
 * Normalize formatting (Step 3)
 */
const normalizeFormatting = (text: string): string => {
  return text
    // Fix multiple spaces
    .replace(/[ \t]{2,}/g, ' ')
    
    // Fix multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    
    // Clean up line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Remove trailing spaces from lines
    .replace(/[ \t]+$/gm, '')
    
    // Remove leading spaces from lines (but preserve indentation structure)
    .replace(/^[ \t]+/gm, (match) => match.length > 4 ? '    ' : '')
    
    // Add proper spacing after punctuation
    .replace(/([.!?])([a-zA-Z\u0590-\u05FF])/g, '$1 $2');
};

/**
 * Filter meaningful content (Step 4)
 */
const filterMeaningfulContent = (text: string, options: CleaningOptions): string => {
  const lines = text.split('\n');
  
  const meaningfulLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (trimmed.length === 0) {
      return true; // Keep empty lines for structure
    }
    
    // Skip lines that are too short
    if (trimmed.length < (options.minimumLineLength || 3)) {
      return false;
    }
    
    // Skip lines with only punctuation/numbers
    if (/^[\d\s.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]+$/.test(trimmed)) {
      return false;
    }
    
    // Skip lines that look like garbage (too many special characters)
    const specialCharCount = (trimmed.match(/[^a-zA-Z\u0590-\u05FF\d\s]/g) || []).length;
    const totalChars = trimmed.length;
    if (specialCharCount / totalChars > 0.5) {
      return false;
    }
    
    return true;
  });
  
  return meaningfulLines.join('\n');
};

/**
 * Quick cleaning function for simple use cases
 */
export const quickClean = (text: string): string => {
  return cleanFileText(text, {
    preserveHebrew: true,
    preserveEnglish: true,
    preserveNumbers: true,
    preservePunctuation: true,
    minimumLineLength: 2
  });
};

/**
 * Aggressive cleaning for heavily corrupted files
 */
export const aggressiveClean = (text: string): string => {
  return cleanFileText(text, {
    preserveHebrew: true,
    preserveEnglish: true,
    preserveNumbers: false,
    preservePunctuation: false,
    minimumLineLength: 5
  });
};

/**
 * Check if text contains significant garbled content
 */
export const isTextGarbled = (text: string): boolean => {
  if (!text || text.length < 10) return false;
  
  const chars = text.split('');
  const garbageCount = chars.filter(char => {
    const code = char.charCodeAt(0);
    return code < 32 || (code > 126 && code < 160) || code === 65533; // replacement char
  }).length;
  
  return (garbageCount / chars.length) > 0.3; // More than 30% garbage
}; 