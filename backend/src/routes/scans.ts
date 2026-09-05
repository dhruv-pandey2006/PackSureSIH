import { Router } from 'express';
import { getAuth, requireAuth } from '@clerk/express';
import { pool } from '../db.js';

export const scansRouter = Router();

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

  res.json({ scan: result.rows[0].report });
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