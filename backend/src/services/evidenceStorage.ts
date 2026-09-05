import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const STORAGE_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const storageRoot = path.resolve(
  process.env.EVIDENCE_STORAGE_DIR ?? path.resolve(process.cwd(), 'storage', 'evidence'),
);

export type EvidenceFileInput = {
  bytes: Uint8Array;
  mimeType: string;
  originalFilename: string;
};

export type SavedEvidenceFile = {
  storageKey: string;
  byteSize: number;
  sha256: string;
  mimeType: string;
  originalFilename: string;
};

function validateInput(file: EvidenceFileInput) {
  if (!SUPPORTED_MIME_TYPES.has(file.mimeType)) {
    throw new Error('Unsupported evidence image type.');
  }

  if (file.bytes.byteLength === 0 || file.bytes.byteLength > MAX_FILE_SIZE) {
    throw new Error('Evidence image must be greater than 0 bytes and no larger than 10 MB.');
  }

  if (!file.originalFilename.trim()) {
    throw new Error('Evidence image filename is required.');
  }
}

function validateStorageKey(storageKey: string) {
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error('Invalid evidence storage key.');
  }
}

function resolveStoragePath(storageKey: string) {
  validateStorageKey(storageKey);

  const resolvedPath = path.resolve(storageRoot, storageKey);
  const rootPrefix = `${storageRoot}${path.sep}`;

  if (!resolvedPath.startsWith(rootPrefix)) {
    throw new Error('Evidence storage path escapes the configured storage directory.');
  }

  return resolvedPath;
}

export async function save(file: EvidenceFileInput): Promise<SavedEvidenceFile> {
  validateInput(file);
  await mkdir(storageRoot, { recursive: true });

  const storageKey = randomUUID();
  const destination = resolveStoragePath(storageKey);
  const bytes = Buffer.from(file.bytes);

  await writeFile(destination, bytes, { flag: 'wx', mode: 0o600 });

  return {
    storageKey,
    byteSize: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    mimeType: file.mimeType,
    originalFilename: file.originalFilename,
  };
}

export async function get(storageKey: string): Promise<Buffer> {
  return readFile(resolveStoragePath(storageKey));
}

export async function remove(storageKey: string): Promise<void> {
  await unlink(resolveStoragePath(storageKey));
}

export function createAccessReference(storageKey: string): string {
  validateStorageKey(storageKey);
  return storageKey;
}

export { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES };
