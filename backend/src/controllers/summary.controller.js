const { computeMatch } = require("../services/matching.service");

const getSummary = async (req, res) => {
  const { poNumber } = req.params;

  try {
    const match = await computeMatch(poNumber);

    if (match.status === "insufficient_documents") {
      return res.json({
        poNumber,
        status: match.status,
        stats: { poAmount: 0, totalInvoiced: 0, totalReceived: 0 },
        rows: [],
      });
    }

    // Stat cards: PO Amount, Total Invoiced, Total Received
    const poAmount = match.items.reduce(
      (sum, item) => sum + item.poQty * (item.agreedRate || 0),
      0,
    );
    const totalInvoiced = match.items.reduce(
      (sum, item) =>
        sum + item.invoiceQty * (item.unitRate || item.agreedRate || 0),
      0,
    );
    const totalReceived = match.items.reduce(
      (sum, item) => sum + item.grnQty * (item.agreedRate || 0),
      0,
    );

    // Associated Invoice & GRN table — one row per document + final "Current Status" row
    const rows = [];

    for (const grnId of match.linkedDocuments.grn) {
      rows.push({ type: "GRN", documentId: grnId });
    }
    for (const invId of match.linkedDocuments.invoice) {
      rows.push({ type: "Invoice", documentId: invId });
    }

    const totalPoQty = match.items.reduce((s, i) => s + i.poQty, 0);
    const totalGrnQty = match.items.reduce((s, i) => s + i.grnQty, 0);
    const totalInvQty = match.items.reduce((s, i) => s + i.invoiceQty, 0);

    rows.push({
      type: "Current Status",
      status: match.status,
      cumulativeInvoicedQty: totalInvQty,
      cumulativeReceivedQty: totalGrnQty,
      pendingDeliveryQty: Math.max(totalPoQty - totalGrnQty, 0),
    });

    res.json({
      poNumber,
      status: match.status,
      stats: {
        poAmount: Math.round(poAmount * 100) / 100,
        totalInvoiced: Math.round(totalInvoiced * 100) / 100,
        totalReceived: Math.round(totalReceived * 100) / 100,
      },
      rows,
    });
  } catch (err) {
    console.error("Summary computation error:", err);
    res
      .status(500)
      .json({ error: "Failed to compute summary", details: err.message });
  }
};

module.exports = { getSummary };
