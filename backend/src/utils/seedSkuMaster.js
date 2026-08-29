require("dotenv").config();
const mongoose = require("mongoose");
const SkuMaster = require("../models/SkuMaster");

const seedData = [
  {
    skuErpCode: "11423",
    name: "Cheesy Spicy Veg Momos 24 Pcs",
    eanCode: null,
    hsnCode: "19022010",
    uom: "PKT",
    agreedRate: 220.76,
    mrp: 305.0,
    priceTolerance: 0.05,
    aliases: [
      { source: "grn", code: "11423" },
      { source: "invoice", code: "FG-P-F-0503" },
    ],
  },
  {
    skuErpCode: "11797",
    name: "Meatigo Hot Wings 250g",
    eanCode: null,
    hsnCode: "02071400",
    uom: "PKT",
    agreedRate: 126.667,
    mrp: 175.0,
    priceTolerance: 0.05,
    aliases: [
      { source: "po", code: "11797" },
      { source: "grn", code: "11797" },
      { source: "invoice", code: "FG-M-F-1703" },
    ],
  },
  {
    skuErpCode: "18003",
    name: "Meatigo Chicken Curry Cut Skinless Frozen 450g",
    eanCode: null,
    hsnCode: "02071300",
    uom: "PKT",
    agreedRate: 141.143,
    mrp: 195.0,
    priceTolerance: 0.05,
    aliases: [
      { source: "po", code: "18003" },
      { source: "grn", code: "18003" },
      { source: "invoice", code: "FG-M-F-0620" },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding");

  for (const sku of seedData) {
    await SkuMaster.findOneAndUpdate({ skuErpCode: sku.skuErpCode }, sku, {
      upsert: true,
      new: true,
    });
    console.log(`Upserted SkuMaster: ${sku.skuErpCode} - ${sku.name}`);
  }

  console.log("Seeding complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
