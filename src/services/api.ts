import type { ScanHistoryItem, ScanResult } from './mockData';
import { analyzeProduct as analyzeProductAction } from './analysisService';
import { getDemoProducts } from './ocrService';
import { getStoredHistory, getStoredReport } from './storageService';
import type { ScanStatus } from './mockData';

export type DashboardMetrics = {
  totalScans: number;
  compliant: number;
  needsReview: number;
  violations: number;
};

export type DashboardActivity = {
  id: number;
  product: string;
  date: string;
  score: number;
  status: ScanStatus;
};

export type DashboardSummary = {
  metrics: DashboardMetrics;
  recentActivity: DashboardActivity[];
};

export type EvidenceMetadata = {
  id: number;
  imageIndex: number;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  ocrText?: string | null;
  ocrBoxes?: OcrBoxes | null;
  readability?: ReadabilityScreening | null;
};

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

export type ReadabilityScreening = {
  version: 1;
  status: 'PASS' | 'WARNING' | 'MANUAL_REVIEW';
  imageWidth: number | null;
  imageHeight: number | null;
  wordCount: number;
  minWordHeightPx: number | null;
  medianWordHeightPx: number | null;
  p10WordHeightPx: number | null;
  smallTextRatio: number | null;
  smallTextThresholdRelative: number | null;
  reason: string;
};

export type ScanResultWithEvidence = ScanResult & {
  evidence?: EvidenceMetadata[];
};

export async function analyzeProduct(
  payload?: { files?: File[]; file?: File | null; demoProductId?: string; fileName?: string; imageUrl?: string | null },
  getToken?: () => Promise<string | null>,
): Promise<ScanResult> {
  return analyzeProductAction(payload ?? {}, getToken);
}

function formatScanDate(isoDate: string): string {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export async function getScanHistory(getToken?: () => Promise<string | null>): Promise<ScanHistoryItem[]> {
  if (getToken) {
    try {
      const token = await getToken();

      if (token) {
        const response = await fetch('http://localhost:4000/api/scans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);

          if (data && Array.isArray(data.scans)) {
            return data.scans.map(
              (scan: { id: number; product: string; date: string; score: number; status: ScanHistoryItem['status']; report?: ScanResult }) => ({
                id: scan.id,
                product: scan.product,
                date: formatScanDate(scan.date),
                score: scan.score,
                status: scan.status,
                report: scan.report,
              }),
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to load scan history from backend:', error);
    }
  }

  return getStoredHistory();
}

export async function getReportHistory(getToken?: () => Promise<string | null>): Promise<ScanHistoryItem[]> {
  if (!getToken) {
    throw new Error('Authentication is required to load reports.');
  }

  const token = await getToken();

  if (!token) {
    throw new Error('Authentication is required to load reports.');
  }

  const response = await fetch('http://localhost:4000/api/scans', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Reports could not be loaded.');
  }

  const data = await response.json().catch(() => null);

  if (!data || !Array.isArray(data.scans)) {
    throw new Error('Reports response was invalid.');
  }

  return data.scans.map(
    (scan: { id: number; product: string; date: string; score: number; status: ScanHistoryItem['status']; report?: ScanResult }) => ({
      id: scan.id,
      product: scan.product,
      date: formatScanDate(scan.date),
      score: scan.score,
      status: scan.status,
      report: scan.report,
    }),
  );
}

export async function getDashboardSummary(getToken?: () => Promise<string | null>): Promise<DashboardSummary> {
  if (!getToken) {
    throw new Error('Authentication is required to load the dashboard.');
  }

  const token = await getToken();

  if (!token) {
    throw new Error('Authentication is required to load the dashboard.');
  }

  const response = await fetch('http://localhost:4000/api/scans/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Dashboard data could not be loaded.');
  }

  return response.json() as Promise<DashboardSummary>;
}

function createFallbackScanResult(id: number): ScanResult {
  const demo = getDemoProducts()[0];

  return {
    id,
    productName: demo.productName,
    score: demo.score,
    status: demo.status,
    summary: demo.summary,
    imageName: demo.productName,
    source: 'demo',
    scanQuality: 92,
    extractionConfidence: 92,
    productMeta: {
      manufacturer: demo.manufacturer,
      manufacturerAddress: demo.manufacturerAddress,
      netQuantity: demo.netQuantity,
      mrp: demo.mrp,
      consumerCare: demo.consumerCare,
      packingDate: demo.dateOfManufacture,
      countryOfOrigin: demo.countryOfOrigin,
    },
    detectedInfo: [
      { label: 'Product Name', value: demo.productName },
      { label: 'Manufacturer', value: demo.manufacturer },
      { label: 'Net Quantity', value: demo.netQuantity },
      { label: 'MRP', value: demo.mrp },
      { label: 'Consumer Care', value: demo.consumerCare },
      { label: 'Country of Origin', value: demo.countryOfOrigin },
    ],
    complianceBreakdown: [
      { label: 'Product Name', value: 98, status: 'success' },
      { label: 'Net Quantity', value: 96, status: 'success' },
      { label: 'MRP', value: 92, status: 'success' },
      { label: 'Manufacturer Details', value: 90, status: 'success' },
      { label: 'Address / Declaration', value: 78, status: 'warning' },
      { label: 'Consumer Care', value: 86, status: 'success' },
    ],
    issues: [],
    declarations: [],
  };
}

export async function getScanResult(id?: number, getToken?: () => Promise<string | null>): Promise<ScanResultWithEvidence> {
  if (id && getToken) {
    try {
      const token = await getToken();

      if (token) {
        const response = await fetch(`http://localhost:4000/api/scans/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);

          if (data && data.scan) {
            return {
              ...(data.scan as ScanResult),
              evidence: Array.isArray(data.evidence) ? (data.evidence as EvidenceMetadata[]) : [],
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to load scan report from backend:', error);
    }
  }

  if (!id) {
    const firstEntry = getStoredHistory()[0];
    const firstReport = firstEntry?.report;
    return firstReport ?? createFallbackScanResult(firstEntry?.id ?? 1);
  }

  const stored = getStoredReport(id);
  if (stored) {
    return stored;
  }

  const fallback = getStoredHistory().find((entry: ScanHistoryItem) => entry.id === id)?.report;
  if (fallback) return fallback;

  return createFallbackScanResult(id);
}

export async function getEvidenceImage(
  scanId: number,
  evidenceId: number,
  getToken?: () => Promise<string | null>,
): Promise<Blob> {
  if (!getToken) {
    throw new Error('Authentication is required to retrieve evidence.');
  }

  const token = await getToken();

  if (!token) {
    throw new Error('Authentication is required to retrieve evidence.');
  }

  const response = await fetch(`http://localhost:4000/api/scans/${scanId}/evidence/${evidenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Evidence image could not be loaded.');
  }

  return response.blob();
}

export { getDemoProducts } from './ocrService';
