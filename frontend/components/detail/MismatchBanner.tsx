"use client";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  mismatch: {
    label: "Mismatch Detected",
    className: "bg-danger/10 text-danger border-danger/30",
  },
  partially_matched: {
    label: "Partially Matched",
    className: "bg-warning/10 text-warning border-warning/30",
  },
  matched: {
    label: "Fully Matched",
    className: "bg-success/10 text-success border-success/30",
  },
  insufficient_documents: {
    label: "Awaiting Documents",
    className: "bg-cream-muted text-text-muted border-cream-border",
  },
};

export function MismatchBanner({
  status,
  reasons,
}: {
  status: string;
  reasons: string[];
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.insufficient_documents;

  return (
    <div className={`border rounded-lg px-4 py-3 mb-4 ${config.className}`}>
      <p className="text-sm font-semibold">{config.label}</p>
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {reasons.map((r) => (
            <span
              key={r}
              className="text-xs px-2 py-0.5 rounded-full bg-white/50"
            >
              {r.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
