const express = require("express");
const router = express.Router();
const { getSummary } = require("../controllers/summary.controller");

router.get("/:poNumber", getSummary);

module.exports = router;
