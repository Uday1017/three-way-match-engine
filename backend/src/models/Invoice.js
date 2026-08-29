const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, trim: true, default: "" }, // Invoice's "FG-P-F-0503" scheme
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitRate: { type: Number, default: null }, // "Rate [INR]" — may be missing
    mrp: { type: Number, default: null }, // often absent on invoice per our sample
    skuMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkuMaster",
      default: null,
    },
    unmappedReason: { type: String, default: null },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    poNumber: { type: String, required: true, trim: true, index: true },
    invoiceDate: { type: Date, required: true },
    items: [invoiceItemSchema],
    rawParsed: { type: mongoose.Schema.Types.Mixed },
    filePath: { type: String },
  },
  { timestamps: true },
);

invoiceSchema.index({ poNumber: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
