import type { ProductData } from '../geminiService.js';

export type ComplianceStatus = 'PASS' | 'WARNING' | 'FAIL';
export type RuleSeverity = 'ERROR' | 'REVIEW';

export const RULE_SET_VERSION = '1.0';
export const RULE_BASIS = 'Legal Metrology packaged-commodity declaration screening';

export interface ComplianceCheck {
  id: string;
  field: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  status: ComplianceStatus;
  message: string;
  basis: string;
}

export interface ComplianceReport {
  ruleSetVersion: string;
  overallStatus: ComplianceStatus;
  score: number;
  checks: ComplianceCheck[];
}

type RuleContext = {
  status: ComplianceStatus;
  message: string;
};

type ComplianceRule = {
  id: string;
  field: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  validate: (product: ProductData) => RuleContext;
};

const missingDeclaration = (label: string, status: ComplianceStatus): RuleContext => ({
  status,
  message: `${label} was not detected in the extracted text; manual verification is recommended.`,
});

const invalidDeclaration = (label: string, status: ComplianceStatus): RuleContext => ({
  status,
  message: `${label} was detected but did not match the supported screening format; manual verification is recommended.`,
});

const rule = (
  definition: Omit<ComplianceRule, 'validate'>,
  validate: ComplianceRule['validate'],
): ComplianceRule => ({ ...definition, validate });

const hasValidDate = (value: string): boolean =>
  /^(0?[1-9]|1[0-2])[\/-]\d{2,4}$|^\d{2,4}[\/-](0?[1-9]|1[0-2])$|^[A-Z]{3}\.?\s*\d{2,4}$|^(0?[1-9]|[12]\d|3[01])[\/-](0?[1-9]|1[0-2])[\/-]\d{2,4}$/i.test(
    value,
  );

const RULE_CATALOG: ComplianceRule[] = [
  rule(
    {
      id: 'LM_PRODUCT_NAME',
      field: 'Product Name',
      name: 'Product Name Declaration',
      description: 'Checks whether a product name was detected in the extracted label text.',
      severity: 'ERROR',
    },
    (product) =>
      product.productName
        ? { status: 'PASS', message: `Product name detected: ${product.productName}` }
        : missingDeclaration('Product name', 'FAIL'),
  ),
  rule(
    {
      id: 'LM_RESPONSIBLE_PARTY',
      field: 'Manufacturer / Packer / Importer',
      name: 'Responsible Party Declaration',
      description: 'Checks whether manufacturer, packer, or importer information was detected.',
      severity: 'ERROR',
    },
    (product) =>
      product.manufacturer || product.packerDetails || product.importerDetails
        ? { status: 'PASS', message: 'Manufacturer, packer, or importer information was detected.' }
        : missingDeclaration('Manufacturer, packer, or importer information', 'FAIL'),
  ),
  rule(
    {
      id: 'LM_ADDRESS',
      field: 'Address',
      name: 'Address Declaration',
      description: 'Checks whether an address was detected for a responsible party.',
      severity: 'ERROR',
    },
    (product) =>
      product.address
        ? { status: 'PASS', message: 'Address information was detected.' }
        : missingDeclaration('Address information', 'FAIL'),
  ),
  rule(
    {
      id: 'LM_NET_QUANTITY',
      field: 'Net Quantity',
      name: 'Net Quantity Declaration',
      description: 'Screens for a numeric net quantity followed by a supported unit.',
      severity: 'ERROR',
    },
    (product) => {
      const value = product.netQuantity?.trim() ?? '';
      const valid = /^\d+(?:\.\d+)?\s*(ml|l|g|kg|units?|pcs?|pieces?|nos?\.?|n)\b/i.test(value);
      if (valid) return { status: 'PASS', message: `Net quantity detected: ${value}` };
      return value
        ? invalidDeclaration('Net quantity declaration', 'FAIL')
        : missingDeclaration('A valid net quantity declaration', 'FAIL');
    },
  ),
  rule(
    {
      id: 'LM_MRP',
      field: 'MRP',
      name: 'Maximum Retail Price Declaration',
      description: 'Screens for a positive numeric MRP value in the extracted text.',
      severity: 'ERROR',
    },
    (product) => {
      const value = product.mrp?.replace(/[₹,:\s]/g, '').replace(/^Rs\.?/i, '').match(/^\d+(?:\.\d+)?/);
      const numericValue = value ? Number(value[0]) : NaN;
      if (Number.isFinite(numericValue) && numericValue > 0) {
        return { status: 'PASS', message: `MRP detected: ${product.mrp}` };
      }
      return product.mrp?.trim()
        ? invalidDeclaration('MRP declaration', 'FAIL')
        : missingDeclaration('A valid MRP declaration', 'FAIL');
    },
  ),
  rule(
    {
      id: 'LM_CONSUMER_CARE',
      field: 'Consumer Care',
      name: 'Consumer Care Declaration',
      description: 'Checks whether consumer-care information was detected.',
      severity: 'REVIEW',
    },
    (product) =>
      product.consumerCare
        ? { status: 'PASS', message: 'Consumer care information was detected.' }
        : missingDeclaration('Consumer care information', 'WARNING'),
  ),
  rule(
    {
      id: 'LM_BATCH_NUMBER',
      field: 'Batch Number',
      name: 'Batch or Lot Declaration',
      description: 'Checks whether a batch or lot number was detected.',
      severity: 'REVIEW',
    },
    (product) =>
      product.batchNumber
        ? { status: 'PASS', message: `Batch number detected: ${product.batchNumber}` }
        : missingDeclaration('Batch or lot number', 'WARNING'),
  ),
  rule(
    {
      id: 'LM_MANUFACTURE_DATE',
      field: 'Manufacture Date',
      name: 'Manufacture Date Declaration',
      description: 'Screens for supported month/year or date formats for manufacture or packing date.',
      severity: 'REVIEW',
    },
    (product) => {
      const value = product.dateOfManufacture?.trim() ?? '';
      if (value && hasValidDate(value)) {
        return { status: 'PASS', message: `Manufacture date detected: ${value}` };
      }
      return value
        ? invalidDeclaration('Manufacture/packing date', 'WARNING')
        : missingDeclaration('A valid manufacture/packing date', 'WARNING');
    },
  ),
  rule(
    {
      id: 'LM_BEST_BEFORE',
      field: 'Best Before / Use Before',
      name: 'Best Before or Use Before Declaration',
      description: 'Screens for supported absolute dates or duration-from-manufacture forms.',
      severity: 'REVIEW',
    },
    (product) => {
      const value = product.bestBefore?.trim() ?? '';
      const duration = /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(?:months?|years?|yrs?)\b.*\bfrom\b.*\b(?:mfg|manufactur\w*|packag\w*|packing)\b/i.test(value);
      if (value && (hasValidDate(value) || duration)) {
        return { status: 'PASS', message: `Best/use-before information detected: ${value}` };
      }
      return value
        ? invalidDeclaration('Best-before/use-before declaration', 'WARNING')
        : missingDeclaration('A valid best-before/use-before declaration', 'WARNING');
    },
  ),
  rule(
    {
      id: 'LM_COMMON_NAME',
      field: 'Common / Generic Name',
      name: 'Common or Generic Name Declaration',
      description: 'Checks whether a common or generic name was detected.',
      severity: 'REVIEW',
    },
    (product) =>
      product.commonName
        ? { status: 'PASS', message: `Common/generic name detected: ${product.commonName}` }
        : missingDeclaration('Common/generic name', 'WARNING'),
  ),
  rule(
    {
      id: 'LM_UNIT_SALE_PRICE',
      field: 'Unit Sale Price',
      name: 'Unit Sale Price Declaration',
      description: 'Screens for a numeric price explicitly expressed per supported quantity unit.',
      severity: 'REVIEW',
    },
    (product) => {
      const value = product.unitSalePrice?.trim() ?? '';
      const valid = /₹?\s*\d+(?:\.\d+)?\s*\/\s*(ml|l|g|kg)\b/i.test(value);
      if (valid) return { status: 'PASS', message: `Unit sale price detected: ${value}` };
      return value
        ? invalidDeclaration('Unit sale price declaration', 'WARNING')
        : missingDeclaration('A valid unit sale price', 'WARNING');
    },
  ),
];

export const complianceRuleCatalog = RULE_CATALOG.map(({ validate: _validate, ...metadata }) => metadata);

export function checkCompliance(product: ProductData): ComplianceReport {
  const checks = RULE_CATALOG.map((definition) => {
    const result = definition.validate(product);
    return {
      id: definition.id,
      field: definition.field,
      name: definition.name,
      description: definition.description,
      severity: definition.severity,
      status: result.status,
      message: result.message,
      basis: RULE_BASIS,
    };
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
    ruleSetVersion: RULE_SET_VERSION,
    overallStatus,
    score,
    checks,
  };
}