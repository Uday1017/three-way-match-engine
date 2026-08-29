"use client";

import { useState } from "react";
import { AuthGuard } from "../AuthGuard";
import { AppShell } from "@/components/AppShell";
import { SkuMasterTable } from "@/components/sku-master/SkuMasterTable";
import { SkuMasterFormModal } from "@/components/sku-master/SkuMasterFormModal";
import { useSkuMasters, SkuMaster } from "@/hooks/useSkuMasters";

export default function SkuMasterPage() {
  const { data: skus, isLoading, isError } = useSkuMasters();
  const [editingSku, setEditingSku] = useState<SkuMaster | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenCreate = () => {
    setEditingSku(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sku: SkuMaster) => {
    setEditingSku(sku);
    setShowModal(true);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="border-b border-cream-border bg-cream-card px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-charcoal-text">
              SKU Master
            </h1>
            <p className="text-sm text-text-muted">
              Manage the product catalogue used for item resolution
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover"
          >
            + New SKU
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6">
          {isLoading && <p className="text-text-muted text-sm">Loading...</p>}
          {isError && (
            <p className="text-danger text-sm">Failed to load SKU masters.</p>
          )}
          {skus && <SkuMasterTable skus={skus} onEdit={handleOpenEdit} />}
        </div>

        {showModal && (
          <SkuMasterFormModal
            sku={editingSku}
            onClose={() => setShowModal(false)}
          />
        )}
      </AppShell>
    </AuthGuard>
  );
}
