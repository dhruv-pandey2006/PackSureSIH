import { Router } from 'express';
import multer from 'multer';
import { extractProductData } from '../services/geminiService.js';
import { checkCompliance } from '../services/compliance/complianceService.js';

export const ocrRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

type OcrOutcome = { filename: string; text: string } | { error: string };

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

  return { filename: ocrResult.filename, text: ocrResult.text };
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

  return { filename: originalname, text: parsedResult.ParsedText ?? '' };
}

ocrRouter.post('/', upload.single('file'), async (req, res) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const requestStart = Date.now();

  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required.' });
      return;
    }

    const provider = process.env.OCR_PROVIDER === 'ocrspace' ? 'ocrspace' : 'paddle';

    const ocrResult =
      provider === 'ocrspace'
        ? await callOcrSpace(req.file.buffer, req.file.mimetype, req.file.originalname, requestId)
        : await callPaddleOcr(req.file.buffer, req.file.mimetype, req.file.originalname, requestId);

    if ('error' in ocrResult) {
      res.status(502).json({
        error: ocrResult.error,
      });
      return;
    }

    const productData = await extractProductData(ocrResult.text);

    const compliance = checkCompliance(productData);

    console.log(`[OCR ${requestId}] Total /api/ocr time: ${Date.now() - requestStart} ms`);

    res.json({
      filename: ocrResult.filename,
      ocrText: ocrResult.text,
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