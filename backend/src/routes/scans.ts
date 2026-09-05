import { Router } from 'express';
import { getAuth, requireAuth } from '@clerk/express';
import multer from 'multer';
import { pool } from '../db.js';
import { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES, get, remove, save } from '../services/evidenceStorage.js';
import { calculateReadability } from '../services/readabilityService.js';

export const scansRouter = Router();

const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Evidence images must be JPG, PNG, or WEBP files.'));
      return;
    }

    callback(null, true);
  },
});

const uploadEvidenceImages = evidenceUpload.array('file', 4);

type OcrEvidenceMetadata = {
  imageIndex?: number;
  text?: string;
  ocrBoxes?: unknown;
  imageWidth?: number | null;
  imageHeight?: number | null;
};

function readOcrEvidenceMetadata(value: unknown): OcrEvidenceMetadata[] {
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

scansRouter.get('/', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const result = await pool.query(
    `SELECT id, product_name AS product, created_at AS date, score, status, report
     FROM scans
     WHERE clerk_user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  res.json({ scans: result.rows });
});

scansRouter.get('/dashboard', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const metricsResult = await pool.query(
    `SELECT
       COUNT(*)::integer AS "totalScans",
       COUNT(*) FILTER (WHERE status IN ('Compliant', 'Compliant with Minor Issues'))::integer AS compliant,
       COUNT(*) FILTER (WHERE status = 'Needs Review')::integer AS "needsReview",
       COUNT(*) FILTER (WHERE status = 'Non-Compliant')::integer AS violations
     FROM scans
     WHERE clerk_user_id = $1`,
    [userId],
  );

  const activityResult = await pool.query(
    `SELECT id, product_name AS product, created_at AS date, score, status
     FROM scans
     WHERE clerk_user_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [userId],
  );

  res.json({
    metrics: metricsResult.rows[0],
    recentActivity: activityResult.rows,
  });
});

scansRouter.get('/:id', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const scanId = Number(req.params.id);

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  if (!Number.isInteger(scanId) || scanId < 1) {
    res.status(400).json({ error: 'Scan id must be a positive integer.' });
    return;
  }

  const result = await pool.query(
    'SELECT report FROM scans WHERE id = $1 AND clerk_user_id = $2',
    [scanId, userId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Scan not found.' });
    return;
  }

  const evidence = await pool.query(
    `SELECT id, image_index AS "imageIndex", original_filename AS "originalFilename",
            mime_type AS "mimeType", byte_size AS "byteSize", ocr_text AS "ocrText",
          ocr_boxes AS "ocrBoxes", annotations -> 'readability' AS "readability"
     FROM scan_evidence
     WHERE scan_id = $1
     ORDER BY image_index ASC`,
    [scanId],
  );

  res.json({ scan: result.rows[0].report, evidence: evidence.rows });
});

scansRouter.post('/', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const report = req.body as Record<string, unknown>;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const productName = report.productName;
  const score = report.score;
  const status = report.status;

  if (typeof productName !== 'string' || !productName.trim() || typeof score !== 'number' || typeof status !== 'string') {
    res.status(400).json({ error: 'A report requires productName, numeric score, and status.' });
    return;
  }

  if (score < 0 || score > 100) {
    res.status(400).json({ error: 'Report score must be between 0 and 100.' });
    return;
  }

  await pool.query(
    `INSERT INTO users (clerk_user_id)
     VALUES ($1)
     ON CONFLICT (clerk_user_id) DO NOTHING`,
    [userId],
  );

  const result = await pool.query(
    `INSERT INTO scans (clerk_user_id, product_name, score, status, report)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, product_name AS product, created_at AS date, score, status, report`,
    [userId, productName.trim(), score, status, JSON.stringify({ ...report })],
  );

  res.status(201).json({ scan: result.rows[0] });
});

scansRouter.post('/:id/evidence', requireAuth(), (req, res) => {
  uploadEvidenceImages(req, res, async (uploadError) => {
    if (uploadError) {
      const message =
        uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE'
          ? 'One or more evidence images exceed the 10 MB size limit.'
          : uploadError instanceof multer.MulterError &&
              (uploadError.code === 'LIMIT_FILE_COUNT' || uploadError.code === 'LIMIT_UNEXPECTED_FILE')
            ? 'You can upload up to 4 evidence images per scan.'
            : 'Evidence images must be JPG, PNG, or WEBP files.';

      res.status(400).json({ error: message });
      return;
    }

    const { userId } = getAuth(req);
    const scanId = Number(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!Number.isInteger(scanId) || scanId < 1) {
      res.status(400).json({ error: 'Scan id must be a positive integer.' });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'At least one evidence image is required.' });
      return;
    }

    const savedStorageKeys: string[] = [];
    const insertedStorageKeys: string[] = [];
    const ocrEvidence = readOcrEvidenceMetadata(req.body?.ocrEvidence);

    try {
      const ownership = await pool.query(
        'SELECT id FROM scans WHERE id = $1 AND clerk_user_id = $2',
        [scanId, userId],
      );

      if (ownership.rowCount === 0) {
        res.status(404).json({ error: 'Scan not found.' });
        return;
      }

      const savedFiles = [];

      for (const file of files) {
        const savedFile = await save({
          bytes: file.buffer,
          mimeType: file.mimetype,
          originalFilename: file.originalname,
        });

        savedStorageKeys.push(savedFile.storageKey);
        savedFiles.push(savedFile);
      }

      for (const [index, savedFile] of savedFiles.entries()) {
        await pool.query(
          `INSERT INTO scan_evidence
             (scan_id, image_index, original_filename, storage_key, mime_type, byte_size, sha256, ocr_text, ocr_boxes, annotations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)`,
          [
            scanId,
            index + 1,
            savedFile.originalFilename,
            savedFile.storageKey,
            savedFile.mimeType,
            savedFile.byteSize,
            savedFile.sha256,
            typeof ocrEvidence[index]?.text === 'string' ? ocrEvidence[index].text : null,
            ocrEvidence[index]?.ocrBoxes ? JSON.stringify(ocrEvidence[index].ocrBoxes) : null,
            JSON.stringify({
              readability: calculateReadability(
                ocrEvidence[index]?.ocrBoxes,
                ocrEvidence[index]?.imageWidth ?? null,
                ocrEvidence[index]?.imageHeight ?? null,
              ),
            }),
          ],
        );
        insertedStorageKeys.push(savedFile.storageKey);
      }

      res.status(201).json({
        scanId,
        evidenceCount: savedFiles.length,
      });
    } catch (error) {
      try {
        if (insertedStorageKeys.length > 0) {
          await pool.query(
            'DELETE FROM scan_evidence WHERE scan_id = $1 AND storage_key = ANY($2::text[])',
            [scanId, insertedStorageKeys],
          );
        }
      } catch (databaseCleanupError) {
        console.error('Failed to clean up evidence metadata:', databaseCleanupError);
      }

      await Promise.all(
        savedStorageKeys.map(async (storageKey) => {
          try {
            await remove(storageKey);
          } catch (cleanupError) {
            console.error(`Failed to clean up evidence file ${storageKey}:`, cleanupError);
          }
        }),
      );

      console.error('Evidence upload failed:', error);
      res.status(500).json({ error: 'Failed to save evidence images.' });
    }
  });
});

scansRouter.get('/:id/evidence/:evidenceId', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const scanId = Number(req.params.id);
  const evidenceId = Number(req.params.evidenceId);

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  if (!Number.isInteger(scanId) || scanId < 1 || !Number.isInteger(evidenceId) || evidenceId < 1) {
    res.status(400).json({ error: 'Scan and evidence ids must be positive integers.' });
    return;
  }

  const result = await pool.query(
    `SELECT evidence.storage_key AS "storageKey", evidence.mime_type AS "mimeType"
     FROM scan_evidence AS evidence
     INNER JOIN scans ON scans.id = evidence.scan_id
     WHERE scans.id = $1
       AND scans.clerk_user_id = $2
       AND evidence.id = $3
       AND evidence.scan_id = $1`,
    [scanId, userId, evidenceId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Evidence image not found.' });
    return;
  }

  try {
    const evidenceFile = result.rows[0] as { storageKey: string; mimeType: string };
    const image = await get(evidenceFile.storageKey);
    res.type(evidenceFile.mimeType).send(image);
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? error.code : undefined;

    if (code === 'ENOENT') {
      res.status(404).json({ error: 'Evidence image not found.' });
      return;
    }

    console.error('Failed to retrieve evidence image:', error);
    res.status(500).json({ error: 'Failed to retrieve evidence image.' });
  }
});