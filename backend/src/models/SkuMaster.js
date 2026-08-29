const mongoose = require("mongoose");

const skuMasterSchema = new mongoose.Schema(
  {
    skuErpCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    eanCode: {
      type: String,
      trim: true,
      default: null,
    },
    hsnCode: {
      type: String,
      trim: true,
    },
    uom: {
      type: String,
      trim: true,
      default: "PKT",
    },
    agreedRate: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    priceTolerance: {
      type: Number,
      default: 0.05, // 5%
    },
    // --- Alias codes: real-world documents use different code schemes per doc type ---
    // PO item codes, GRN SKU codes, and Invoice item codes were all different
    // in our sample data (e.g. PO blank/desc-based, GRN numeric "11423", Invoice "FG-P-F-0503")
    aliases: [
      {
        source: {
          type: String,
          enum: ["po", "grn", "invoice"],
          required: true,
        },
        code: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true },
);

skuMasterSchema.index({ "aliases.source": 1, "aliases.code": 1 });

module.exports = mongoose.model("SkuMaster", skuMasterSchema);
