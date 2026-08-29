const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitBaseCost: { type: Number, default: null },
    mrp: { type: Number, default: null },
    skuMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkuMaster",
      default: null,
    },
    unmappedReason: { type: String, default: null }, // e.g. 'unmapped_master_sku'
  },
  { _id: false },
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, trim: true },
    poDate: { type: Date, required: true },
    vendorName: { type: String, trim: true },
    items: [poItemSchema],
    rawParsed: { type: mongoose.Schema.Types.Mixed },
    filePath: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
