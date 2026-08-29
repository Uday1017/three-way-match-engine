const SkuMaster = require("../models/SkuMaster");

// Normalise codes for comparison: trim + case-insensitive
function normalise(code) {
  return (code || "").toString().trim().toLowerCase();
}

/**
 * Resolve a single item's itemCode against SkuMaster.
 * Lookup order:
 *   1. aliases matching { source: documentType, code: itemCode }
 *   2. skuErpCode === itemCode
 *   3. eanCode === itemCode
 * Returns { skuMaster: ObjectId|null, unmappedReason: string|null }
 */
async function resolveItem(itemCode, documentType) {
  const normalisedCode = normalise(itemCode);

  if (!normalisedCode) {
    return { skuMaster: null, unmappedReason: "unmapped_master_sku" };
  }

  // Fetch all masters once per batch would be more efficient, but for
  // assignment-scale data, per-item lookup is fine and easier to reason about.
  const allMasters = await SkuMaster.find({});

  for (const master of allMasters) {
    // 1. Check alias for this specific document source
    const aliasMatch = master.aliases.find(
      (a) => a.source === documentType && normalise(a.code) === normalisedCode,
    );
    if (aliasMatch) {
      return { skuMaster: master._id, unmappedReason: null };
    }
  }

  // 2. Fallback: skuErpCode direct match
  let match = await SkuMaster.findOne({
    skuErpCode: { $regex: `^${normalisedCode}$`, $options: "i" },
  });
  if (match) {
    return { skuMaster: match._id, unmappedReason: null };
  }

  // 3. Fallback: eanCode match
  match = await SkuMaster.findOne({
    eanCode: { $regex: `^${normalisedCode}$`, $options: "i" },
  });
  if (match) {
    return { skuMaster: match._id, unmappedReason: null };
  }

  // Could not resolve — flag, never drop
  return { skuMaster: null, unmappedReason: "unmapped_master_sku" };
}

/**
 * Resolve all items in a document's items[] array.
 * Mutates nothing — returns a new array with skuMaster + unmappedReason attached.
 */
async function resolveItems(items, documentType) {
  const resolved = [];
  for (const item of items) {
    const { skuMaster, unmappedReason } = await resolveItem(
      item.itemCode,
      documentType,
    );
    resolved.push({ ...item, skuMaster, unmappedReason });
  }
  return resolved;
}

module.exports = { resolveItem, resolveItems, normalise };
