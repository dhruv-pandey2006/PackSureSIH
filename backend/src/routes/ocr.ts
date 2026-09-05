import { Router } from 'express';
import multer from 'multer';
import { extractProductData } from '../services/geminiService.js';
import { checkCompliance } from '../services/compliance/complianceService.js';

export const ocrRouter = Router();

const MAX_IMAGES = 4;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadImages = upload.array('file', MAX_IMAGES);

export type OcrBox = {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  lineIndex: number;
  wordIndex: number;
};

export type OcrBoxes = {
  version: 1;
  coordinateSpace: 'image-pixels';
  words: OcrBox[];
};

type OcrOutcome = { filename: string; text: string; ocrBoxes: OcrBoxes | null } | { error: string };

function normalizeOcrBoxes(parsedResult: any): OcrBoxes | null {
  const lines = parsedResult?.TextOverlay?.Lines;

  if (!Array.isArray(lines)) {
    return null;
  }

  const words: OcrBox[] = [];

  lines.forEach((line: any, lineIndex: number) => {
    if (!Array.isArray(line?.Words)) return;

    line.Words.forEach((word: any, wordIndex: number) => {
      const text = typeof word?.WordText === 'string' ? word.WordText.trim() : '';
      const coordinates = [word?.Left, word?.Top, word?.Width, word?.Height];

      if (!text || coordinates.some((value) => !Number.isFinite(value) || value < 0)) {
        return;
      }

      words.push({
        text,
        left: word.Left,
        top: word.Top,
        width: word.Width,
        height: word.Height,
        lineIndex,
        wordIndex,
      });
    });
  });

  return words.length > 0
    ? { version: 1, coordinateSpace: 'image-pixels', words }
    : null;
}

async function callPaddleOcr(
  fileBuffer: Buffer,
  mimetype: string,
  originalname: string,
  requestId: string,
): Promise<OcrOutcome> {
  const ocrServiceUrl =
    process.env.OCR_SERVICE_URL ?? 'http://127.0.0.1:8000';

  const formData = new FormData();

  const blob = new Blob([new Uint8Array(fileBuffer)], {
    type: mimetype,
  });

  formData.append('file', blob, originalname);

  const ocrStart = Date.now();

  const response = await fetch(`${ocrServiceUrl}/ocr`, {
    method: 'POST',
    body: formData,
  });

  console.log(`[OCR ${requestId}] OCR service request took ${Date.now() - ocrStart} ms`);

  if (!response.ok) {
    const errorText = await response.text();

    console.error(`[OCR ${requestId}] OCR service error:`, errorText);

    return { error: 'OCR service failed.' };
  }

  const ocrResult = await response.json();

  return { filename: ocrResult.filename, text: ocrResult.text, ocrBoxes: null };
}

async function callOcrSpace(
  fileBuffer: Buffer,
  mimetype: string,
  originalname: string,
  requestId: string,
): Promise<OcrOutcome> {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    console.error(`[OCR ${requestId}] OCR_SPACE_API_KEY is not configured.`);
    return { error: 'OCR.space is not configured.' };
  }

  const formData = new FormData();

  const blob = new Blob([new Uint8Array(fileBuffer)], {
    type: mimetype,
  });

  formData.append('file', blob, originalname);
  formData.append('language', 'eng');
  formData.append('OCREngine', '3');
  formData.append('isOverlayRequired', 'true');

  const ocrStart = Date.now();

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: apiKey },
    body: formData,
  });

  console.log(`[OCR ${requestId}] OCR.space request took ${Date.now() - ocrStart} ms`);

  if (!response.ok) {
    console.error(`[OCR ${requestId}] OCR.space HTTP error: ${response.status}`);
    return { error: 'OCR.space request failed.' };
  }

  const data = await response.json();
  const parsedResult = data?.ParsedResults?.[0];

  if (data?.IsErroredOnProcessing || !parsedResult || parsedResult.FileParseExitCode !== 1) {
    console.error(
      `[OCR ${requestId}] OCR.space processing error:`,
      data?.ErrorMessage ?? parsedResult?.ErrorMessage ?? 'Unknown error',
    );
    return { error: 'OCR.space failed to process the image.' };
  }

  if (process.env.OCR_DIAGNOSTIC === '1') {
    const rawText = parsedResult.ParsedText ?? '';
    const mrpIndicatorPattern = /mrp|maximum\s+retail\s+price|₹|rs\.?|inr|\$|\d+[.,]?\d*/i;
    const mrpRelatedLines = rawText.split(/\r?\n/).filter((line: string) => mrpIndicatorPattern.test(line));

    console.log(`[OCR DIAGNOSTIC] [OCR ${requestId}] MRP-related lines from OCR.space:`, mrpRelatedLines);
  }

  return {
    filename: originalname,
    text: parsedResult.ParsedText ?? '',
    ocrBoxes: normalizeOcrBoxes(parsedResult),
  };
}

ocrRouter.post('/', (req, res) => {
  uploadImages(req, res, async (uploadError) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const requestStart = Date.now();

    if (uploadError) {
      const message =
        uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE'
          ? 'One or more images exceed the 10 MB size limit.'
          : uploadError instanceof multer.MulterError &&
              (uploadError.code === 'LIMIT_FILE_COUNT' || uploadError.code === 'LIMIT_UNEXPECTED_FILE')
            ? `Too many images. You can upload up to ${MAX_IMAGES} images per scan.`
            : 'Failed to process the uploaded images.';

      res.status(400).json({ error: message });
      return;
    }

    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'At least one image file is required.' });
        return;
      }

      const provider = process.env.OCR_PROVIDER === 'ocrspace' ? 'ocrspace' : 'paddle';

      const ocrResults: OcrOutcome[] = [];

      for (const file of files) {
        const result =
          provider === 'ocrspace'
            ? await callOcrSpace(file.buffer, file.mimetype, file.originalname, requestId)
            : await callPaddleOcr(file.buffer, file.mimetype, file.originalname, requestId);

        ocrResults.push(result);
      }

      const failedResult = ocrResults.find((result): result is { error: string } => 'error' in result);

      if (failedResult) {
        res.status(502).json({
          error: failedResult.error,
        });
        return;
      }

      const successfulResults = ocrResults as Array<{
        filename: string;
        text: string;
        ocrBoxes: OcrBoxes | null;
      }>;

      // Preserve the exact single-image OCR text (no added labels/separators)
      // so existing single-image scans behave identically to before.
      const combinedText =
        successfulResults.length > 1
          ? successfulResults
              .map((result, index) => `--- Image ${index + 1}: ${result.filename} ---\n${result.text}`)
              .join('\n\n')
          : successfulResults[0].text;

      const productData = await extractProductData(combinedText);

      const compliance = checkCompliance(productData);

      console.log(`[OCR ${requestId}] Total /api/ocr time: ${Date.now() - requestStart} ms`);

      res.json({
        filename: successfulResults[0].filename,
        ocrText: combinedText,
        ocrEvidence: successfulResults.map((result, index) => ({
          imageIndex: index + 1,
          filename: result.filename,
          text: result.text,
          ocrBoxes: result.ocrBoxes,
        })),
        productData,
        compliance,
      });
    } catch (error) {
      console.error(`[OCR ${requestId}] OCR request failed:`, error);

      res.status(500).json({
        error: 'Failed to process OCR request.',
      });
    }
  });
});