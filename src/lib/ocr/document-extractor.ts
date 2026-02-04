import Tesseract from 'tesseract.js';
import { parse as parseMRZ } from 'mrz';

export interface ExtractedData {
  givenNames?: string;
  surname?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  documentType?: string;
  documentNumber?: string;
  expiryDate?: string;
  issueDate?: string;
  placeOfBirth?: string;
  mrzLine1?: string;
  mrzLine2?: string;
  mrzLine3?: string;
  mrzValid?: boolean;
  confidence?: number;
  rawText?: string;
}

export async function extractDocumentData(imageData: string): Promise<ExtractedData> {
  console.log("🔍 Starting OCR extraction...");
  
  try {
    const { data } = await Tesseract.recognize(imageData, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    console.log("✅ OCR Complete - Confidence:", data.confidence);

    const extracted: ExtractedData = {
      rawText: data.text,
      confidence: data.confidence,
    };

    // Try MRZ first
    const mrzLines = extractMRZLines(data.text);
    console.log("MRZ lines found:", mrzLines.length);
    
    if (mrzLines.length >= 2) {
      try {
        const mrzData = parseMRZ(mrzLines);
        console.log("✅ MRZ Parsed");
        
        extracted.mrzLine1 = mrzLines[0];
        extracted.mrzLine2 = mrzLines[1];
        if (mrzLines[2]) extracted.mrzLine3 = mrzLines[2];
        extracted.mrzValid = mrzData.valid;
        
        if (mrzData.fields) {
          const f = mrzData.fields as any;
          extracted.documentType = f.documentCode || f.type || undefined;
          extracted.documentNumber = f.documentNumber || f.passportNumber || undefined;
          extracted.surname = f.lastName || f.surname || undefined;
          extracted.givenNames = f.firstName || f.givenNames || undefined;
          extracted.nationality = f.nationality || f.issuingState || undefined;
          extracted.dateOfBirth = formatDate(f.birthDate || f.dateOfBirth);
          extracted.gender = f.sex || f.gender || undefined;
          extracted.expiryDate = formatDate(f.expiryDate || f.dateOfExpiry);
        }
      } catch (e) {
        console.warn("⚠️ MRZ parse failed:", e);
      }
    }

    // Always run text extraction
    extractFromText(data.text, extracted);
    
    console.log("Final extracted:", extracted);
    return extracted;
  } catch (error) {
    console.error("❌ OCR Error:", error);
    throw new Error("Failed to extract document data");
  }
}

function extractMRZLines(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const mrzLines: string[] = [];
  
  console.log(`Checking ${lines.length} lines for MRZ...`);
  
  for (const line of lines) {
    const cleaned = line
      .replace(/\s/g, '')
      .replace(/[O]/g, '0')
      .replace(/[Il|]/g, '1')
      .toUpperCase();
    
    const validLengths = [30, 36, 44];
    if (validLengths.includes(cleaned.length) && 
        cleaned.includes('<') && 
        /^[A-Z0-9<]+$/.test(cleaned)) {
      console.log(`  ✓ MRZ: ${cleaned.substring(0, 20)}... (${cleaned.length})`);
      mrzLines.push(cleaned);
    }
  }
  
  return mrzLines.slice(-3);
}

function extractFromText(text: string, extracted: ExtractedData) {
  // Document number
  if (!extracted.documentNumber) {
    const patterns = [
      /(?:PASSPORT|ID|LICENSE|DL)\s*(?:NO|NUMBER|#)?\s*:?\s*([A-Z0-9]{6,15})/i,
      /\b([A-Z]{2,4}\d{6,10})\b/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]) {
        extracted.documentNumber = m[1].replace(/\s/g, '');
        break;
      }
    }
  }
  
  // Names
  if (!extracted.surname) {
    const m = text.match(/(?:SURNAME|LAST\s*NAME)\s*:?\s*([A-Z][A-Z\s'-]{1,30})/i);
    if (m?.[1]) extracted.surname = m[1].trim();
  }
  
  if (!extracted.givenNames) {
    const m = text.match(/(?:GIVEN\s*NAMES?|FIRST\s*NAME)\s*:?\s*([A-Z][A-Z\s'-]{1,40})/i);
    if (m?.[1]) extracted.givenNames = m[1].trim();
  }
  
  if (extracted.surname && extracted.givenNames) {
    extracted.fullName = `${extracted.givenNames} ${extracted.surname}`;
  }
  
  // Dates
  if (!extracted.dateOfBirth) {
    const m = text.match(/(?:DATE\s*OF\s*BIRTH|DOB)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (m?.[1]) extracted.dateOfBirth = m[1];
  }
  
  if (!extracted.expiryDate) {
    const m = text.match(/(?:EXPIRY|EXP)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (m?.[1]) extracted.expiryDate = m[1];
  }
  
  // Gender
  if (!extracted.gender) {
    const m = text.match(/(?:SEX|GENDER)\s*:?\s*(M|F)/i);
    if (m?.[1]) extracted.gender = m[1].toUpperCase();
  }
  
  // Nationality
  if (!extracted.nationality) {
    const m = text.match(/(?:NATIONALITY)\s*:?\s*([A-Z]{3,20})/i);
    if (m?.[1]) extracted.nationality = m[1].trim();
  }
}

function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  
  if (/^\d{6}$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 2));
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    return `${day}/${month}/${fullYear}`;
  }
  
  return dateStr;
}
