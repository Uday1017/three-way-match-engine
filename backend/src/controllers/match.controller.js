const { computeMatch } = require("../services/matching.service");

const getMatch = async (req, res) => {
  const { poNumber } = req.params;

  try {
    const result = await computeMatch(poNumber);
    res.json(result);
  } catch (err) {
    console.error("Match computation error:", err);
    res
      .status(500)
      .json({ error: "Failed to compute match", details: err.message });
  }
};

module.exports = { getMatch };
