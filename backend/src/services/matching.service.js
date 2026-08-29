const PurchaseOrder = require("../models/PurchaseOrder");
const Grn = require("../models/Grn");
const Invoice = require("../models/Invoice");
const { normalise } = require("./masterResolution.service");

const MRP_TOLERANCE = 0.01; // ~1% per spec

/**
 * Builds a stable item key for cross-document aggregation.
 * Prefers the resolved SkuMaster._id; falls back to normalised raw itemCode
 * if the item couldn't be resolved (never dropped, per spec).
 */
function itemKey(item) {
  if (item.skuMaster) return `sku:${item.skuMaster.toString()}`;
  return `raw:${normalise(item.itemCode) || normalise(item.description)}`;
}

/**
 * Aggregates quantities/prices per item key across a list of documents.
 * Returns a Map<itemKey, { qty, unitRate, mrp, skuMaster, unmapped, description }>
 */
function aggregateItems(items, qtyField, extraFields = {}) {
  const map = new Map();

  for (const item of items) {
    const key = itemKey(item);
    const existing = map.get(key) || {
      qty: 0,
      skuMaster: item.skuMaster || null,
      unmapped: !!item.unmappedReason,
      description: item.description,
      itemCode: item.itemCode,
      unitRate: null,
      mrp: null,
    };

    existing.qty += item[qtyField] || 0;

    // Keep the latest non-null unitRate/mrp for comparison purposes
    if (extraFields.unitRateField && item[extraFields.unitRateField] != null) {
      existing.unitRate = item[extraFields.unitRateField];
    }
    if (extraFields.mrpField && item[extraFields.mrpField] != null) {
      existing.mrp = item[extraFields.mrpField];
    }

    map.set(key, existing);
  }

  return map;
}

async function computeMatch(poNumber) {
  const [po, grns, invoices] = await Promise.all([
    PurchaseOrder.findOne({ poNumber }).populate("items.skuMaster"),
    Grn.find({ poNumber }).populate("items.skuMaster"),
    Invoice.find({ poNumber }).populate("items.skuMaster"),
  ]);

  // --- Duplicate PO check (informational, does not block) ---
  const poCount = await PurchaseOrder.countDocuments({ poNumber });
  const hasDuplicatePo = poCount > 1;

  // --- insufficient_documents: full PO + GRN + Invoice set must exist ---
  if (!po || grns.length === 0 || invoices.length === 0) {
    return {
      poNumber,
      status: "insufficient_documents",
      reasons: [],
      missing: {
        po: !po,
        grn: grns.length === 0,
        invoice: invoices.length === 0,
      },
      linkedDocuments: {
        po: po ? [po._id] : [],
        grn: grns.map((g) => g._id),
        invoice: invoices.map((i) => i._id),
      },
    };
  }

  const reasons = new Set();
  const itemLevelReasons = {}; // itemKey -> [reasons]

  function addReason(code, key = null) {
    reasons.add(code);
    if (key) {
      if (!itemLevelReasons[key]) itemLevelReasons[key] = [];
      itemLevelReasons[key].push(code);
    }
  }

  if (hasDuplicatePo) addReason("duplicate_po");

  // --- Duplicate document check (grn/invoice numbers reused under same poNumber) ---
  const grnNumbers = grns.map((g) => g.grnNumber);
  const hasDuplicateGrn = new Set(grnNumbers).size !== grnNumbers.length;
  const invoiceNumbers = invoices.map((i) => i.invoiceNumber);
  const hasDuplicateInvoice =
    new Set(invoiceNumbers).size !== invoiceNumbers.length;
  if (hasDuplicateGrn || hasDuplicateInvoice) addReason("duplicate_document");

  // --- Invoice date must not be after PO date ---
  const poDate = new Date(po.poDate);
  const hasLateInvoice = invoices.some(
    (inv) => new Date(inv.invoiceDate) > poDate,
  );
  if (hasLateInvoice) addReason("invoice_date_after_po_date");

  // --- Aggregate quantities per item across all three doc types ---
  const poItems = aggregateItems(po.items, "quantity", {
    unitRateField: "unitBaseCost",
    mrpField: "mrp",
  });
  const grnItems = aggregateItems(
    grns.flatMap((g) => g.items),
    "receivedQuantity",
    { mrpField: "mrp" },
  );
  const invoiceItems = aggregateItems(
    invoices.flatMap((i) => i.items),
    "quantity",
    { unitRateField: "unitRate", mrpField: "mrp" },
  );

  const allKeys = new Set([
    ...poItems.keys(),
    ...grnItems.keys(),
    ...invoiceItems.keys(),
  ]);
  const itemResults = [];

  for (const key of allKeys) {
    const poItem = poItems.get(key);
    const grnItem = grnItems.get(key);
    const invItem = invoiceItems.get(key);

    const poQty = poItem?.qty || 0;
    const grnQty = grnItem?.qty || 0;
    const invQty = invItem?.qty || 0;

    // item_missing_in_po: appears in GRN/Invoice but not in PO at all
    if (!poItem && (grnItem || invItem)) {
      addReason("item_missing_in_po", key);
    }

    // Quantity checks (only meaningful once the item exists in PO)
    if (poItem) {
      if (grnQty > poQty) addReason("grn_qty_exceeds_po_qty", key);
      if (invQty > poQty) addReason("invoice_qty_exceeds_po_qty", key);
    }
    if (grnQty > 0 && invQty > grnQty) {
      addReason("invoice_qty_exceeds_grn_qty", key);
    }

    // unmapped_master_sku: any occurrence of this item that never resolved
    const isUnmapped =
      poItem?.unmapped || grnItem?.unmapped || invItem?.unmapped;
    if (isUnmapped) addReason("unmapped_master_sku", key);

    // price_mismatch: invoice unitRate vs SkuMaster.agreedRate
    const skuMaster =
      poItem?.skuMaster || grnItem?.skuMaster || invItem?.skuMaster;
    if (skuMaster && invItem?.unitRate != null && skuMaster.agreedRate) {
      const tolerance = skuMaster.priceTolerance ?? 0.05;
      const diff = Math.abs(invItem.unitRate - skuMaster.agreedRate);
      const allowedDiff = skuMaster.agreedRate * tolerance;
      if (diff > allowedDiff) addReason("price_mismatch", key);
    }

    // mrp_mismatch: invoice/GRN mrp vs SkuMaster.mrp, ~1% tolerance
    const observedMrp = invItem?.mrp ?? grnItem?.mrp;
    if (skuMaster && observedMrp != null && skuMaster.mrp) {
      const diff = Math.abs(observedMrp - skuMaster.mrp);
      const allowedDiff = skuMaster.mrp * MRP_TOLERANCE;
      if (diff > allowedDiff) addReason("mrp_mismatch", key);
    }

    itemResults.push({
      itemKey: key,
      description:
        poItem?.description || grnItem?.description || invItem?.description,
      skuMasterId: skuMaster?._id || skuMaster || null,
      poQty,
      grnQty,
      invoiceQty: invQty,
      unitRate: invItem?.unitRate ?? null,
      agreedRate: skuMaster?.agreedRate ?? null,
      mrp: observedMrp ?? null,
      masterMrp: skuMaster?.mrp ?? null,
      reasons: itemLevelReasons[key] || [],
    });
  }

  // --- Roll up to final status per spec's priority order ---
  const HARD_VIOLATIONS = [
    "grn_qty_exceeds_po_qty",
    "invoice_qty_exceeds_grn_qty",
    "invoice_qty_exceeds_po_qty",
    "invoice_date_after_po_date",
    "duplicate_po",
    "duplicate_document",
    "item_missing_in_po",
  ];
  const SOFT_WARNINGS = [
    "price_mismatch",
    "mrp_mismatch",
    "unmapped_master_sku",
  ];

  const reasonList = Array.from(reasons);
  let status;

  if (reasonList.some((r) => HARD_VIOLATIONS.includes(r))) {
    status = "mismatch";
  } else if (reasonList.some((r) => SOFT_WARNINGS.includes(r))) {
    status = "partially_matched";
  } else {
    // Check full reconciliation: every PO item must have equal grn & invoice qty
    const fullyReconciled = itemResults.every(
      (item) => item.poQty === item.grnQty && item.grnQty === item.invoiceQty,
    );
    status = fullyReconciled ? "matched" : "partially_matched";
  }

  return {
    poNumber,
    status,
    reasons: reasonList,
    items: itemResults,
    linkedDocuments: {
      po: [po._id],
      grn: grns.map((g) => g._id),
      invoice: invoices.map((i) => i._id),
    },
    poDetails: {
      poNumber: po.poNumber,
      poDate: po.poDate,
      vendorName: po.vendorName,
    },
  };
}

module.exports = { computeMatch };
