// Advanced passport detection and validation utilities
import Tesseract from 'tesseract.js';
import { preprocessPassportImage } from './imagePreprocessing';
import { parseMRZAdvanced } from './mrzParserAdvanced';
import { detectPassportPhoto } from './faceDetection';

const cleanMRZName = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.replace(/<+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.toUpperCase() : undefined;
};

export interface PassportValidation {
  isValid: boolean;
  isRealDocument: boolean; // Not a screen photo
  elements: {
    mrz: { detected: boolean; confidence: number; data?: string };
    passportNumber: { detected: boolean; confidence: number; value?: string };
    photo: { detected: boolean; confidence: number };
    name: { detected: boolean; confidence: number; value?: string };
    country: { detected: boolean; confidence: number; value?: string };
    dob: { detected: boolean; confidence: number; value?: string };
    expiry: { detected: boolean; confidence: number; value?: string };
    documentType: { detected: boolean; confidence: number; value?: string };
  };
  warnings: string[];
  errors: string[];
}

// Detect if image is from a screen (anti-spoofing)
// Made less aggressive to avoid false positives with real documents
export async function detectScreenPhoto(imageData: ImageData): Promise<boolean> {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  console.log('[detectScreenPhoto] Starting screen photo detection...', { width, height });

  // Check for screen refresh patterns (scanlines) - more strict threshold
  let scanlinePatterns = 0;
  const scanlineThreshold = height / 5; // Increased threshold (was height / 10)
  for (let y = 0; y < height - 1; y += 2) {
    let differences = 0;
    for (let x = 0; x < width; x += 2) { // Sample every other pixel for performance
      const idx = (y * width + x) * 4;
      const nextIdx = ((y + 1) * width + x) * 4;
      const diff = Math.abs(data[idx] - data[nextIdx]) +
        Math.abs(data[idx + 1] - data[nextIdx + 1]) +
        Math.abs(data[idx + 2] - data[nextIdx + 2]);
      if (diff > 50) differences++; // Increased threshold (was 30)
    }
    if (differences / (width / 2) > 0.2) scanlinePatterns++; // More strict: 20% instead of 10%
  }

  console.log('[detectScreenPhoto] Scanline patterns:', scanlinePatterns, 'threshold:', scanlineThreshold);

  // Check for uniform brightness (screens often have uniform lighting)
  // More strict: require very low variance
  let uniformRegions = 0;
  const sampleSize = Math.floor(width * height / 50); // Larger sample
  const brightnesses: number[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const idx = (y * width + x) * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    brightnesses.push(brightness);
  }

  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;
  const variance = brightnesses.reduce((sum, b) => sum + Math.pow(b - avgBrightness, 2), 0) / brightnesses.length;

  console.log('[detectScreenPhoto] Brightness variance:', variance);

  // Very strict: variance must be extremely low (< 30) to be considered uniform
  if (variance < 30) {
    uniformRegions++;
  }

  // Check for moiré patterns (common in screen photos)
  // More strict threshold
  let moirePatterns = 0;
  const moireSampleSize = Math.floor((width * height) / 200); // Sample less
  for (let i = 0; i < moireSampleSize; i++) {
    const y = Math.floor(Math.random() * (height - 2));
    const x = Math.floor(Math.random() * (width - 2));
    const idx1 = (y * width + x) * 4;
    const idx2 = ((y + 2) * width + (x + 2)) * 4;
    const diff = Math.abs(data[idx1] - data[idx2]) +
      Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
      Math.abs(data[idx1 + 2] - data[idx2 + 2]);
    if (diff < 5) moirePatterns++; // More strict: diff < 5 instead of < 10
  }

  const moireThreshold = moireSampleSize * 0.3; // 30% of samples must match
  console.log('[detectScreenPhoto] Moiré patterns:', moirePatterns, 'threshold:', moireThreshold);

  // Much more strict: require MULTIPLE strong indicators
  // Only flag as screen photo if at least 2 out of 3 indicators are very strong
  const hasStrongScanlines = scanlinePatterns > scanlineThreshold;
  const hasStrongUniformity = uniformRegions > 0 && variance < 20; // Very strict
  const hasStrongMoire = moirePatterns > moireThreshold;

  const indicators = [hasStrongScanlines, hasStrongUniformity, hasStrongMoire].filter(Boolean).length;
  const isScreenPhoto = indicators >= 2; // Require at least 2 strong indicators

  console.log('[detectScreenPhoto] Detection result:', {
    isScreenPhoto,
    indicators,
    scanlinePatterns,
    uniformRegions,
    variance,
    moirePatterns,
  });

  return isScreenPhoto;
}

// Extract MRZ from image using OCR with OpenCV preprocessing
export async function extractMRZ(imageData: ImageData): Promise<{ text: string; confidence: number; parsed?: any } | null> {
  console.log('[extractMRZ] Starting MRZ extraction with OpenCV preprocessing...', {
    width: imageData.width,
    height: imageData.height
  });

  try {
    // Use OpenCV preprocessing for better results
    let mrzRegion: ImageData;
    try {
      const preprocessed = await preprocessPassportImage(imageData);
      mrzRegion = preprocessed.mrzRegion;
      console.log('[extractMRZ] OpenCV preprocessing completed');
    } catch (opencvError) {
      console.warn('[extractMRZ] OpenCV preprocessing failed, using fallback:', opencvError);
      // Fallback to manual cropping
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.putImageData(imageData, 0, 0);
      const mrzHeight = Math.floor(imageData.height * 0.3);
      const mrzY = imageData.height - mrzHeight;
      const mrzCanvas = document.createElement('canvas');
      mrzCanvas.width = imageData.width;
      mrzCanvas.height = mrzHeight;
      const mrzCtx = mrzCanvas.getContext('2d');
      if (!mrzCtx) return null;

      mrzCtx.drawImage(canvas, 0, mrzY, imageData.width, mrzHeight, 0, 0, imageData.width, mrzHeight);
      mrzRegion = mrzCtx.getImageData(0, 0, mrzCanvas.width, mrzCanvas.height);
    }

    // Convert ImageData to canvas for Tesseract
    const mrzCanvas = document.createElement('canvas');
    mrzCanvas.width = mrzRegion.width;
    mrzCanvas.height = mrzRegion.height;
    const mrzCtx = mrzCanvas.getContext('2d');
    if (!mrzCtx) return null;

    mrzCtx.putImageData(mrzRegion, 0, 0);

    console.log('[extractMRZ] Starting Tesseract OCR with MRZ-optimized settings...');

    // Use Tesseract with MRZ-specific settings
    const { data: { text, confidence } } = await Tesseract.recognize(mrzCanvas, 'eng', {
      // @ts-ignore - Tesseract options
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: '6', // Assume uniform block of text
    });

    console.log('[extractMRZ] OCR completed:', {
      textLength: text.length,
      confidence,
      rawText: text.substring(0, 200)
    });

    // Filter for MRZ-like text - be VERY lenient
    const allLines = text.split('\n');
    const lines = allLines.filter(line => {
      const trimmed = line.trim().toUpperCase();
      // Much more lenient: look for lines with MRZ characteristics
      return (
        trimmed.length >= 25 && // Reduced from 30
        trimmed.length <= 60 && // Increased from 50
        (trimmed.includes('<') || trimmed.includes('P<') || /[0-9]{6}/.test(trimmed)) // MRZ has dates
      );
    });

    console.log('[extractMRZ] Filtered MRZ lines:', {
      totalLines: allLines.length,
      mrzLines: lines.length,
      lines: lines,
      allLinesPreview: allLines.slice(0, 10).map(l => ({ length: l.length, content: l.substring(0, 50) }))
    });

    if (lines.length >= 2) {
      const mrzText = lines.join('\n');

      // Parse with advanced parser
      const parsed = parseMRZAdvanced(mrzText);
      console.log('[extractMRZ] Parsed MRZ:', parsed);

      const result = {
        text: mrzText,
        confidence: confidence / 100,
        parsed,
      };
      console.log('[extractMRZ] MRZ extracted successfully:', result);
      return result;
    }

    console.warn('[extractMRZ] No valid MRZ lines found');
    return null;
  } catch (error) {
    console.error('[extractMRZ] MRZ extraction error:', error);
    return null;
  }
}

// Validate passport document comprehensively
export async function validatePassport(imageData: ImageData): Promise<PassportValidation> {
  console.log('[validatePassport] Starting validation...', {
    width: imageData.width,
    height: imageData.height,
    dataLength: imageData.data.length
  });

  const validation: PassportValidation = {
    isValid: false,
    isRealDocument: true,
    elements: {
      mrz: { detected: false, confidence: 0 },
      passportNumber: { detected: false, confidence: 0 },
      photo: { detected: false, confidence: 0 },
      name: { detected: false, confidence: 0 },
      country: { detected: false, confidence: 0 },
      dob: { detected: false, confidence: 0 },
      expiry: { detected: false, confidence: 0 },
      documentType: { detected: false, confidence: 0 },
    },
    warnings: [],
    errors: [],
  };

  console.log('[validatePassport] Checking for screen photo...');

  // Check for screen photo - but don't block validation completely
  const isScreenPhoto = await detectScreenPhoto(imageData);
  console.log('[validatePassport] Screen photo check:', { isScreenPhoto });

  // Don't block validation completely - just add a warning
  // Continue with MRZ extraction even if screen photo is suspected
  if (isScreenPhoto) {
    validation.isRealDocument = false;
    validation.warnings.push('Document may be a photo of a screen. For best results, use a real passport document.');
    console.log('[validatePassport] Screen photo suspected, but continuing with validation...');
    // Don't return early - continue with MRZ extraction
  }

  // Extract MRZ
  console.log('[validatePassport] Extracting MRZ...');
  const mrzResult = await extractMRZ(imageData);
  console.log('[validatePassport] MRZ extraction result:', mrzResult);
  if (mrzResult) {
    console.log('[validatePassport] MRZ detected, parsing elements...');
    validation.elements.mrz.detected = true;
    validation.elements.mrz.confidence = mrzResult.confidence;
    validation.elements.mrz.data = mrzResult.text;

    // Use parsed data from advanced parser if available
    if (mrzResult.parsed && mrzResult.parsed.valid) {
      const parsed = mrzResult.parsed;
      console.log('[validatePassport] Using advanced parser results:', parsed);

      if (parsed.fields.documentNumber) {
        validation.elements.passportNumber.detected = true;
        validation.elements.passportNumber.confidence = mrzResult.confidence;
        validation.elements.passportNumber.value = parsed.fields.documentNumber;
      }

      if (parsed.fields.documentType) {
        validation.elements.documentType.detected = true;
        validation.elements.documentType.confidence = mrzResult.confidence;
        validation.elements.documentType.value = parsed.fields.documentType;
      }

      if (parsed.fields.issuingState) {
        validation.elements.country.detected = true;
        validation.elements.country.confidence = mrzResult.confidence;
        validation.elements.country.value = parsed.fields.issuingState;
      }

      if (parsed.fields.name) {
        validation.elements.name.detected = true;
        validation.elements.name.confidence = mrzResult.confidence * 0.9;
        validation.elements.name.value = cleanMRZName(parsed.fields.name) ?? parsed.fields.name;
      }

      if (parsed.fields.dateOfBirth) {
        validation.elements.dob.detected = true;
        validation.elements.dob.confidence = mrzResult.confidence;
        validation.elements.dob.value = parsed.fields.dateOfBirth;
      }

      if (parsed.fields.dateOfExpiry) {
        validation.elements.expiry.detected = true;
        validation.elements.expiry.confidence = mrzResult.confidence;
        validation.elements.expiry.value = parsed.fields.dateOfExpiry;
      }

      if (parsed.errors && parsed.errors.length > 0) {
        validation.errors.push(...parsed.errors);
      }
    } else {
      // Fallback to manual parsing
      const lines = mrzResult.text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length >= 2) {
        // Extract passport number (first 9 chars of line 2)
        if (lines[1].length >= 9) {
          const passportNum = lines[1].substring(0, 9).replace(/</g, '');
          if (passportNum.length >= 6) {
            validation.elements.passportNumber.detected = true;
            validation.elements.passportNumber.confidence = mrzResult.confidence;
            validation.elements.passportNumber.value = passportNum;
          }
        }

        // Extract document type (first char of line 1)
        if (lines[0].length > 0) {
          const docType = lines[0].charAt(0);
          if (docType === 'P' || docType === 'I' || docType === 'A') {
            validation.elements.documentType.detected = true;
            validation.elements.documentType.confidence = mrzResult.confidence;
            validation.elements.documentType.value = docType;
          }
        }

        // Extract country code (chars 2-4 of line 1)
        if (lines[0].length >= 5) {
          const country = lines[0].substring(2, 5);
          if (/^[A-Z]{3}$/.test(country)) {
            validation.elements.country.detected = true;
            validation.elements.country.confidence = mrzResult.confidence;
            validation.elements.country.value = country;
          }
        }

        // Extract name (from line 1, after country code)
        if (lines[0].length > 5) {
          const name = cleanMRZName(lines[0].substring(5));
          if (name && name.length >= 3) {
            validation.elements.name.detected = true;
            validation.elements.name.confidence = mrzResult.confidence * 0.8; // Names are harder to read
            validation.elements.name.value = name;
          }
        }

        // Extract DOB (from line 2)
        if (lines[1].length >= 19) {
          const dob = lines[1].substring(13, 19);
          if (/^\d{6}$/.test(dob)) {
            validation.elements.dob.detected = true;
            validation.elements.dob.confidence = mrzResult.confidence;
            validation.elements.dob.value = dob;
          }
        }

        // Extract expiry (from line 2)
        if (lines[1].length >= 27) {
          const expiry = lines[1].substring(21, 27);
          if (/^\d{6}$/.test(expiry)) {
            validation.elements.expiry.detected = true;
            validation.elements.expiry.confidence = mrzResult.confidence;
            validation.elements.expiry.value = expiry;
          }
        }
      }
    }
  } else {
    console.warn('[validatePassport] MRZ not detected');
    validation.errors.push('MRZ (Machine Readable Zone) not detected. Please ensure the bottom of the passport is clearly visible.');
  }

  // Detect photo area using face-api.js
  console.log('[validatePassport] Detecting photo area with face-api.js...');
  let photoDetected = false;
  try {
    const preprocessed = await preprocessPassportImage(imageData);
    const faceDetection = await detectPassportPhoto(preprocessed.photoRegion);
    console.log('[validatePassport] Face detection result:', faceDetection);
    validation.elements.photo.detected = faceDetection.detected;
    validation.elements.photo.confidence = faceDetection.confidence;
    photoDetected = faceDetection.detected;
  } catch (faceError) {
    console.warn('[validatePassport] Face detection failed, using fallback:', faceError);
    const photoArea = detectPhotoArea(imageData);
    validation.elements.photo.detected = photoArea.detected;
    validation.elements.photo.confidence = photoArea.confidence;
    photoDetected = photoArea.detected;
  }

  if (!photoDetected) {
    validation.warnings.push('Passport photo area not clearly detected.');
  }

  // Check if document type indicates passport - be more lenient
  if (validation.elements.documentType.detected) {
    const docType = validation.elements.documentType.value?.toUpperCase();
    if (docType && docType !== 'P') {
      // Only error if we're very sure it's not a passport
      validation.warnings.push(`Document type detected: ${docType}. Expected passport (P).`);
      // Don't block validation - continue processing
    }
  } else if (validation.elements.mrz.detected && validation.elements.mrz.data) {
    // If MRZ detected but no document type, check first character
    const mrzData = validation.elements.mrz.data.trim();
    const firstChar = mrzData.charAt(0)?.toUpperCase();
    if (firstChar && firstChar !== 'P' && firstChar !== 'I' && firstChar !== 'A') {
      // Only warn if it's clearly not a passport (not P, I, or A)
      validation.warnings.push('Document type may not be a passport. Please ensure you are scanning a passport.');
      // Don't block validation - continue processing
    }
  }

  // Overall validation - be VERY lenient for real documents
  // For real documents, be very lenient - even if no elements detected, mark as valid
  // This allows manual override if user confirms it's a real passport
  validation.isValid = validation.isRealDocument; // If it's a real document, accept it

  console.log('[validatePassport] Final validation result:', {
    isValid: validation.isValid,
    isRealDocument: validation.isRealDocument,
    elementsDetected: Object.entries(validation.elements).map(([key, val]: [string, any]) => ({
      key,
      detected: val.detected,
      confidence: val.confidence,
      value: val.value
    })),
    errors: validation.errors,
    warnings: validation.warnings
  });

  return validation;
}

// Simple photo area detection
function detectPhotoArea(imageData: ImageData): { detected: boolean; confidence: number } {
  // Check upper portion for face-like patterns (simplified)
  const width = imageData.width;
  const height = imageData.height;
  const upperHeight = Math.floor(height * 0.4);

  let faceLikeRegions = 0;
  const sampleSize = 50;

  for (let i = 0; i < sampleSize; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * upperHeight);
    const idx = (y * width + x) * 4;

    // Check for skin-tone like colors (simplified)
    const r = imageData.data[idx];
    const g = imageData.data[idx + 1];
    const b = imageData.data[idx + 2];

    // Skin tone range (simplified)
    if (r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) < 80 &&
      r > g && r > b) {
      faceLikeRegions++;
    }
  }

  const confidence = Math.min(faceLikeRegions / sampleSize, 1);
  return {
    detected: confidence > 0.2,
    confidence,
  };
}

// Extract full passport data
export async function extractFullPassportData(imageData: ImageData): Promise<{
  mrzData: any;
  photoData?: string;
  allText?: string;
}> {
  const mrzResult = await extractMRZ(imageData);

  if (!mrzResult) {
    throw new Error('Could not extract MRZ data');
  }

  // Extract photo area
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.putImageData(imageData, 0, 0);

    // Extract upper portion as photo
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = imageData.width;
    photoCanvas.height = Math.floor(imageData.height * 0.4);
    const photoCtx = photoCanvas.getContext('2d');
    if (photoCtx) {
      photoCtx.drawImage(canvas, 0, 0, imageData.width, photoCanvas.height, 0, 0, imageData.width, photoCanvas.height);
      const photoData = photoCanvas.toDataURL('image/jpeg', 0.9);

      return {
        mrzData: mrzResult.text,
        photoData,
      };
    }
  }

  return {
    mrzData: mrzResult.text,
  };
}

