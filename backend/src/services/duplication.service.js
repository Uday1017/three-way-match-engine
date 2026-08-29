const PurchaseOrder = require("../models/PurchaseOrder");
const Grn = require("../models/Grn");
const Invoice = require("../models/Invoice");

/**
 * Check for duplicates BEFORE persistence decision — but per spec,
 * we still store the document anyway and surface the conflict as a flag.
 */
async function checkDuplicatePo(poNumber) {
  const existing = await PurchaseOrder.findOne({ poNumber });
  return existing ? "duplicate_po" : null;
}

async function checkDuplicateGrn(poNumber, grnNumber) {
  const existing = await Grn.findOne({ poNumber, grnNumber });
  return existing ? "duplicate_document" : null;
}

async function checkDuplicateInvoice(poNumber, invoiceNumber) {
  const existing = await Invoice.findOne({ poNumber, invoiceNumber });
  return existing ? "duplicate_document" : null;
}

module.exports = { checkDuplicatePo, checkDuplicateGrn, checkDuplicateInvoice };
