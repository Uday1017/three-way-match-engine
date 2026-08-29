const path = require("path");
const PurchaseOrder = require("../models/PurchaseOrder");
const Grn = require("../models/Grn");
const Invoice = require("../models/Invoice");
const MatchAudit = require("../models/MatchAudit");
const { extractDocument } = require("../services/gemini.service");
const { resolveItems } = require("../services/masterResolution.service");
const {
  checkDuplicatePo,
  checkDuplicateGrn,
  checkDuplicateInvoice,
} = require("../services/duplication.service");

async function logAuditStep(poNumber, step, status, message) {
  let audit = await MatchAudit.findOne({ poNumber });
  if (!audit) {
    audit = new MatchAudit({ poNumber, steps: [] });
  }
  audit.steps.push({ step, status, message, at: new Date() });
  await audit.save();
}

const uploadDocument = async (req, res) => {
  const { documentType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!["po", "grn", "invoice"].includes(documentType)) {
    return res
      .status(400)
      .json({ error: "documentType must be one of: po, grn, invoice" });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    // 1. Extract via Gemini (with built-in retry-once on malformed output)
    const extraction = await extractDocument(filePath, mimeType, documentType);

    if (!extraction.success) {
      return res.status(422).json({
        error: `Extraction failed after retry: ${extraction.reason}`,
        rawParsed: extraction.rawParsed,
      });
    }

    const parsed = extraction.data;
    const poNumber = parsed.poNumber;

    if (!poNumber) {
      return res
        .status(422)
        .json({ error: "Extracted document has no poNumber — cannot proceed" });
    }

    // 2. Master resolution — run before persistence, never blocks storage
    const resolvedItems = await resolveItems(parsed.items, documentType);

    // 3. Persist based on documentType, independent of whether a PO exists yet
    let savedDoc;
    let duplicateFlag = null;

    if (documentType === "po") {
      duplicateFlag = await checkDuplicatePo(poNumber);

      savedDoc = await PurchaseOrder.create({
        poNumber,
        poDate: new Date(parsed.poDate),
        vendorName: parsed.vendorName || "",
        items: resolvedItems,
        rawParsed: parsed,
        filePath,
      });
    } else if (documentType === "grn") {
      const grnNumber = parsed.grnNumber;
      duplicateFlag = await checkDuplicateGrn(poNumber, grnNumber);

      savedDoc = await Grn.create({
        grnNumber,
        poNumber,
        grnDate: new Date(parsed.grnDate),
        items: resolvedItems,
        rawParsed: parsed,
        filePath,
      });
    } else if (documentType === "invoice") {
      const invoiceNumber = parsed.invoiceNumber;
      duplicateFlag = await checkDuplicateInvoice(poNumber, invoiceNumber);

      savedDoc = await Invoice.create({
        invoiceNumber,
        poNumber,
        invoiceDate: new Date(parsed.invoiceDate),
        items: resolvedItems,
        rawParsed: parsed,
        filePath,
      });
    }

    // 4. Audit log
    await logAuditStep(
      poNumber,
      "parsed",
      "success",
      `${documentType} parsed and persisted`,
    );
    if (duplicateFlag) {
      await logAuditStep(poNumber, "duplicate_check", "warning", duplicateFlag);
    }

    const unmappedCount = resolvedItems.filter((i) => i.unmappedReason).length;
    if (unmappedCount > 0) {
      await logAuditStep(
        poNumber,
        "master_resolution",
        "warning",
        `${unmappedCount} item(s) unmapped_master_sku`,
      );
    }

    res.status(201).json({
      message: "Document uploaded and processed",
      documentType,
      document: savedDoc,
      duplicateFlag,
      unmappedItemsCount: unmappedCount,
    });
  } catch (err) {
    console.error("Upload processing error:", err);
    res
      .status(500)
      .json({ error: "Failed to process document", details: err.message });
  }
};

const getDocumentById = async (req, res) => {
  const { id } = req.params;
  const models = [PurchaseOrder, Grn, Invoice];

  for (const Model of models) {
    const doc = await Model.findById(id);
    if (doc) return res.json(doc);
  }

  res.status(404).json({ error: "Document not found" });
};

const getDocumentFile = async (req, res) => {
  const { id } = req.params;
  const models = [PurchaseOrder, Grn, Invoice];

  for (const Model of models) {
    const doc = await Model.findById(id);
    if (doc && doc.filePath) {
      return res.sendFile(path.resolve(doc.filePath));
    }
  }

  res.status(404).json({ error: "Document or file not found" });
};

const listDocuments = async (req, res) => {
  const { type, poNumber } = req.query;
  const filter = {};
  if (poNumber) filter.poNumber = poNumber;

  const results = {};

  if (!type || type === "po") {
    results.po = await PurchaseOrder.find(filter);
  }
  if (!type || type === "grn") {
    results.grn = await Grn.find(filter);
  }
  if (!type || type === "invoice") {
    results.invoice = await Invoice.find(filter);
  }

  res.json(results);
};

module.exports = {
  uploadDocument,
  getDocumentById,
  getDocumentFile,
  listDocuments,
};
