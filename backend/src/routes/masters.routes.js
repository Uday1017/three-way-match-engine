const express = require("express");
const router = express.Router();
const {
  createSku,
  getAllSkus,
  getSkuById,
  updateSku,
  deleteSku,
} = require("../controllers/masters.controller");

router.post("/", createSku);
router.get("/", getAllSkus);
router.get("/:id", getSkuById);
router.patch("/:id", updateSku);
router.delete("/:id", deleteSku);

module.exports = router;
