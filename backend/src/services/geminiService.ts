import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required. Add it to backend/.env.');
}

const ai = new GoogleGenAI({ apiKey });

export interface ProductData {
  productName: string | null;
    commonName: string | null;
  unitSalePrice: string | null;
  manufacturer: string | null;
  address: string | null;
  netQuantity: string | null;
  mrp: string | null;
  consumerCare: string | null;
  countryOfOrigin: string | null;
  packerDetails: string | null;
  importerDetails: string | null;
  dateOfManufacture: string | null;
  bestBefore: string | null;
  batchNumber: string | null;
}

const productSchema = {
  type: 'object',
  properties: {
  productName: { type: ['string', 'null'] },
  commonName: { type: ['string', 'null'] },
  unitSalePrice: { type: ['string', 'null'] },
  manufacturer: { type: ['string', 'null'] },
    address: { type: ['string', 'null'] },
    netQuantity: { type: ['string', 'null'] },
    mrp: { type: ['string', 'null'] },
    consumerCare: { type: ['string', 'null'] },
    countryOfOrigin: { type: ['string', 'null'] },
    packerDetails: { type: ['string', 'null'] },
    importerDetails: { type: ['string', 'null'] },
    dateOfManufacture: { type: ['string', 'null'] },
    bestBefore: { type: ['string', 'null'] },
    batchNumber: { type: ['string', 'null'] },
  },
 required: [
  'productName',
  'commonName',
  'unitSalePrice',
  'manufacturer',
    'address',
    'netQuantity',
    'mrp',
    'consumerCare',
    'countryOfOrigin',
    'packerDetails',
    'importerDetails',
    'dateOfManufacture',
    'bestBefore',
    'batchNumber',
  ],
};

export async function extractProductData(
  ocrText: string,
): Promise<ProductData> {
  const prompt = `
You are a product-label information extraction assistant for PackSure.

PackSure scans packaged products and needs to extract information relevant
to checking declarations under India's Legal Metrology (Packaged Commodities)
Rules.

Extract ONLY information that is actually present in the OCR text.

IMPORTANT:
- Never invent or guess missing information.
- If a field is not present or cannot be determined, return null.
- Preserve the wording, numbers, and labels from the OCR where practical.
- Do not decide whether the product is legally compliant.
- Do not create values that are not supported by the OCR.

FIELD-SPECIFIC INSTRUCTIONS:
- productName: Extract the actual product or variant name printed on the
  package. Do not use the manufacturer, importer, packer, or company name
  as the product name.

  - commonName: Extract the common or generic name of the commodity when it is
  explicitly stated on the package. Do not confuse the brand name with the
  common/generic name.

- unitSalePrice: Extract the unit sale price ONLY when it is explicitly
  associated with a label such as "Unit Sale Price" or "Unit Sale Price
  per unit", such as a price per ml, per litre, per gram, or per kilogram.
  Do not use the MRP or any other price for this field. Preserve the
  printed unit and value. If no value is explicitly labeled as a unit sale
  price, return null.

- manufacturer: Extract the company or person explicitly identified as the
  manufacturer of the packaged commodity.

- address: Extract the address associated with the manufacturer, packer,
  importer, or other responsible party when clearly stated.

- importerDetails: Preserve whether the text says "Imported by",
  "Marketed by", or "Marketed by/Imported by". Do not change one into another.

- countryOfOrigin: Only return a country when the OCR explicitly indicates
  that the product is made, manufactured, or produced in that country, or
  explicitly states "Country of Origin". Do not infer country of origin from
  a company's headquarters or address.

- netQuantity: Extract the declared net quantity exactly as printed.

- mrp: Extract the maximum retail price ONLY when it is explicitly
  associated with a label such as "MRP", "M.R.P", "Maximum Retail Price",
  or "Max. Retail Price". Preserve the currency symbol or text exactly as
  it appears in the OCR input (for example ₹, Rs, or INR). Never substitute
  one currency symbol for another, never convert or normalize currencies,
  and never turn ₹, Rs, or INR into $ or any other currency symbol. Retain
  the numeric value exactly as represented in the OCR text. If the currency
  symbol is unclear or ambiguous in the OCR text, do not invent or guess a
  different currency symbol. Do not confuse the MRP with batch numbers,
  article numbers, phone numbers, or unit prices. NEVER copy the Unit Sale
  Price, or any other nearby price, into the MRP field. If the MRP value is
  not clearly visible or legible in the OCR text, return null rather than
  substituting a different nearby price.

- batchNumber: Extract only the batch or lot identifier itself. Return only
  the value immediately associated with "Batch No.", "Batch", "Lot No.", or
  equivalent. Do not include nearby dates, times, prices, article numbers,
  barcodes, or other unrelated numbers.

- dateOfManufacture: Extract the date explicitly associated with MFD, Mfg,
  Manufacture Date, or equivalent.

- bestBefore: Extract the date or period explicitly associated with
  Best Before, Use Before, U.B., or equivalent.

- consumerCare: Extract consumer-care or contact information when explicitly
  provided.

Return the product information using the provided JSON schema.

OCR TEXT:
${ocrText}
`;

  let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const geminiStart = Date.now();
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: productSchema,
      },
    });
    console.log(`Gemini attempt ${attempt} took ${Date.now() - geminiStart} ms`);

    break;
  } catch (error) {
    if (attempt === 3) {
      throw error;
    }

    console.log(`Gemini attempt ${attempt} failed. Retrying...`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
if (!response) {
  throw new Error('Gemini did not return a response.');
}
  if (!response.text) {
    throw new Error('Gemini returned an empty response.');
  }

  return JSON.parse(response.text) as ProductData;
}