export type Severity = 'High' | 'Medium' | 'Low';

export type Issue = {
  severity: Severity;
  title: string;
  explanation: string;
  ruleReference: string;
  evidence: string;
};

export type ScanStatus = 'Compliant' | 'Compliant with Minor Issues' | 'Needs Review' | 'Non-Compliant';

export type BreakdownItem = {
  label: string;
  value: number;
  status: 'success' | 'warning' | 'danger';
};

export type ComplianceCheckItem = {
  field: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  message: string;
};

export type ScanResult = {
  id: number;
  productName: string;
  score: number;
  status: ScanStatus;
  summary: string;
  imageName?: string;
  imageUrl?: string | null;
  scanQuality?: number;
  extractionConfidence?: number;
  source?: 'upload' | 'demo';
  productMeta: {
    manufacturer: string;
    manufacturerAddress?: string;
    netQuantity: string;
    mrp: string;
    consumerCare: string;
    packingDate: string;
    countryOfOrigin: string;
  };
  detectedInfo: Array<{
    label: string;
    value: string;
  }>;
  complianceBreakdown: BreakdownItem[];
  issues: Issue[];
  declarations: Array<{ label: string; passed: boolean; note: string }>;
  complianceChecks?: ComplianceCheckItem[];
};

export type ScanHistoryItem = {
  id: number;
  product: string;
  date: string;
  score: number;
  status: ScanStatus;
  image?: string | null;
  report?: ScanResult;
};

export const scanResultDemo: ScanResult = {
  id: 1,
  productName: 'Apex Protein Crunch',
  score: 92,
  status: 'Compliant',
  summary: 'Most mandatory declarations were detected. The packaging appears compliant and ready for approval.',
  imageName: 'apex-protein-crunch.jpg',
  scanQuality: 95,
  extractionConfidence: 96,
  source: 'demo',
  productMeta: {
    manufacturer: 'Apex Foods Pvt. Ltd.',
    manufacturerAddress: 'Plot 24, Industrial Estate, Pune, Maharashtra 411045, India',
    netQuantity: '500 g',
    mrp: '₹189.00',
    consumerCare: '1800-123-4567',
    packingDate: '18 Aug 2026',
    countryOfOrigin: 'India',
  },
  detectedInfo: [
    { label: 'Product Name', value: 'Apex Protein Crunch' },
    { label: 'Manufacturer', value: 'Apex Foods Pvt Ltd.' },
    { label: 'Net Quantity', value: '500 g' },
    { label: 'MRP', value: '₹189.00' },
    { label: 'Manufacturing/Packing Date', value: '18 Aug 2026' },
    { label: 'Consumer Care', value: '1800-123-4567' },
    { label: 'Country of Origin', value: 'India' },
  ],
  complianceBreakdown: [
    { label: 'Product Name', value: 98, status: 'success' },
    { label: 'Manufacturer Details', value: 94, status: 'success' },
    { label: 'Net Quantity', value: 96, status: 'success' },
    { label: 'MRP', value: 91, status: 'success' },
    { label: 'Address / Declaration', value: 70, status: 'warning' },
    { label: 'Consumer Care', value: 88, status: 'success' },
  ],
  declarations: [
    { label: 'Product Name', passed: true, note: 'Visible and readable.' },
    { label: 'Manufacturer Details', passed: true, note: 'Complete and legible.' },
    { label: 'Net Quantity', passed: true, note: 'Declared in standard unit.' },
    { label: 'MRP', passed: true, note: 'Clearly printed.' },
    { label: 'Consumer Care', passed: true, note: 'Contact details present.' },
    { label: 'Address / Declaration Review', passed: false, note: 'Needs human verification.' },
  ],
  issues: [
    {
      severity: 'High',
      title: 'Missing / Invalid Declaration',
      explanation: 'The required declaration could not be confidently verified from the scanned label.',
      ruleReference: 'Legal Metrology Rule Reference — backend will populate this.',
      evidence: 'Detected region: lower-right panel, parcel label text not fully readable.',
    },
    {
      severity: 'Medium',
      title: 'Address Declaration Not Fully Confirmed',
      explanation: 'The full address declaration is partially visible but not clearly aligned with the expected format.',
      ruleReference: 'Legal Metrology Rule Reference — backend will populate this.',
      evidence: 'Detected text: “Apex Foods…” located near the base panel with partial truncation.',
    },
    {
      severity: 'Low',
      title: 'Packaging Date Small Print',
      explanation: 'The packing date is present but printed in low contrast and may be difficult to verify in quick scans.',
      ruleReference: 'Legal Metrology Rule Reference — backend will populate this.',
      evidence: 'Detected text: “18 Aug 2026” in a smaller font size.',
    },
  ],
};

export const scanHistoryDemo: ScanHistoryItem[] = [
  { id: 1, product: 'Apex Protein Crunch', date: '03 Sep 2026', score: 92, status: 'Compliant' },
  { id: 2, product: 'EcoLeaf Tea 250g', date: '31 Aug 2026', score: 95, status: 'Compliant' },
  { id: 3, product: 'Prime Dairy Milk', date: '27 Aug 2026', score: 74, status: 'Needs Review' },
  { id: 4, product: 'Harbor Rice 5kg', date: '19 Aug 2026', score: 58, status: 'Non-Compliant' },
];

export const aboutSteps = [
  {
    title: 'Scan the packaging',
    description: 'Upload a clear photo of the product label or package so the system can inspect declarations and packaging details.',
  },
  {
    title: 'Extract label information',
    description: 'PackSure reads the visible text and identifies the product name, quantity, manufacturer, MRP, and other declarations.',
  },
  {
    title: 'Validate mandatory declarations',
    description: 'The platform checks mandatory labeling and packaging information against the expected compliance framework.',
  },
  {
    title: 'Generate explainable compliance report',
    description: 'Users receive a clear score, summary, and violation notes that explain what was detected and where further review is needed.',
  },
];

export const landingMetrics = [
  { label: 'Sample scenarios', value: '4 product checks' },
  { label: 'Compliance types', value: 'Food • Dairy • Tea • Rice' },
  { label: 'Review flow', value: 'Demo-ready UI' },
  { label: 'Visibility', value: 'Explainable reports' },
];
