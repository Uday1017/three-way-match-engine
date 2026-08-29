const express = require("express");
const router = express.Router();
const { getMatch } = require("../controllers/match.controller");

router.get("/:poNumber", getMatch);

module.exports = router;
