import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { pool } from './db.js';
import { meRouter } from './routes/me.js';
import { scansRouter } from './routes/scans.js';
import { ocrRouter } from './routes/ocr.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(clerkMiddleware());

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.use('/api/me', meRouter);
app.use('/api/scans', scansRouter);
app.use('/api/ocr', ocrRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`PackSure backend listening on http://localhost:${port}`);
});