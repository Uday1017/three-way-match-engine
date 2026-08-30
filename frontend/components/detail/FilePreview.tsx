"use client";

import { useState, useEffect } from "react";
import { documentsApi } from "@/lib/api";

interface FilePreviewProps {
  documentId: string | null;
}

export function FilePreview({ documentId }: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setBlobUrl(null);
    setError(false);

    if (!documentId) return;

    let currentUrl: string | null = null;

    documentsApi
      .getFileBlob(documentId)
      .then(({ url, mimeType }) => {
        currentUrl = url;
        setBlobUrl(url);
        setMimeType(mimeType);
      })
      .catch(() => setError(true));

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [documentId]);

  const zoomOut = () => setZoom((z) => Math.max(50, z - 10));
  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));

  if (!documentId || error) {
    return (
      <div className="bg-cream-card border border-cream-border rounded-lg p-8 text-center h-full flex items-center justify-center">
        <p className="text-text-muted text-sm">No file preview available.</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="bg-cream-card border border-cream-border rounded-lg p-8 text-center h-full flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading preview...</p>
      </div>
    );
  }

  const isImage = mimeType.startsWith("image/");

  return (
    <div className="bg-cream-card border border-cream-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-cream-border">
        <button
          onClick={zoomOut}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-cream-border text-text-subtle hover:bg-cream-muted text-sm"
        >
          −
        </button>
        <span className="text-xs text-text-muted w-10 text-center">{zoom}%</span>
        <button
          onClick={zoomIn}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-cream-border text-text-subtle hover:bg-cream-muted text-sm"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-cream-muted/30 p-2">
        <div style={{ width: `${zoom}%`, transition: "width 0.15s" }}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blobUrl} alt="Document preview" className="w-full h-auto" />
          ) : (
            <iframe src={blobUrl} title="Document preview" className="w-full h-[600px] border-0" />
          )}
        </div>
      </div>
    </div>
  );
}
