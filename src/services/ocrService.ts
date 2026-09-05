export type ProductExtraction = {
  productName: string;
  manufacturer: string;
  manufacturerAddress: string;
  netQuantity: string;
  mrp: string;
  mrpDeclaration: string;
  consumerCare: string;
  countryOfOrigin: string;
  packerDetails: string;
  importerDetails: string;
  dateOfManufacture: string;
  bestBefore: string;
  batchNumber: string;
  extractedText: string;
  confidence: number;
  sourceLabel: string;
};

export type DemoProduct = {
  id: string;
  productName: string;
  status: 'Compliant' | 'Needs Review' | 'Non-Compliant';
  score: number;
  manufacturer: string;
  manufacturerAddress: string;
  netQuantity: string;
  mrp: string;
  consumerCare: string;
  countryOfOrigin: string;
  dateOfManufacture: string;
  batchNumber: string;
  bestBefore: string;
  summary: string;
};

export const demoProducts: DemoProduct[] = [
  {
    id: 'apex-protein-crunch',
    productName: 'Apex Protein Crunch',
    status: 'Compliant',
    score: 92,
    manufacturer: 'Apex Foods Pvt. Ltd.',
    manufacturerAddress: 'Plot 24, Industrial Estate, Pune, Maharashtra 411045, India',
    netQuantity: '500 g',
    mrp: '₹189.00',
    consumerCare: '1800-123-4567',
    countryOfOrigin: 'India',
    dateOfManufacture: '18 Aug 2026',
    batchNumber: 'AP-CR-2408-09',
    bestBefore: '17 Aug 2028',
    summary: 'Most mandatory declarations were detected and the pack is consistent with legal metrology requirements.',
  },
  {
    id: 'prime-dairy-milk',
    productName: 'Prime Dairy Milk',
    status: 'Needs Review',
    score: 74,
    manufacturer: 'Prime Dairy Cooperative',
    manufacturerAddress: '4th Floor, Anand Market, Ahmedabad, Gujarat 380001, India',
    netQuantity: '1 L',
    mrp: '₹64.00',
    consumerCare: '1800-555-2022',
    countryOfOrigin: 'India',
    dateOfManufacture: '09 Sep 2026',
    batchNumber: 'PDM-10781',
    bestBefore: '12 Sep 2027',
    summary: 'The core declarations are readable, but the lower panel details need a final manual compliance check.',
  },
  {
    id: 'ecoleaf-tea-250g',
    productName: 'EcoLeaf Tea 250g',
    status: 'Compliant',
    score: 95,
    manufacturer: 'EcoLeaf Tea Works',
    manufacturerAddress: 'Sector 12, Tea Valley Road, Darjeeling, West Bengal 734101, India',
    netQuantity: '250 g',
    mrp: '₹320.00',
    consumerCare: '1800-321-8899',
    countryOfOrigin: 'India',
    dateOfManufacture: '14 Sep 2026',
    batchNumber: 'ELT-250-318',
    bestBefore: '13 Sep 2028',
    summary: 'The label includes clear declarations and the product appears ready for standard retail approval.',
  },
  {
    id: 'harbor-rice-5kg',
    productName: 'Harbor Rice 5kg',
    status: 'Non-Compliant',
    score: 58,
    manufacturer: 'Harbor Agro Mills',
    manufacturerAddress: '',
    netQuantity: '5 kg',
    mrp: '₹385.00',
    consumerCare: '',
    countryOfOrigin: 'India',
    dateOfManufacture: '22 Aug 2026',
    batchNumber: 'HR-5K-823',
    bestBefore: '21 Aug 2028',
    summary: 'Mandatory declaration details are incomplete and require corrective action before the package can be cleared.',
  },
];

const productLookup = new Map(demoProducts.map((product) => [product.id, product]));

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function createExtractionFromDemoProduct(product: DemoProduct): ProductExtraction {
  return {
    productName: product.productName,
    manufacturer: product.manufacturer,
    manufacturerAddress: product.manufacturerAddress,
    netQuantity: product.netQuantity,
    mrp: product.mrp,
    mrpDeclaration: `MRP incl. all taxes - ${product.mrp}`,
    consumerCare: product.consumerCare,
    countryOfOrigin: product.countryOfOrigin,
    packerDetails: product.manufacturerAddress || 'Packer details partially visible',
    importerDetails: product.manufacturerAddress || 'Importer details not declared',
    dateOfManufacture: product.dateOfManufacture,
    bestBefore: product.bestBefore,
    batchNumber: product.batchNumber,
    extractedText: `${product.productName}; ${product.netQuantity}; ${product.mrp}; ${product.manufacturer}; ${product.consumerCare}; ${product.countryOfOrigin}; ${product.dateOfManufacture}`,
    confidence: product.status === 'Compliant' ? 96 : product.status === 'Needs Review' ? 78 : 64,
    sourceLabel: 'demo-product',
  };
}

export function getDemoProducts() {
  return demoProducts;
}

export function getDemoProductById(id: string) {
  return productLookup.get(id) ?? demoProducts[0];
}

export function getDemoProductByName(productName: string) {
  const normalized = normalise(productName);
  return demoProducts.find((product) => normalise(product.productName) === normalized) ?? null;
}

export function detectDemoProductFromFileName(fileName: string) {
  const normalized = normalise(fileName);

  if (!normalized) return null;

  return demoProducts.find((product) => {
    const productNameMatch = normalise(product.productName).includes(normalized) || normalized.includes(normalise(product.productName));
    const aliasMatch = [
      product.id,
      product.productName,
      product.manufacturer,
      product.netQuantity,
    ].some((value) => normalise(value).includes(normalized) || normalized.includes(normalise(value)));

    return productNameMatch || aliasMatch;
  }) ?? null;
}

export function getScanQuality(file?: File | null, dimensions?: { width: number; height: number } | null) {
  if (!file) return 0;

  const fileSizeMb = file.size / (1024 * 1024);
  const area = dimensions ? dimensions.width * dimensions.height : 0;

  let quality = 94;

  if (fileSizeMb > 8) quality -= 14;
  else if (fileSizeMb > 5) quality -= 8;
  else if (fileSizeMb > 2) quality -= 3;

  if (!dimensions) quality -= 10;
  else if (area < 450000) quality -= 18;
  else if (area < 900000) quality -= 8;
  else if (area > 2200000) quality += 4;

  if (file.type.includes('png')) quality += 2;
  if (file.name.toLowerCase().includes('blur')) quality -= 12;

  if (quality > 98) quality = 98;
  if (quality < 35) quality = 35;

  return Math.round(quality);
}

export function extractProductData(image?: File | null, override?: Partial<ProductExtraction>) {
  if (override) {
    return {
      productName: override.productName ?? 'Unknown Product',
      manufacturer: override.manufacturer ?? 'Not detected',
      manufacturerAddress: override.manufacturerAddress ?? 'Not detected',
      netQuantity: override.netQuantity ?? 'Not detected',
      mrp: override.mrp ?? 'Not detected',
      mrpDeclaration: override.mrpDeclaration ?? 'Not detected',
      consumerCare: override.consumerCare ?? 'Not detected',
      countryOfOrigin: override.countryOfOrigin ?? 'Not detected',
      packerDetails: override.packerDetails ?? 'Not detected',
      importerDetails: override.importerDetails ?? 'Not detected',
      dateOfManufacture: override.dateOfManufacture ?? 'Not detected',
      bestBefore: override.bestBefore ?? 'Not detected',
      batchNumber: override.batchNumber ?? 'Not detected',
      extractedText: override.extractedText ?? 'No text extracted from image',
      confidence: override.confidence ?? 60,
      sourceLabel: override.sourceLabel ?? 'manual-input',
    } satisfies ProductExtraction;
  }

  const demoProduct = detectDemoProductFromFileName(image?.name ?? '') ?? getDemoProductByName(image?.name ?? '');

  if (demoProduct) {
    return createExtractionFromDemoProduct(demoProduct);
  }

  return {
    productName: image ? `Uploaded Product - ${image.name.replace(/\.[^.]+$/, '')}` : 'Unknown Product',
    manufacturer: 'Not detected',
    manufacturerAddress: 'Not detected',
    netQuantity: 'Not detected',
    mrp: 'Not detected',
    mrpDeclaration: 'Not detected',
    consumerCare: 'Not detected',
    countryOfOrigin: 'Not detected',
    packerDetails: 'Not detected',
    importerDetails: 'Not detected',
    dateOfManufacture: 'Not detected',
    bestBefore: 'Not detected',
    batchNumber: 'Not detected',
    extractedText: image ? `Uploaded image: ${image.name}` : 'No image selected',
    confidence: 52,
    sourceLabel: image ? 'uploaded-file' : 'manual-input',
  } satisfies ProductExtraction;
}
