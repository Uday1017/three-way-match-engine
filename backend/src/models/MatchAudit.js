const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema(
  {
    step: { type: String, required: true },
    status: { type: String, enum: ['success', 'warning', 'error'], required: true },
    message: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const matchAuditSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, index: true, trim: true },
    steps: [stepSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchAudit', matchAuditSchema);
