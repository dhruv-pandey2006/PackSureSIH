import { scanHistoryDemo, type ScanHistoryItem, type ScanResult } from './mockData';

const HISTORY_KEY = 'packsure:history';
const REPORT_KEY_PREFIX = 'packsure:report:';

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures so the UI remains usable in strict demo mode.
  }
}

export function getStoredHistory(): ScanHistoryItem[] {
  const stored = readStorage<ScanHistoryItem[]>(HISTORY_KEY);
  return stored && stored.length > 0 ? stored : scanHistoryDemo;
}

export function saveHistoryEntry(entry: ScanHistoryItem) {
  const current = getStoredHistory();
  const filtered = current.filter((item) => item.id !== entry.id);
  const next = [entry, ...filtered].sort((a, b) => b.id - a.id);
  writeStorage(HISTORY_KEY, next);
  return next;
}

export function getStoredReport(id: number) {
  const stored = readStorage<ScanResult | null>(`${REPORT_KEY_PREFIX}${id}`);
  return stored ?? null;
}

export function saveStoredReport(result: ScanResult) {
  writeStorage(`${REPORT_KEY_PREFIX}${result.id}`, result);

  const historyEntry: ScanHistoryItem = {
    id: result.id,
    product: result.productName,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    score: result.score,
    status: result.status,
  };

  saveHistoryEntry(historyEntry);
  return result;
}

export function clearStoredHistory() {
  writeStorage(HISTORY_KEY, []);
}
