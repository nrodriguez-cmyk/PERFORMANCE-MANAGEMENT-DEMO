import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for browser environment
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (err) {
    console.warn('[PDF Extractor] Error setting workerSrc:', err);
  }
}

export interface ExtractedPdfResult {
  text: string;
  numPages: number;
  fileName: string;
  fileSize: number;
  base64: string;
}

/**
 * Extracts raw text from an uploaded PDF file in the browser.
 * Uses pdfjs-dist with fallback text parsing.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to base64 for potential backend transmission
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binaryString);

  let fullText = '';
  let pageCount = 1;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
        .filter(Boolean)
        .join(' ');

      if (pageText.trim()) {
        fullText += (fullText ? '\n\n' : '') + `[PÁGINA ${pageNum}]\n` + pageText;
      }
    }
  } catch (pdfErr) {
    console.warn('[PDF Extractor] pdfjs-dist primary parser encountered an issue, running raw stream fallback:', pdfErr);
    // Fallback: extract ASCII/UTF-8 streams from the PDF binary
    fullText = extractTextFromPdfStreamFallback(binaryString);
  }

  // If extraction returned empty, try stream fallback
  if (!fullText.trim()) {
    fullText = extractTextFromPdfStreamFallback(binaryString);
  }

  return {
    text: fullText.trim(),
    numPages: pageCount,
    fileName: file.name,
    fileSize: file.size,
    base64
  };
}

/**
 * Fallback parser that decodes uncompressed text tokens from PDF streams
 */
function extractTextFromPdfStreamFallback(binary: string): string {
  const extractedLines: string[] = [];

  // Match text in parentheses: (Some text) Tj or [(Some) (text)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(binary)) !== null) {
    const clean = match[1].replace(/\\([()\\])/g, '$1').trim();
    if (clean.length > 2 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(clean)) {
      extractedLines.push(clean);
    }
  }

  // Also check TJ arrays
  const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayTjRegex.exec(binary)) !== null) {
    const inner = match[1];
    const subMatch = inner.match(/\(([^)]+)\)/g);
    if (subMatch) {
      const phrase = subMatch
        .map(s => s.slice(1, -1).replace(/\\([()\\])/g, '$1'))
        .join('')
        .trim();
      if (phrase.length > 2 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(phrase)) {
        extractedLines.push(phrase);
      }
    }
  }

  return extractedLines.join('\n');
}
