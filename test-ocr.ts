import Tesseract from 'tesseract.js';
import { parse as parseMRZ } from 'mrz';
import * as fs from 'fs';
import * as path from 'path';

async function testOCR(imagePath: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${path.basename(imagePath)}`);
  console.log('='.repeat(80));

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  try {
    // Run basic OCR first
    console.log('\n📄 Running OCR...');
    const { data } = await Tesseract.recognize(base64Image, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    console.log(`\n✅ OCR Complete - Confidence: ${data.confidence.toFixed(2)}%`);
    console.log('\n--- RAW TEXT ---');
    console.log(data.text);
    console.log('--- END RAW TEXT ---\n');

    // Try to find MRZ
    console.log('🔍 Looking for MRZ lines...');
    const lines = data.text.split('\n').map(l => l.trim());
    const mrzLines: string[] = [];
    
    for (const line of lines) {
      const cleaned = line.replace(/\s/g, '').replace(/[O]/g, '0').toUpperCase();
      
      if (cleaned.length >= 30 && cleaned.length <= 44 && 
          /^[A-Z0-9<]+$/.test(cleaned) && cleaned.includes('<')) {
        console.log(`  Found potential MRZ: ${cleaned} (length: ${cleaned.length})`);
        mrzLines.push(cleaned);
      }
    }

    if (mrzLines.length >= 2) {
      console.log('\n✅ MRZ lines found, attempting parse...');
      try {
        const mrzData = parseMRZ(mrzLines.slice(-3));
        console.log('MRZ Parse Result:', JSON.stringify(mrzData, null, 2));
      } catch (e) {
        console.log('❌ MRZ parse failed:', e);
      }
    } else {
      console.log('⚠️  No valid MRZ lines found');
    }

    // Try text extraction
    console.log('\n🔍 Attempting text-based extraction...');
    
    // Document number
    const docPatterns = [
      /(?:PASSPORT|PASSEPORT|ID|LICENSE|LICENCE|DL)\s*(?:NO|NUMBER|NUM|#)?\s*:?\s*([A-Z0-9]{6,15})/i,
      /\b([A-Z]{1,3}\d{6,10})\b/,
    ];
    
    for (const pattern of docPatterns) {
      const match = data.text.match(pattern);
      if (match) {
        console.log(`  Document Number: ${match[1]}`);
        break;
      }
    }

    // Names
    const surnameMatch = data.text.match(/(?:SURNAME|LAST\s*NAME|LN)\s*:?\s*([A-Z][A-Z\s'-]{1,30})/i);
    if (surnameMatch) console.log(`  Surname: ${surnameMatch[1]}`);

    const givenMatch = data.text.match(/(?:GIVEN\s*NAMES?|FIRST\s*NAME|FN)\s*:?\s*([A-Z][A-Z\s'-]{1,40})/i);
    if (givenMatch) console.log(`  Given Names: ${givenMatch[1]}`);

    // Dates
    const datePattern = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g;
    const dates = [...data.text.matchAll(datePattern)];
    if (dates.length > 0) {
      console.log(`  Found ${dates.length} dates:`);
      dates.forEach((d, i) => console.log(`    ${i + 1}. ${d[0]}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  const docsDir = '/Users/omegauwedia/development/mastersync/snaps/docs';
  
  await testOCR(path.join(docsDir, 'passport.jpeg'));
  await testOCR(path.join(docsDir, 'drivers_license_front.jpg'));
  await testOCR(path.join(docsDir, 'drivers_license_back.jpg'));
}

main().catch(console.error);
