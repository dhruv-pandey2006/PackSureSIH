import { Router } from 'express';
import { getAuth, requireAuth } from '@clerk/express';
import { pool } from '../db.js';

export const meRouter = Router();

meRouter.get('/', requireAuth(), async (req, res) => {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const claims = sessionClaims as Record<string, unknown> | undefined;
  const email = typeof claims?.email === 'string' ? claims.email : null;
  const fullName = typeof claims?.name === 'string' ? claims.name : null;

  const result = await pool.query(
    `INSERT INTO users (clerk_user_id, email, full_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_user_id) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, users.email),
       full_name = COALESCE(EXCLUDED.full_name, users.full_name),
       updated_at = NOW()
     RETURNING id, clerk_user_id, email, full_name, company, role, created_at, updated_at`,
    [userId, email, fullName],
  );

  res.json({ user: result.rows[0] });
});