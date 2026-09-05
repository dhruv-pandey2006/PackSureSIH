import type { ProductExtraction } from './ocrService';

export type CheckStatus = 'PASS' | 'FAIL' | 'WARNING' | 'REVIEW';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplianceCheck = {
  id: string;
  name: string;
  status: CheckStatus;
  severity: Severity;
  expected: string;
  detected: string;
  explanation: string;
};

export type ComplianceReport = {
  score: number;
  status: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT';
  checks: ComplianceCheck[];
  violations: Array<{
    id: string;
    title: string;
    severity: Severity;
    explanation: string;
    evidence: string;
    recommendation: string;
  }>;
  warnings: string[];
  recommendations: string[];
  summary: string;
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

export function validateProduct(productData: ProductExtraction): ComplianceReport {
  const checks: ComplianceCheck[] = [
    {
      id: 'product-name',
      name: 'Product name',
      status: productData.productName && productData.productName !== 'Unknown Product' ? 'PASS' : 'FAIL',
      severity: productData.productName && productData.productName !== 'Unknown Product' ? 'LOW' : 'CRITICAL',
      expected: 'Product name declaration present',
      detected: productData.productName || 'Not detected',
      explanation: productData.productName && productData.productName !== 'Unknown Product'
        ? 'The product name was detected and clearly readable.'
        : 'The product name declaration could not be confidently read from the image.',
    },
    {
      id: 'net-quantity',
      name: 'Net quantity',
      status: productData.netQuantity && productData.netQuantity !== 'Not detected' ? 'PASS' : 'FAIL',
      severity: productData.netQuantity && productData.netQuantity !== 'Not detected' ? 'LOW' : 'CRITICAL',
      expected: 'Net quantity declaration present',
      detected: productData.netQuantity || 'Not detected',
      explanation: productData.netQuantity && productData.netQuantity !== 'Not detected'
        ? 'Net quantity was declared in a readable format.'
        : 'Net quantity declaration is missing or partially unreadable.',
    },
    {
      id: 'mrp',
      name: 'MRP / retail price',
      status: productData.mrp && productData.mrp !== 'Not detected' ? 'PASS' : 'FAIL',
      severity: productData.mrp && productData.mrp !== 'Not detected' ? 'LOW' : 'CRITICAL',
      expected: 'MRP declaration present',
      detected: productData.mrp || 'Not detected',
      explanation: productData.mrp && productData.mrp !== 'Not detected'
        ? 'The MRP declaration was detected and is in a usable format.'
        : 'The MRP declaration is missing or not clearly readable.',
    },
    {
      id: 'manufacturer',
      name: 'Manufacturer / packer / importer details',
      status: productData.manufacturer && productData.manufacturer !== 'Not detected' ? 'PASS' : 'FAIL',
      severity: productData.manufacturer && productData.manufacturer !== 'Not detected' ? 'MEDIUM' : 'HIGH',
      expected: 'Manufacturer or packer information must be present',
      detected: productData.manufacturer || 'Not detected',
      explanation: productData.manufacturer && productData.manufacturer !== 'Not detected'
        ? 'Manufacturer details were identified on the packaging.'
        : 'Manufacturer or packer information is missing and may need manual verification.',
    },
    {
      id: 'address',
      name: 'Manufacturer address',
      status: productData.manufacturerAddress && productData.manufacturerAddress !== 'Not detected' ? 'PASS' : 'FAIL',
      severity: productData.manufacturerAddress && productData.manufacturerAddress !== 'Not detected' ? 'LOW' : 'HIGH',
      expected: 'Manufacturer address declaration present',
      detected: productData.manufacturerAddress || 'Not detected',
      explanation: productData.manufacturerAddress && productData.manufacturerAddress !== 'Not detected'
        ? 'Address information was detected in the label text.'
        : 'Manufacturer address is missing or not fully visible on the package.',
    },
    {
      id: 'consumer-care',
      name: 'Consumer care',
      status: productData.consumerCare && productData.consumerCare !== 'Not detected' ? 'PASS' : 'WARNING',
      severity: productData.consumerCare && productData.consumerCare !== 'Not detected' ? 'LOW' : 'MEDIUM',
      expected: 'Consumer care number or contact details present',
      detected: productData.consumerCare || 'Not detected',
      explanation: productData.consumerCare && productData.consumerCare !== 'Not detected'
        ? 'Consumer care details were detected.'
        : 'Consumer care details are missing or have low confidence.',
    },
    {
      id: 'country-origin',
      name: 'Country of origin',
      status: productData.countryOfOrigin && productData.countryOfOrigin !== 'Not detected' ? 'PASS' : 'WARNING',
      severity: productData.countryOfOrigin && productData.countryOfOrigin !== 'Not detected' ? 'LOW' : 'MEDIUM',
      expected: 'Country of origin declaration present where applicable',
      detected: productData.countryOfOrigin || 'Not detected',
      explanation: productData.countryOfOrigin && productData.countryOfOrigin !== 'Not detected'
        ? 'Country of origin is visible and readable.'
        : 'Country of origin is not clearly present on the package.',
    },
    {
      id: 'date-declarations',
      name: 'Manufacture / best before data',
      status: productData.dateOfManufacture && productData.bestBefore ? 'PASS' : 'REVIEW',
      severity: productData.dateOfManufacture && productData.bestBefore ? 'LOW' : 'MEDIUM',
      expected: 'Manufacture and best before dates should be declared when required',
      detected: productData.dateOfManufacture && productData.bestBefore ? `${productData.dateOfManufacture} / ${productData.bestBefore}` : 'Not detected',
      explanation: productData.dateOfManufacture && productData.bestBefore
        ? 'Date-related declarations were detected and easily read.'
        : 'Date-related declarations may be missing or require manual verification.',
    },
  ];

  const scoreFromChecks = checks.reduce((total, check) => {
    const points = {
      PASS: 100,
      WARNING: 70,
      REVIEW: 55,
      FAIL: 20,
    };
    return total + points[check.status];
  }, 0);

  const score = clampScore(Math.round(scoreFromChecks / checks.length));

  const violations = [] as ComplianceReport['violations'];
  const warnings = [] as string[];
  const recommendations = [] as string[];

  if (!productData.manufacturerAddress || productData.manufacturerAddress === 'Not detected') {
    violations.push({
      id: 'missing-address',
      title: 'Missing manufacturer address',
      severity: 'HIGH',
      explanation: 'The required manufacturer or packer address could not be verified from the scanned packaging.',
      evidence: 'Observed label data did not include a readable address block.',
      recommendation: 'Verify the manufacturer address is printed clearly on the package before release.',
    });
    recommendations.push('Verify manufacturer address and packer details on the physical package.');
  }

  if (!productData.consumerCare || productData.consumerCare === 'Not detected') {
    violations.push({
      id: 'missing-consumer-care',
      title: 'Consumer care details not detected',
      severity: 'MEDIUM',
      explanation: 'The consumer care information required for customer support was not confirmed.',
      evidence: 'No callable support contact was detected in the visible declaration area.',
      recommendation: 'Add a clear consumer care confirmatory number to the label design.',
    });
    recommendations.push('Ensure the consumer care contact is displayed prominently and legibly.');
  }

  if (!productData.mrp || productData.mrp === 'Not detected') {
    violations.push({
      id: 'missing-mrp',
      title: 'Incomplete MRP declaration',
      severity: 'MEDIUM',
      explanation: 'The retail sale price declaration was missing or not clearly readable.',
      evidence: 'Required price declaration could not be extracted from the scanned package.',
      recommendation: 'Display the MRP in a clear, standardised format on the label.',
    });
    recommendations.push('Confirm the MRP declaration is printed in the correct legal metrology format.');
  }

  if (productData.confidence && productData.confidence < 75) {
    warnings.push('Image text confidence is moderate; re-scan for clearer OCR extraction.');
    recommendations.push('Re-scan using a sharper image if the label text confidence is below expected levels.');
  }

  if (violations.length === 0 && warnings.length === 0) {
    recommendations.push('Continue routine compliance review and maintain packaging records.');
  }

  const status: ComplianceReport['status'] = score >= 90 ? 'COMPLIANT' : score >= 70 ? 'NEEDS REVIEW' : 'NON-COMPLIANT';

  const summary = status === 'COMPLIANT'
    ? 'Most mandatory declarations were detected and no critical packaging issues were identified.'
    : status === 'NEEDS REVIEW'
      ? 'Most mandatory declarations were detected. A few items require manual verification before approval.'
      : 'Several mandatory declarations were missing or not confidently readable. Corrective action is required.';

  return {
    score,
    status,
    checks,
    violations,
    warnings,
    recommendations,
    summary,
  };
}
