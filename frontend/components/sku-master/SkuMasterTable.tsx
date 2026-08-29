"use client";

import { SkuMaster, useDeleteSkuMaster } from "@/hooks/useSkuMasters";

interface SkuMasterTableProps {
  skus: SkuMaster[];
  onEdit: (sku: SkuMaster) => void;
}

export function SkuMasterTable({ skus, onEdit }: SkuMasterTableProps) {
  const deleteMutation = useDeleteSkuMaster();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete SKU master "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (skus.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No SKU masters yet. Click "New SKU" to add one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-cream-border bg-cream-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cream-border text-left text-xs font-medium text-text-muted uppercase">
            <th className="px-4 py-3">SKU Code</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">HSN</th>
            <th className="px-4 py-3">UOM</th>
            <th className="px-4 py-3 text-right">Agreed Rate</th>
            <th className="px-4 py-3 text-right">MRP</th>
            <th className="px-4 py-3">Aliases</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku) => (
            <tr
              key={sku._id}
              className="border-b border-cream-border last:border-0 hover:bg-cream-muted/40"
            >
              <td className="px-4 py-3 font-medium text-charcoal-text">
                {sku.skuErpCode}
              </td>
              <td className="px-4 py-3 text-text-subtle">{sku.name}</td>
              <td className="px-4 py-3 text-text-muted">
                {sku.hsnCode || "-"}
              </td>
              <td className="px-4 py-3 text-text-muted">{sku.uom}</td>
              <td className="px-4 py-3 text-right text-text-subtle">
                ₹{sku.agreedRate.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-text-subtle">
                ₹{sku.mrp.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {sku.aliases.map((a, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded bg-cream-muted text-text-muted"
                      title={`${a.source}: ${a.code}`}
                    >
                      {a.source}:{a.code}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(sku)}
                  className="text-xs font-medium text-accent hover:text-accent-hover mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sku._id, sku.name)}
                  className="text-xs font-medium text-danger hover:opacity-70"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
