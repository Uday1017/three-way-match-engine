const SkuMaster = require("../models/SkuMaster");

const createSku = async (req, res) => {
  try {
    const sku = await SkuMaster.create(req.body);
    res.status(201).json(sku);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "skuErpCode must be unique", details: err.message });
    }
    res
      .status(400)
      .json({ error: "Failed to create SKU master", details: err.message });
  }
};

const getAllSkus = async (req, res) => {
  try {
    const skus = await SkuMaster.find({}).sort({ createdAt: -1 });
    res.json(skus);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch SKU masters", details: err.message });
  }
};

const getSkuById = async (req, res) => {
  try {
    const sku = await SkuMaster.findById(req.params.id);
    if (!sku) return res.status(404).json({ error: "SKU master not found" });
    res.json(sku);
  } catch (err) {
    res.status(400).json({ error: "Invalid SKU id", details: err.message });
  }
};

const updateSku = async (req, res) => {
  try {
    const sku = await SkuMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sku) return res.status(404).json({ error: "SKU master not found" });
    res.json(sku);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "skuErpCode must be unique", details: err.message });
    }
    res
      .status(400)
      .json({ error: "Failed to update SKU master", details: err.message });
  }
};

const deleteSku = async (req, res) => {
  try {
    const sku = await SkuMaster.findByIdAndDelete(req.params.id);
    if (!sku) return res.status(404).json({ error: "SKU master not found" });
    res.json({ message: "SKU master deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: "Invalid SKU id", details: err.message });
  }
};

module.exports = { createSku, getAllSkus, getSkuById, updateSku, deleteSku };
