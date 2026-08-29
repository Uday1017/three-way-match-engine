const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const {
  uploadDocument,
  getDocumentById,
  getDocumentFile,
  listDocuments,
} = require("../controllers/documents.controller");

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/:id/file", getDocumentFile);
router.get("/:id", getDocumentById);
router.get("/", listDocuments);

module.exports = router;
