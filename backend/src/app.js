const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", require("./routes/auth.routes"));

// Everything below requires a valid Bearer token
app.use("/documents", authMiddleware, require("./routes/documents.routes"));
app.use("/match", authMiddleware, require("./routes/match.routes"));
app.use("/summary", authMiddleware, require("./routes/summary.routes"));
app.use("/masters/sku", authMiddleware, require("./routes/masters.routes"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;
