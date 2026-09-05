import { type ComplianceCheckItem, type Issue, type ScanResult } from './mockData';
import { extractProductData, getDemoProductById, type ProductExtraction } from './ocrService';
import { validateProduct } from './complianceService';
import { getStoredHistory, saveStoredReport } from './storageService';

export type PendingAnalysis = {
  fileName?: string;
  imageUrl?: string | null;
  demoProductId?: string;
  fileType?: string;
};

type OcrEvidenceMetadata = {
  imageIndex: number;
  filename: string;
  text: string;
  imageWidth: number | null;
  imageHeight: number | null;
  ocrBoxes: {
    version: 1;
    coordinateSpace: 'image-pixels';
    words: Array<{
      text: string;
      left: number;
      top: number;
      width: number;
      height: number;
      lineIndex: number;
      wordIndex: number;
    }>;
  } | null;
};

async function getImageDimensions(file: File): Promise<{ imageWidth: number; imageHeight: number } | null> {
  if (typeof createImageBitmap !== 'function') return null;

  try {
    const bitmap = await createImageBitmap(file);

    try {
      return { imageWidth: bitmap.width, imageHeight: bitmap.height };
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

const PENDING_KEY = 'packsure:pending-analysis';

function nextResultId() {
  const history = getStoredHistory();
  return (history.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
}

function createReportFromProduct(
  productData: ProductExtraction,
  resultId: number,
  source: 'upload' | 'demo',
  fileName?: string,
  backendCompliance?: {
  ruleSetVersion?: string;
  score: number;
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  checks: Array<{
    field: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
    id?: string;
    name?: string;
    description?: string;
    severity?: 'ERROR' | 'REVIEW';
    basis?: string;
  }>;
},
): ScanResult {
  const compliance = backendCompliance
  ? {
      score: backendCompliance.score,
      status:
        backendCompliance.overallStatus === 'PASS'
          ? 'COMPLIANT'
          : backendCompliance.overallStatus === 'WARNING'
            ? 'NEEDS REVIEW'
            : 'NON-COMPLIANT',
      summary:
        backendCompliance.overallStatus === 'PASS'
          ? 'All tested declarations passed the compliance checks.'
          : backendCompliance.overallStatus === 'WARNING'
            ? 'Some declarations require manual review.'
            : 'One or more required declarations failed the compliance checks.',
      violations: backendCompliance.checks
        .filter((check) => check.status === 'FAIL')
        .map((check) => ({
          id: check.field,
          title: check.field,
          severity: 'HIGH' as const,
          explanation: check.message,
          evidence: check.message,
          recommendation: `Verify the ${check.field.toLowerCase()} declaration on the package.`,
        })),
    }
  : validateProduct(productData);

  const detectionMap = [
    { label: 'Product Name', value: productData.productName },
    { label: 'Manufacturer', value: productData.manufacturer },
    { label: 'Net Quantity', value: productData.netQuantity },
    { label: 'MRP', value: productData.mrp },
    { label: 'Manufacturer Address', value: productData.manufacturerAddress },
    { label: 'Consumer Care', value: productData.consumerCare },
    { label: 'Country of Origin', value: productData.countryOfOrigin },
    { label: 'Manufacturing Date', value: productData.dateOfManufacture },
    { label: 'Best Before', value: productData.bestBefore },
  ];

  const statusMap: Record<ScanResult['status'], string> = {
    Compliant: 'Compliant',
    'Compliant with Minor Issues': 'Compliant with Minor Issues',
    'Needs Review': 'Needs Review',
    'Non-Compliant': 'Non-Compliant',
  };

  const normalizedStatus = statusMap[compliance.status === 'COMPLIANT' ? 'Compliant' : compliance.status === 'NEEDS REVIEW' ? 'Needs Review' : 'Non-Compliant'] as ScanResult['status'];

  const issues: Issue[] = compliance.violations.map((violation) => {
    const severity: Issue['severity'] =
      violation.severity === 'HIGH' ? 'High' : violation.severity === 'MEDIUM' ? 'Medium' : 'Low';

    return {
      severity,
      title: violation.title,
      explanation: violation.explanation,
      ruleReference: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      evidence: violation.evidence,
    };
  });

  const fallbackDeclarations = [
    { label: 'Product Name', passed: productData.productName !== 'Unknown Product', note: productData.productName !== 'Unknown Product' ? 'Visible and readable.' : 'Could not be reliably extracted.' },
    { label: 'Net Quantity', passed: productData.netQuantity !== 'Not detected', note: productData.netQuantity !== 'Not detected' ? 'Declared in standard format.' : 'Missing or not readable.' },
    { label: 'MRP', passed: productData.mrp !== 'Not detected', note: productData.mrp !== 'Not detected' ? 'Price declaration present.' : 'MRP declaration missing.' },
    { label: 'Manufacturer', passed: productData.manufacturer !== 'Not detected', note: productData.manufacturer !== 'Not detected' ? 'Manufacturer details identified.' : 'Manufacturer details missing.' },
    { label: 'Consumer Care', passed: productData.consumerCare !== 'Not detected', note: productData.consumerCare !== 'Not detected' ? 'Support contact present.' : 'Contact details unavailable.' },
    { label: 'Address Declaration', passed: productData.manufacturerAddress !== 'Not detected', note: productData.manufacturerAddress !== 'Not detected' ? 'Address available.' : 'Address needs review.' },
  ];

  const declarationFieldByLabel: Record<string, string> = {
    'Product Name': 'Product Name',
    'Net Quantity': 'Net Quantity',
    MRP: 'MRP',
    Manufacturer: 'Manufacturer / Packer / Importer',
    'Consumer Care': 'Consumer Care',
    'Address Declaration': 'Address',
  };

  const declarations = backendCompliance
    ? fallbackDeclarations.map((fallback) => {
        const matchedCheck = backendCompliance.checks.find(
          (check) => check.field === declarationFieldByLabel[fallback.label],
        );

        return matchedCheck
          ? { label: fallback.label, passed: matchedCheck.status === 'PASS', note: matchedCheck.message }
          : fallback;
      })
    : fallbackDeclarations;

  const result: ScanResult = {
    id: resultId,
    productName: productData.productName,
    score: compliance.score,
    status: normalizedStatus,
    summary: compliance.summary,
    imageName: fileName || productData.productName,
    imageUrl: undefined,
    scanQuality: productData.confidence,
    extractionConfidence: productData.confidence,
    source,
    productMeta: {
      manufacturer: productData.manufacturer,
      manufacturerAddress: productData.manufacturerAddress,
      netQuantity: productData.netQuantity,
      mrp: productData.mrp,
      consumerCare: productData.consumerCare,
      packingDate: productData.dateOfManufacture,
      countryOfOrigin: productData.countryOfOrigin,
    },
    detectedInfo: detectionMap.filter((item) => item.value && item.value !== 'Not detected').map((item) => ({ label: item.label, value: item.value })),
    complianceBreakdown: [
      { label: 'Product Name', value: productData.productName ? 98 : 20, status: productData.productName ? 'success' : 'danger' },
      { label: 'Net Quantity', value: productData.netQuantity !== 'Not detected' ? 96 : 15, status: productData.netQuantity !== 'Not detected' ? 'success' : 'danger' },
      { label: 'MRP', value: productData.mrp !== 'Not detected' ? 92 : 18, status: productData.mrp !== 'Not detected' ? 'success' : 'danger' },
      { label: 'Manufacturer Details', value: productData.manufacturer !== 'Not detected' ? 90 : 22, status: productData.manufacturer !== 'Not detected' ? 'success' : 'danger' },
      { label: 'Address / Declaration', value: productData.manufacturerAddress !== 'Not detected' ? 80 : 45, status: productData.manufacturerAddress !== 'Not detected' ? 'warning' : 'danger' },
      { label: 'Consumer Care', value: productData.consumerCare !== 'Not detected' ? 85 : 30, status: productData.consumerCare !== 'Not detected' ? 'success' : 'warning' },
    ],
    issues,
    declarations,
    complianceChecks: backendCompliance?.checks.map(
      (check): ComplianceCheckItem => ({
        field: check.field,
        status: check.status,
        message: check.message,
        id: check.id,
        name: check.name,
        description: check.description,
        severity: check.severity,
        basis: check.basis,
      }),
    ),
    ruleSetVersion: backendCompliance?.ruleSetVersion,
  };

  return result;
}

export function savePendingAnalysis(payload: PendingAnalysis) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export function loadPendingAnalysis(): PendingAnalysis | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingAnalysis) : null;
  } catch {
    return null;
  }
}

export function clearPendingAnalysis() {
  localStorage.removeItem(PENDING_KEY);
}
async function analyzeUploadedFile(files: File[]) {
  if (files.length === 0) {
    throw new Error('At least one image is required to analyze a product.');
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('file', file));

  const response = await fetch('http://localhost:4000/api/ocr', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || 'Failed to analyze product image.');
  }

  const data = await response.json();

  const productData: ProductExtraction = {
    productName: data.productData.productName ?? 'Unknown Product',
    manufacturer: data.productData.manufacturer ?? 'Not detected',
    manufacturerAddress: data.productData.address ?? 'Not detected',
    netQuantity: data.productData.netQuantity ?? 'Not detected',
    mrp: data.productData.mrp ?? 'Not detected',
    mrpDeclaration: data.productData.mrp
      ? `MRP - ${data.productData.mrp}`
      : 'Not detected',
    consumerCare: data.productData.consumerCare ?? 'Not detected',
    countryOfOrigin: data.productData.countryOfOrigin ?? 'Not detected',
    packerDetails: data.productData.packerDetails ?? 'Not detected',
    importerDetails: data.productData.importerDetails ?? 'Not detected',
    dateOfManufacture: data.productData.dateOfManufacture ?? 'Not detected',
    bestBefore: data.productData.bestBefore ?? 'Not detected',
    batchNumber: data.productData.batchNumber ?? 'Not detected',
    extractedText: data.ocrText ?? '',
    confidence: 90,
    sourceLabel: 'backend-ocr',
  };

  const rawOcrEvidence = Array.isArray(data.ocrEvidence)
    ? (data.ocrEvidence as Omit<OcrEvidenceMetadata, 'imageWidth' | 'imageHeight'>[])
    : [];
  const ocrEvidence = await Promise.all(
    rawOcrEvidence.map(async (item, index) => {
      const dimensions = await getImageDimensions(files[index]);

      return {
        ...item,
        imageWidth: dimensions?.imageWidth ?? null,
        imageHeight: dimensions?.imageHeight ?? null,
      };
    }),
  );

  return {
    productData,
    compliance: data.compliance,
    ocrEvidence,
  };
}
async function persistScanToBackend(
  result: ScanResult,
  getToken?: () => Promise<string | null>,
): Promise<number | null> {
  if (!getToken) {
    console.warn('Skipping backend scan save: no Clerk token getter available (user likely signed out).');
    return null;
  }

  try {
    const token = await getToken();

    if (!token) {
      console.warn('Skipping backend scan save: no Clerk session token available (user is signed out).');
      return null;
    }

    const response = await fetch('http://localhost:4000/api/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error('Failed to save scan to backend:', error?.error || response.statusText);
      return null;
    }

    const data = await response.json().catch(() => null);
    const rawId = data?.scan?.id;

    // Postgres returns bigint ("id") columns as strings via node-postgres,
    // unlike integer columns, so a valid id can arrive as "43" rather than 43.
    const backendId =
      typeof rawId === 'number' ? rawId : typeof rawId === 'string' ? Number(rawId) : NaN;

    if (!Number.isInteger(backendId)) {
      console.error('Backend scan save succeeded but did not return a valid scan id.');
      return null;
    }

    return backendId;
  } catch (error) {
    console.error('Failed to save scan to backend:', error);
    return null;
  }
}

async function uploadScanEvidence(
  scanId: number,
  files: File[],
  ocrEvidence: OcrEvidenceMetadata[],
  getToken?: () => Promise<string | null>,
) {
  if (files.length === 0 || !getToken) return;

  try {
    const token = await getToken();

    if (!token) {
      console.warn('Skipping evidence upload: no Clerk session token available.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    formData.append('ocrEvidence', JSON.stringify(ocrEvidence));

    const response = await fetch(`http://localhost:4000/api/scans/${scanId}/evidence`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.warn('Evidence upload failed; scan report was preserved:', error?.error || response.statusText);
    }
  } catch (error) {
    console.warn('Evidence upload failed; scan report was preserved:', error);
  }
}

export async function analyzeProduct(
  payload: {
    files?: File[];
    // Legacy single-file shape, still sent by ScanProductPage.tsx today.
    // Kept so a one-image scan continues to work exactly as before.
    file?: File | null;
    demoProductId?: string;
    fileName?: string;
    imageUrl?: string | null;
  } = {},
  getToken?: () => Promise<string | null>,
): Promise<ScanResult> {
  const id = nextResultId();

  let productData: ProductExtraction;
  let backendCompliance;
  let ocrEvidence: OcrEvidenceMetadata[] = [];
  const files = payload.files && payload.files.length > 0 ? payload.files : payload.file ? [payload.file] : [];
  let source: 'upload' | 'demo' = 'upload';

  if (payload.demoProductId) {
    const demoProduct = getDemoProductById(payload.demoProductId);
    productData = extractProductData(null, {
      productName: demoProduct.productName,
      manufacturer: demoProduct.manufacturer,
      manufacturerAddress: demoProduct.manufacturerAddress,
      netQuantity: demoProduct.netQuantity,
      mrp: demoProduct.mrp,
      mrpDeclaration: `MRP incl. all taxes - ${demoProduct.mrp}`,
      consumerCare: demoProduct.consumerCare,
      countryOfOrigin: demoProduct.countryOfOrigin,
      packerDetails: demoProduct.manufacturerAddress,
      importerDetails: demoProduct.manufacturerAddress,
      dateOfManufacture: demoProduct.dateOfManufacture,
      bestBefore: demoProduct.bestBefore,
      batchNumber: demoProduct.batchNumber,
      extractedText: `${demoProduct.productName} ${demoProduct.netQuantity} ${demoProduct.mrp}`,
      confidence: 94,
      sourceLabel: 'demo-product',
    });
    source = 'demo';
  } else {
    if (files.length > 0) {
      const backendResult = await analyzeUploadedFile(files);
      productData = backendResult.productData;
      backendCompliance = backendResult.compliance;
      ocrEvidence = backendResult.ocrEvidence;
    } else {
      productData = extractProductData(null);
    }
  }

  const result = createReportFromProduct(
  productData,
  id,
  source,
  payload.fileName || productData.productName,
  backendCompliance,
);
  // Blob URLs (from URL.createObjectURL in ScanProductPage) are only valid
  // for the current browser session and must never be persisted — they
  // cannot be resolved later from localStorage or the backend.
  result.imageUrl = payload.imageUrl && !payload.imageUrl.startsWith('blob:') ? payload.imageUrl : null;

  const backendId = await persistScanToBackend(result, getToken);
  if (backendId !== null) {
    result.id = backendId;
    await uploadScanEvidence(result.id, files, ocrEvidence, getToken);
  }

  saveStoredReport(result);
  clearPendingAnalysis();
  return result;
}
