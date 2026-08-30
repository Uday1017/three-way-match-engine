"use client";

import { useMatchStatus } from "@/hooks/useMatch";
import { DocumentForm } from "./DocumentForm";
import { FilePreview } from "./FilePreview";
import { ItemGrid } from "./ItemGrid";
import { MismatchBanner } from "./MismatchBanner";

interface DocumentDetailViewProps {
  poNumber: string;
  documentType: "po" | "grn" | "invoice";
  documentId: string | null;
  formTitle: string;
  formFields: { label: string; value: string | number | null | undefined }[];
}

export function DocumentDetailView({
  poNumber,
  documentType,
  documentId,
  formTitle,
  formFields,
}: DocumentDetailViewProps) {
  const { data: match, isLoading, isError } = useMatchStatus(poNumber);

  if (isLoading)
    return <p className="text-text-muted text-sm">Loading match data...</p>;
  if (isError)
    return <p className="text-danger text-sm">Failed to load match data.</p>;
  if (!match) return null;

  return (
    <div className="space-y-4">
      <MismatchBanner status={match.status} reasons={match.reasons || []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DocumentForm title={formTitle} fields={formFields} />
        <FilePreview documentId={documentId} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-charcoal-text mb-3">
          Item Details
        </h3>
        <ItemGrid items={match.items || []} />
      </div>
    </div>
  );
}
