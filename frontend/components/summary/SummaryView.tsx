"use client";

import { useSummary } from "@/hooks/useMatch";

interface SummaryViewProps {
  poNumber: string;
}

const STATUS_STYLES: Record<string, string> = {
  matched: "bg-success/10 text-success",
  partially_matched: "bg-warning/10 text-warning",
  mismatch: "bg-danger/10 text-danger",
  insufficient_documents: "bg-cream-muted text-text-muted",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-cream-card border border-cream-border rounded-lg p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-xl font-semibold text-charcoal-text">
        ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function SummaryView({ poNumber }: SummaryViewProps) {
  const { data, isLoading, isError } = useSummary(poNumber);

  if (isLoading)
    return <p className="text-text-muted text-sm">Loading summary...</p>;
  if (isError)
    return (
      <p className="text-danger text-sm">Failed to load summary for this PO.</p>
    );
  if (!data) return null;

  if (data.status === "insufficient_documents") {
    return (
      <div className="bg-cream-card border border-cream-border rounded-lg p-6 text-center">
        <p className="text-text-subtle text-sm">
          Not enough documents uploaded yet to compute a summary. A PO, at least
          one GRN, and at least one Invoice are needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="PO Amount" value={data.stats.poAmount} />
        <StatCard label="Total Invoiced" value={data.stats.totalInvoiced} />
        <StatCard label="Total Received" value={data.stats.totalReceived} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-charcoal-text mb-3">
          Associated Invoice & GRN
        </h3>
        <div className="overflow-x-auto rounded-lg border border-cream-border bg-cream-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-border text-left text-xs font-medium text-text-muted uppercase">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Document ID</th>
                <th className="px-4 py-3 text-right">Invoiced Qty</th>
                <th className="px-4 py-3 text-right">Received Qty</th>
                <th className="px-4 py-3 text-right">Pending Delivery</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row: any, i: number) => (
                <tr
                  key={i}
                  className={`border-b border-cream-border last:border-0 ${
                    row.type === "Current Status"
                      ? "bg-cream-muted/50 font-medium"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 text-charcoal-text">{row.type}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {row.documentId ? String(row.documentId).slice(-8) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-text-subtle">
                    {row.cumulativeInvoicedQty ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-text-subtle">
                    {row.cumulativeReceivedQty ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-text-subtle">
                    {row.pendingDeliveryQty ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status] || ""}`}
                      >
                        {row.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
