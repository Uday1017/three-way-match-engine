require("dotenv").config();
const mongoose = require("mongoose");
const SkuMaster = require("../models/SkuMaster");

// Full catalogue derived directly from the real PO document's
// Item Code / Item Desc / HSN / MRP / Unit Base Cost columns.
// agreedRate = PO's "Unit Base Cost (INR)" column (the contracted rate).
// mrp = PO's "MRP" column.
// Aliases map each document type's own code scheme to this master record.
// Items with no GRN/Invoice alias were on the PO but not yet
// delivered/invoiced in this sample set (real partial-fulfillment case).
const seedData = [
  { skuErpCode: "11423", name: "Cheesy Spicy Veg Momos 24 Pcs", hsnCode: "19022010", uom: "PKT", agreedRate: 220.762, mrp: 305.0, aliases: [{ source: "grn", code: "11423" }, { source: "invoice", code: "FG-P-F-0503" }] },
  { skuErpCode: "11797", name: "Meatigo Hot Wings 250g", hsnCode: "02071400", uom: "PKT", agreedRate: 126.667, mrp: 175.0, aliases: [{ source: "po", code: "11797" }, { source: "grn", code: "11797" }, { source: "invoice", code: "FG-M-F-1703" }] },
  { skuErpCode: "18003", name: "Meatigo Chicken Curry Cut Skinless Frozen 450g", hsnCode: "02071300", uom: "PKT", agreedRate: 141.143, mrp: 195.0, aliases: [{ source: "po", code: "18003" }, { source: "grn", code: "18003" }, { source: "invoice", code: "FG-M-F-0620" }] },
  { skuErpCode: "18004", name: "Meatigo Chicken Boneless Breast Frozen 450g", hsnCode: "02071300", uom: "PKT", agreedRate: 199.048, mrp: 275.0, aliases: [{ source: "po", code: "18004" }, { source: "grn", code: "18004" }, { source: "invoice", code: "FG-M-F-0619" }] },
  { skuErpCode: "18906", name: "Spring Rolls Veg Frozen 240g", hsnCode: "20049000", uom: "PKT", agreedRate: 123.048, mrp: 170.0, aliases: [] },
  { skuErpCode: "253430", name: "Pork Salami 200g", hsnCode: "16010000", uom: "PKT", agreedRate: 188.190, mrp: 260.0, aliases: [{ source: "grn", code: "253430" }, { source: "invoice", code: "FG-P-F-0249" }] },
  { skuErpCode: "33387", name: "Frozen Chicken Chilli Salami 200g", hsnCode: "16010000", uom: "PKT", agreedRate: 126.667, mrp: 175.0, aliases: [{ source: "po", code: "33387" }, { source: "grn", code: "33387" }, { source: "invoice", code: "FG-P-F-0234" }] },
  { skuErpCode: "33388", name: "Frozen Chicken Pepperoni Salami 100g", hsnCode: "16010000", uom: "PKT", agreedRate: 108.571, mrp: 150.0, aliases: [] },
  { skuErpCode: "33390", name: "Chicken Seekh Kebab 500g", hsnCode: "16010000", uom: "PKT", agreedRate: 228.000, mrp: 315.0, aliases: [{ source: "grn", code: "33390" }, { source: "invoice", code: "FG-P-F-0413" }] },
  { skuErpCode: "398656", name: "Meatigo Chicken Drumsticks 450g", hsnCode: "02071400", uom: "PKT", agreedRate: 188.190, mrp: 260.0, aliases: [{ source: "po", code: "398656" }, { source: "grn", code: "398656" }, { source: "invoice", code: "FG-M-F-0602" }] },
  { skuErpCode: "414867", name: "Chinese Veg Spring Rolls 240g", hsnCode: "20049000", uom: "PKT", agreedRate: 119.429, mrp: 165.0, aliases: [{ source: "po", code: "414867" }, { source: "grn", code: "414867" }, { source: "invoice", code: "FG-P-F-1707" }] },
  { skuErpCode: "432518", name: "Meatigo Chicken Kheema 450g", hsnCode: "02071400", uom: "PKT", agreedRate: 199.048, mrp: 275.0, aliases: [{ source: "po", code: "432518" }, { source: "grn", code: "432518" }, { source: "invoice", code: "FG-M-F-0622" }] },
  { skuErpCode: "4459", name: "Original Chicken Momos 24 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 220.762, mrp: 305.0, aliases: [{ source: "po", code: "4459" }, { source: "grn", code: "4459" }, { source: "invoice", code: "FG-P-F-0505" }] },
  { skuErpCode: "4460", name: "Spicy Chicken Momos 24 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 220.762, mrp: 305.0, aliases: [{ source: "po", code: "4460" }, { source: "grn", code: "4460" }, { source: "invoice", code: "FG-P-F-0512" }] },
  { skuErpCode: "4461", name: "Veg & Paneer Momos 24 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 202.667, mrp: 280.0, aliases: [{ source: "po", code: "4461" }, { source: "grn", code: "4461" }, { source: "invoice", code: "FG-P-F-0514" }] },
  { skuErpCode: "453259", name: "Chicken Cheese & Onion Sausage 250g", hsnCode: "16010000", uom: "PKT", agreedRate: 144.762, mrp: 200.0, aliases: [{ source: "po", code: "453259" }, { source: "grn", code: "453259" }, { source: "invoice", code: "FG-P-F-0335" }] },
  { skuErpCode: "4694", name: "Original Chicken Momos 10 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 133.905, mrp: 185.0, aliases: [{ source: "po", code: "4694" }, { source: "grn", code: "4694" }, { source: "invoice", code: "FG-P-F-0504" }] },
  { skuErpCode: "4695", name: "Spicy Chicken Momos 10 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 133.905, mrp: 185.0, aliases: [] },
  { skuErpCode: "4697", name: "Veg & Paneer Momos 10 Pcs", hsnCode: "21069099", uom: "PKT", agreedRate: 112.190, mrp: 155.0, aliases: [{ source: "po", code: "4697" }, { source: "grn", code: "4697" }, { source: "invoice", code: "FG-P-F-0513" }] },
  { skuErpCode: "469735", name: "Meatigo Everyday Chicken Breast (Frozen) 150g", hsnCode: "16021000", uom: "PKT", agreedRate: 119.429, mrp: 165.0, aliases: [{ source: "po", code: "469735" }, { source: "grn", code: "469735" }, { source: "invoice", code: "FG-M-F-1728" }] },
  { skuErpCode: "4698", name: "Chicken Ham 200g", hsnCode: "16023200", uom: "PKT", agreedRate: 133.905, mrp: 185.0, aliases: [] },
  { skuErpCode: "4699", name: "Pork Sausage 250g", hsnCode: "16010000", uom: "PKT", agreedRate: 170.095, mrp: 235.0, aliases: [{ source: "po", code: "4699" }, { source: "grn", code: "4699" }, { source: "invoice", code: "FG-P-F-0323" }] },
  { skuErpCode: "4700", name: "Pork Ham 200g", hsnCode: "16024900", uom: "PKT", agreedRate: 177.333, mrp: 245.0, aliases: [{ source: "po", code: "4700" }, { source: "grn", code: "4700" }, { source: "invoice", code: "FG-P-F-0236" }] },
  { skuErpCode: "4701", name: "Pork Breakfast Bacon 300g", hsnCode: "16024900", uom: "PKT", agreedRate: 267.810, mrp: 370.0, aliases: [] },
  { skuErpCode: "470663", name: "Whole Wheat Momos - Veg & Paneer 330g", hsnCode: "16021000", uom: "PKT", agreedRate: 162.857, mrp: 225.0, aliases: [{ source: "po", code: "470663" }, { source: "grn", code: "470663" }, { source: "invoice", code: "FG-P-F-0580" }] },
  { skuErpCode: "489632", name: "Tandoori Momos - Chicken 280g", hsnCode: "19022010", uom: "PKT", agreedRate: 159.238, mrp: 220.0, aliases: [] },
  { skuErpCode: "49168", name: "Peri Peri Veg Momos 15 Pcs", hsnCode: "19022010", uom: "PKT", agreedRate: 88.667, mrp: 245.0, aliases: [{ source: "po", code: "49168" }, { source: "grn", code: "49168" }, { source: "invoice", code: "FG-P-F-0527" }] },
  { skuErpCode: "498695", name: "Chicken Salami 200g", hsnCode: "16010000", uom: "PKT", agreedRate: 137.524, mrp: 190.0, aliases: [{ source: "po", code: "498695" }, { source: "grn", code: "498695" }, { source: "invoice", code: "FG-P-F-0247" }] },
  { skuErpCode: "526303", name: "Chicken Pepper & Herb Sausage 250g", hsnCode: "16010000", uom: "PKT", agreedRate: 141.143, mrp: 195.0, aliases: [] },
  { skuErpCode: "598770", name: "Pork Breakfast Bacon 150g", hsnCode: "16010000", uom: "PKT", agreedRate: 152.000, mrp: 210.0, aliases: [{ source: "po", code: "598770" }, { source: "grn", code: "598770" }, { source: "invoice", code: "FG-P-F-0102" }] },
  { skuErpCode: "6664", name: "Chicken Sausages 250g", hsnCode: "16010000", uom: "PKT", agreedRate: 130.286, mrp: 180.0, aliases: [{ source: "po", code: "6664" }, { source: "grn", code: "6664" }, { source: "invoice", code: "FG-P-F-0321" }] },
  { skuErpCode: "6665", name: "Chicken Cheese & Chilli Sausages 250g", hsnCode: "16010000", uom: "PKT", agreedRate: 133.905, mrp: 185.0, aliases: [] },
  { skuErpCode: "730016", name: "Whole Wheat Chicken Momos 330g", hsnCode: "16021000", uom: "PKT", agreedRate: 170.095, mrp: 235.0, aliases: [{ source: "po", code: "730016" }, { source: "grn", code: "730016" }, { source: "invoice", code: "FG-P-F-0581" }] },
  { skuErpCode: "750414", name: "Super Saver Chicken Momo Pack (Chef Momos) 1kg", hsnCode: "19022010", uom: "KG", agreedRate: 247.619, mrp: 650.0, aliases: [{ source: "po", code: "750414" }, { source: "grn", code: "750414" }, { source: "invoice", code: "FG-P-F-0501" }] },
  { skuErpCode: "755774", name: "Chicken & Cheese Momos 540g", hsnCode: "16021000", uom: "PKT", agreedRate: 238.857, mrp: 330.0, aliases: [{ source: "po", code: "755774" }, { source: "grn", code: "755774" }, { source: "invoice", code: "FG-P-F-0564" }] },
  { skuErpCode: "790919", name: "Meatigo Everyday Fish Fillet 200g", hsnCode: "16042000", uom: "PKT", agreedRate: 188.190, mrp: 260.0, aliases: [{ source: "po", code: "790919" }, { source: "grn", code: "790919" }, { source: "invoice", code: "FG-M-F-1729" }] },
  { skuErpCode: "81521", name: "Peri Peri Chicken Momos 250g", hsnCode: "19022010", uom: "PKT", agreedRate: 72.019, mrp: 199.0, aliases: [{ source: "po", code: "81521" }, { source: "grn", code: "81521" }, { source: "invoice", code: "FG-P-F-0542" }] },
  { skuErpCode: "89201", name: "Chicken English Breakfast Sausage 1kg", hsnCode: "16010000", uom: "KG", agreedRate: 222.857, mrp: 585.0, aliases: [] },
  { skuErpCode: "205950", name: "Frozen Pork Pepperoni Salami 100g", hsnCode: "16010000", uom: "PKT", agreedRate: 133.905, mrp: 185.0, aliases: [{ source: "po", code: "205950" }, { source: "grn", code: "205950" }, { source: "invoice", code: "FG-P-F-0237" }] },
  { skuErpCode: "507809", name: "Pizza Minis - Chicken Tikka 180g", hsnCode: "19059090", uom: "PKT", agreedRate: 115.086, mrp: 159.0, aliases: [{ source: "po", code: "507809" }, { source: "grn", code: "507809" }, { source: "invoice", code: "FG-P-F-1911" }] },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding");

  for (const sku of seedData) {
    await SkuMaster.findOneAndUpdate(
      { skuErpCode: sku.skuErpCode },
      { ...sku, eanCode: null, priceTolerance: 0.05 },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`Upserted: ${sku.skuErpCode} — ${sku.name}`);
  }

  console.log(`\nSeeding complete. ${seedData.length} SKU masters upserted with accurate PO-sourced rates.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
