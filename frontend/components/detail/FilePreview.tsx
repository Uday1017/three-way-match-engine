"use client";

import { useState } from "react";

interface FilePreviewProps {
  fileUrl: string | null;
  mimeType?: string;
}

export function FilePreview({ fileUrl, mimeType }: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);

  const zoomOut = () => setZoom((z) => Math.max(50, z - 10));
  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));

  if (!fileUrl) {
    return (
      <div className="bg-cream-card border border-cream-border rounded-lg p-8 text-center h-full flex items-center justify-center">
        <p className="text-text-muted text-sm">No file preview available.</p>
      </div>
    );
  }

  const isImage = mimeType?.startsWith("image/");

  return (
    <div className="bg-cream-card border border-cream-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-cream-border">
        <button
          onClick={zoomOut}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-cream-border text-text-subtle hover:bg-cream-muted text-sm"
        >
          −
        </button>
        <span className="text-xs text-text-muted w-10 text-center">
          {zoom}%
        </span>
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
            <img
              src={fileUrl}
              alt="Document preview"
              className="w-full h-auto"
            />
          ) : (
            <iframe
              src={fileUrl}
              title="Document preview"
              className="w-full h-[600px] border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
