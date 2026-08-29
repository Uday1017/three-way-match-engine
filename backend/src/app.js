const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes (mounted here as we build them)
app.use("/auth", require("./routes/auth.routes"));
app.use("/documents", require("./routes/documents.routes"));
app.use("/match", require("./routes/match.routes"));
app.use("/summary", require("./routes/summary.routes"));
app.use("/masters/sku", require("./routes/masters.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler — never leak stack traces
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;
