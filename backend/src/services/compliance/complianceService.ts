import type { ProductData } from '../geminiService.js';

export type ComplianceStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface ComplianceCheck {
  field: string;
  status: ComplianceStatus;
  message: string;
}

export interface ComplianceReport {
  overallStatus: ComplianceStatus;
  score: number;
  checks: ComplianceCheck[];
}

export function checkCompliance(product: ProductData): ComplianceReport {
  const checks: ComplianceCheck[] = [];

  // Product identification
  checks.push({
    field: 'Product Name',
    status: product.productName ? 'PASS' : 'FAIL',
    message: product.productName
      ? `Product name detected: ${product.productName}`
      : 'Product name was not detected.',
  });

  // Manufacturer / importer information
  const hasResponsibleParty =
    Boolean(product.manufacturer) ||
    Boolean(product.packerDetails) ||
    Boolean(product.importerDetails);

  checks.push({
    field: 'Manufacturer / Packer / Importer',
    status: hasResponsibleParty ? 'PASS' : 'FAIL',
    message: hasResponsibleParty
      ? 'Manufacturer, packer, or importer information was detected.'
      : 'No manufacturer, packer, or importer information was detected.',
  });

  // Address
  checks.push({
    field: 'Address',
    status: product.address ? 'PASS' : 'FAIL',
    message: product.address
      ? 'Address information was detected.'
      : 'Address information was not detected.',
  });

  // Net quantity
const netQuantity = product.netQuantity?.trim() ?? '';

const hasValidNetQuantity =
  netQuantity.length > 0 &&
  /^\d+(?:\.\d+)?\s*(ml|l|g|kg|units?|pcs?|pieces?|nos?\.?|n)\b/i.test(netQuantity);

checks.push({
  field: 'Net Quantity',
  status: hasValidNetQuantity ? 'PASS' : 'FAIL',
  message: hasValidNetQuantity
    ? `Net quantity detected: ${netQuantity}`
    : 'A valid net quantity was not detected.',
});

  // MRP
  
const mrpNumericMatch = product.mrp
  ? product.mrp.replace(/[₹,:\s]/g, '').replace(/^Rs\.?/i, '').match(/^\d+(?:\.\d+)?/)
  : null;

const mrpValue = mrpNumericMatch ? Number(mrpNumericMatch[0]) : NaN;

checks.push({
  field: 'MRP',
  status: Number.isFinite(mrpValue) && mrpValue > 0 ? 'PASS' : 'FAIL',
  message: Number.isFinite(mrpValue) && mrpValue > 0
    ? `MRP detected: ${product.mrp}`
    : 'A valid MRP was not detected.',
});

  // Consumer care
  checks.push({
    field: 'Consumer Care',
    status: product.consumerCare ? 'PASS' : 'WARNING',
    message: product.consumerCare
      ? 'Consumer care information was detected.'
      : 'Consumer care information was not detected.',
  });

  // Batch / lot number
  checks.push({
    field: 'Batch Number',
    status: product.batchNumber ? 'PASS' : 'WARNING',
    message: product.batchNumber
      ? `Batch number detected: ${product.batchNumber}`
      : 'Batch or lot number was not detected.',
  });

 // Date of manufacture
const manufactureDate = product.dateOfManufacture?.trim() ?? '';

const hasValidManufactureDate =
  manufactureDate.length > 0 &&
  /^(0?[1-9]|1[0-2])[\/-]\d{2,4}$|^\d{2,4}[\/-](0?[1-9]|1[0-2])$/i.test(
    manufactureDate,
  );

checks.push({
  field: 'Manufacture Date',
  status: hasValidManufactureDate ? 'PASS' : 'WARNING',
  message: hasValidManufactureDate
    ? `Manufacture date detected: ${manufactureDate}`
    : 'A valid manufacture/packing date was not detected.',
});

 // Best before / use before
const bestBefore = product.bestBefore?.trim() ?? '';

const hasAbsoluteBestBeforeDate =
  /^(0?[1-9]|1[0-2])[\/-]\d{2,4}$|^\d{2,4}[\/-](0?[1-9]|1[0-2])$/i.test(
    bestBefore,
  );

const hasDurationBasedBestBefore =
  /\b\d+\s*(?:months?|years?|yrs?)\b.*\bfrom\b.*\b(?:mfg|manufactur\w*|packag\w*|packing)\b/i.test(
    bestBefore,
  );

const hasValidBestBefore =
  bestBefore.length > 0 && (hasAbsoluteBestBeforeDate || hasDurationBasedBestBefore);

checks.push({
  field: 'Best Before / Use Before',
  status: hasValidBestBefore ? 'PASS' : 'WARNING',
  message: hasValidBestBefore
    ? `Best/use-before information detected: ${bestBefore}`
    : 'A valid best-before/use-before declaration was not detected.',
});
  // Common / generic name
  checks.push({
    field: 'Common / Generic Name',
    status: product.commonName ? 'PASS' : 'WARNING',
    message: product.commonName
      ? `Common/generic name detected: ${product.commonName}`
      : 'Common/generic name was not detected.',
  });

  // Unit sale price
const unitSalePrice = product.unitSalePrice?.trim() ?? '';

const hasValidUnitSalePrice =
  unitSalePrice.length > 0 &&
  /₹?\s*\d+(?:\.\d+)?\s*\/\s*(ml|l|g|kg)\b/i.test(unitSalePrice);

checks.push({
  field: 'Unit Sale Price',
  status: hasValidUnitSalePrice ? 'PASS' : 'WARNING',
  message: hasValidUnitSalePrice
    ? `Unit sale price detected: ${unitSalePrice}`
    : 'A valid unit sale price was not detected.',
});
  // Calculate score
  const passCount = checks.filter(
    (check) => check.status === 'PASS',
  ).length;

  const failCount = checks.filter(
    (check) => check.status === 'FAIL',
  ).length;

  const score = Math.round((passCount / checks.length) * 100);

  let overallStatus: ComplianceStatus;

  if (failCount > 0) {
    overallStatus = 'FAIL';
  } else if (checks.some((check) => check.status === 'WARNING')) {
    overallStatus = 'WARNING';
  } else {
    overallStatus = 'PASS';
  }

  return {
    overallStatus,
    score,
    checks,
  };
}