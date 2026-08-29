"use client";

interface MatchItem {
  itemKey: string;
  description: string;
  skuMasterId: string | null;
  poQty: number;
  grnQty: number;
  invoiceQty: number;
  unitRate: number | null;
  agreedRate: number | null;
  mrp: number | null;
  masterMrp: number | null;
  reasons: string[];
}

interface ItemGridProps {
  items: MatchItem[];
}

function cellHighlight(hasIssue: boolean) {
  return hasIssue ? "bg-danger/10 text-danger font-medium" : "";
}

export function ItemGrid({ items }: ItemGridProps) {
  if (!items || items.length === 0) {
    return (
      <p className="text-text-muted text-sm py-6 text-center">
        No items to display.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-cream-border bg-cream-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cream-border text-left text-xs font-medium text-text-muted uppercase">
            <th className="px-3 py-3">Description</th>
            <th className="px-3 py-3">Mapped SKU</th>
            <th className="px-3 py-3 text-right">PO Qty</th>
            <th className="px-3 py-3 text-right">GRN Qty</th>
            <th className="px-3 py-3 text-right">Invoice Qty</th>
            <th className="px-3 py-3 text-right">Unit Price</th>
            <th className="px-3 py-3 text-right">Agreed Rate</th>
            <th className="px-3 py-3 text-right">MRP</th>
            <th className="px-3 py-3">Flags</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isUnmapped = item.reasons.includes("unmapped_master_sku");
            const hasPriceMismatch = item.reasons.includes("price_mismatch");
            const hasMrpMismatch = item.reasons.includes("mrp_mismatch");
            const hasQtyIssue = item.reasons.some((r) =>
              r.includes("qty_exceeds"),
            );

            return (
              <tr
                key={item.itemKey}
                className="border-b border-cream-border last:border-0"
              >
                <td
                  className="px-3 py-3 text-charcoal-text max-w-xs truncate"
                  title={item.description}
                >
                  {item.description}
                </td>
                <td
                  className={`px-3 py-3 text-xs ${isUnmapped ? "text-warning font-medium" : "text-text-muted"}`}
                >
                  {isUnmapped ? "Unmapped" : item.skuMasterId ? "Mapped" : "-"}
                </td>
                <td
                  className={`px-3 py-3 text-right ${cellHighlight(hasQtyIssue)}`}
                >
                  {item.poQty}
                </td>
                <td
                  className={`px-3 py-3 text-right ${cellHighlight(hasQtyIssue)}`}
                >
                  {item.grnQty}
                </td>
                <td
                  className={`px-3 py-3 text-right ${cellHighlight(hasQtyIssue)}`}
                >
                  {item.invoiceQty}
                </td>
                <td
                  className={`px-3 py-3 text-right ${cellHighlight(hasPriceMismatch)}`}
                >
                  {item.unitRate != null ? `₹${item.unitRate.toFixed(2)}` : "-"}
                </td>
                <td className="px-3 py-3 text-right text-text-muted">
                  {item.agreedRate != null
                    ? `₹${item.agreedRate.toFixed(2)}`
                    : "-"}
                </td>
                <td
                  className={`px-3 py-3 text-right ${cellHighlight(hasMrpMismatch)}`}
                >
                  {item.mrp != null ? `₹${item.mrp.toFixed(2)}` : "-"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.reasons.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-cream-muted text-text-muted whitespace-nowrap"
                      >
                        {r.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
