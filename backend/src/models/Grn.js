const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, trim: true, default: "" }, // GRN's numeric SKU Code
    description: { type: String, required: true, trim: true },
    receivedQuantity: { type: Number, required: true, min: 0 }, // maps from "Recv Qty"
    expectedQuantity: { type: Number, default: null }, // maps from "Exp Qty", informational
    mrp: { type: Number, default: null }, // "Lot MRP"
    unitPrice: { type: Number, default: null },
    skuMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkuMaster",
      default: null,
    },
    unmappedReason: { type: String, default: null },
  },
  { _id: false },
);

const grnSchema = new mongoose.Schema(
  {
    grnNumber: { type: String, required: true, trim: true },
    poNumber: { type: String, required: true, trim: true, index: true }, // link key, not FK
    grnDate: { type: Date, required: true },
    items: [grnItemSchema],
    rawParsed: { type: mongoose.Schema.Types.Mixed },
    filePath: { type: String },
  },
  { timestamps: true },
);

// grnNumber unique only within a given poNumber, per spec
grnSchema.index({ poNumber: 1, grnNumber: 1 }, { unique: true });

module.exports = mongoose.model("Grn", grnSchema);
