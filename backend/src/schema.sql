CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'manufacturer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scans (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL,
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scans_clerk_user_created_at_idx
  ON scans (clerk_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS scan_evidence (
  id BIGSERIAL PRIMARY KEY,
  scan_id BIGINT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  image_index INTEGER NOT NULL,
  original_filename TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  sha256 TEXT,
  ocr_text TEXT,
  ocr_boxes JSONB,
  annotations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT scan_evidence_scan_image_unique UNIQUE (scan_id, image_index)
);

CREATE INDEX IF NOT EXISTS scan_evidence_scan_id_idx
  ON scan_evidence (scan_id);