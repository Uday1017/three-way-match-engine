"use client";

import { useState, useEffect } from "react";
import {
  SkuMaster,
  useCreateSkuMaster,
  useUpdateSkuMaster,
} from "@/hooks/useSkuMasters";

interface SkuMasterFormModalProps {
  sku: SkuMaster | null; // null = create mode
  onClose: () => void;
}

const EMPTY_FORM = {
  skuErpCode: "",
  name: "",
  eanCode: "",
  hsnCode: "",
  uom: "PKT",
  agreedRate: "",
  mrp: "",
  priceTolerance: "0.05",
};

export function SkuMasterFormModal({ sku, onClose }: SkuMasterFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const createMutation = useCreateSkuMaster();
  const updateMutation = useUpdateSkuMaster();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (sku) {
      setForm({
        skuErpCode: sku.skuErpCode,
        name: sku.name,
        eanCode: sku.eanCode || "",
        hsnCode: sku.hsnCode || "",
        uom: sku.uom || "PKT",
        agreedRate: String(sku.agreedRate),
        mrp: String(sku.mrp),
        priceTolerance: String(sku.priceTolerance),
      });
    }
  }, [sku]);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      skuErpCode: form.skuErpCode.trim(),
      name: form.name.trim(),
      eanCode: form.eanCode.trim() || null,
      hsnCode: form.hsnCode.trim(),
      uom: form.uom.trim(),
      agreedRate: parseFloat(form.agreedRate),
      mrp: parseFloat(form.mrp),
      priceTolerance: parseFloat(form.priceTolerance),
    };

    if (
      !payload.skuErpCode ||
      !payload.name ||
      isNaN(payload.agreedRate) ||
      isNaN(payload.mrp)
    ) {
      setError("SKU Code, Name, Agreed Rate, and MRP are required.");
      return;
    }

    try {
      if (sku) {
        await updateMutation.mutateAsync({ id: sku._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save SKU master");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-card rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-charcoal-text mb-4">
          {sku ? "Edit SKU Master" : "New SKU Master"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="SKU ERP Code"
              value={form.skuErpCode}
              onChange={handleChange("skuErpCode")}
              required
            />
            <Field
              label="EAN Code"
              value={form.eanCode}
              onChange={handleChange("eanCode")}
            />
          </div>

          <Field
            label="Name"
            value={form.name}
            onChange={handleChange("name")}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="HSN Code"
              value={form.hsnCode}
              onChange={handleChange("hsnCode")}
            />
            <Field
              label="UOM"
              value={form.uom}
              onChange={handleChange("uom")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Agreed Rate"
              type="number"
              value={form.agreedRate}
              onChange={handleChange("agreedRate")}
              required
            />
            <Field
              label="MRP"
              type="number"
              value={form.mrp}
              onChange={handleChange("mrp")}
              required
            />
            <Field
              label="Tolerance"
              type="number"
              step="0.01"
              value={form.priceTolerance}
              onChange={handleChange("priceTolerance")}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border border-cream-border rounded-md text-text-subtle hover:bg-cream-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-subtle mb-1">
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-2.5 py-1.5 text-sm border border-cream-border rounded-md bg-cream focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
