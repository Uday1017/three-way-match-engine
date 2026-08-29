const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-flash-latest";

const PROMPTS = {
  po: `You are a document parser. Extract structured data from this Purchase Order (PO) document.

Return ONLY valid JSON, no markdown, no code fences, no commentary. Match this exact shape:

{
  "poNumber": "string, from 'PO No' field",
  "poDate": "string in YYYY-MM-DD format",
  "vendorName": "string, the vendor/seller name",
  "items": [
    {
      "itemCode": "string, the item/SKU code if present, empty string if not visible",
      "description": "string, the full item description/name",
      "quantity": number,
      "unitBaseCost": number or null,
      "mrp": number or null
    }
  ]
}

Notes:
- Some PO documents have item codes that are blank or missing for certain rows — in that case return itemCode as an empty string "", do not guess or fabricate a code.
- Item descriptions may wrap across multiple lines in the source document — combine them into a single clean description string.
- Numbers must be plain numbers, not strings, and without currency symbols or commas.
- If a field is genuinely not present in the document, use null (for numbers) or "" (for strings), never omit the key.
- Extract ALL line items in the document, even if there are many rows across multiple pages.`,

  grn: `You are a document parser. Extract structured data from this Goods Receipt Note (GRN) document.

Return ONLY valid JSON, no markdown, no code fences, no commentary. Match this exact shape:

{
  "grnNumber": "string, from 'GRN No' field",
  "poNumber": "string, from 'PO No' field",
  "grnDate": "string in YYYY-MM-DD format, from 'GRN Date' field",
  "items": [
    {
      "itemCode": "string, from 'SKU Code' column",
      "description": "string, from 'SKU Desc' column",
      "receivedQuantity": number,
      "expectedQuantity": number or null,
      "mrp": number or null,
      "unitPrice": number or null
    }
  ]
}

Critical notes:
- The GRN has TWO quantity columns: "Exp Qty" (expected) and "Recv Qty" (received). Map "Recv Qty" to receivedQuantity and "Exp Qty" to expectedQuantity — do NOT confuse these two.
- "Lot MRP" column maps to mrp.
- "Unit Price" column maps to unitPrice.
- Numbers must be plain numbers, not strings, without currency symbols or commas.
- If a field is genuinely not present in the document, use null (for numbers) or "" (for strings), never omit the key.
- Extract ALL line items in the document, even if there are many rows across multiple pages.`,

  invoice: `You are a document parser. Extract structured data from this Tax Invoice document.

Return ONLY valid JSON, no markdown, no code fences, no commentary. Match this exact shape:

{
  "invoiceNumber": "string, from 'Invoice No' field",
  "poNumber": "string, from 'Customer Order No' field",
  "invoiceDate": "string in YYYY-MM-DD format, from 'Invoice Date' field",
  "items": [
    {
      "itemCode": "string, from 'Item Code' column",
      "description": "string, the item description",
      "quantity": number,
      "unitRate": number or null,
      "mrp": number or null
    }
  ]
}

Critical notes:
- "Rate [INR]" column maps to unitRate.
- Invoices frequently do NOT show an MRP column at all — in that case return mrp as null, do not fabricate a value.
- Numbers must be plain numbers, not strings, without currency symbols or commas.
- If a field is genuinely not present in the document, use null (for numbers) or "" (for strings), never omit the key.
- Extract ALL line items in the document, even if there are many rows across multiple pages.`,
};

const REQUIRED_FIELDS = {
  po: ["poNumber", "poDate", "items"],
  grn: ["grnNumber", "poNumber", "grnDate", "items"],
  invoice: ["invoiceNumber", "poNumber", "invoiceDate", "items"],
};

function stripCodeFences(text) {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
}

function validateExtraction(documentType, data) {
  const required = REQUIRED_FIELDS[documentType];
  const missing = required.filter((field) => !(field in data));

  if (missing.length > 0) {
    return {
      valid: false,
      reason: `Missing required fields: ${missing.join(", ")}`,
    };
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, reason: "items must be a non-empty array" };
  }

  return { valid: true };
}

async function callGeminiWithRetry(payload, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(payload);
    } catch (err) {
      const isRetryable =
        err.message?.includes("503") || err.message?.includes("UNAVAILABLE");

      if (isRetryable && attempt < maxRetries) {
        const delay = 1000 * (attempt + 1);

        console.warn(
          `Gemini unavailable, retrying in ${delay}ms (attempt ${attempt + 1})`,
        );

        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }
}

async function callGemini(filePath, mimeType, documentType) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const prompt = PROMPTS[documentType];
  if (!prompt) {
    throw new Error(`Unknown document type: ${documentType}`);
  }

  const response = await callGeminiWithRetry({
    model: MODEL_NAME,
    contents: [
      { text: prompt },
      { inlineData: { mimeType, data: base64Data } },
    ],
  });

  const responseText = response.text;

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned malformed JSON: ${err.message}`);
  }

  return parsed;
}

async function extractDocument(filePath, mimeType, documentType) {
  let parsed = await callGemini(filePath, mimeType, documentType);
  let validation = validateExtraction(documentType, parsed);

  if (validation.valid) {
    return { success: true, data: parsed, attempts: 1 };
  }

  console.warn(
    `First extraction attempt failed validation: ${validation.reason}. Retrying once.`,
  );
  parsed = await callGemini(filePath, mimeType, documentType);
  validation = validateExtraction(documentType, parsed);

  if (validation.valid) {
    return { success: true, data: parsed, attempts: 2 };
  }

  return {
    success: false,
    reason: validation.reason,
    rawParsed: parsed,
    attempts: 2,
  };
}

module.exports = { extractDocument };
