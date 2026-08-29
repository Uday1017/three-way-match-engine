"use client";

import { useState } from "react";
import { useUploadDocument } from "@/hooks/useUpload";

interface UploadModalProps {
  onClose: () => void;
}

type DocType = "po" | "grn" | "invoice";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "po", label: "Purchase Order" },
  { value: "grn", label: "GRN" },
  { value: "invoice", label: "Invoice" },
];

export function UploadModal({ onClose }: UploadModalProps) {
  const [documentType, setDocumentType] = useState<DocType>("po");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const uploadMutation = useUploadDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({ file, documentType });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-card rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-charcoal-text mb-4">
          Upload Document
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-subtle mb-1.5">
              Document Type
            </label>
            <div className="flex gap-2">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setDocumentType(dt.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    documentType === dt.value
                      ? "bg-accent text-white border-accent"
                      : "border-cream-border text-text-subtle hover:bg-cream-muted"
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-subtle mb-1.5">
              File (PDF or image)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-text-subtle file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-cream-muted file:text-text-subtle file:text-xs hover:file:bg-cream-border"
            />
          </div>

          {uploadMutation.isPending && (
            <div className="text-sm text-text-muted">
              Uploading and processing document — this may take a few seconds
              while Gemini extracts the data...
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium border border-cream-border rounded-md text-text-subtle hover:bg-cream-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
