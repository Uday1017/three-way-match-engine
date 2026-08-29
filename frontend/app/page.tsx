'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from './AuthGuard';
import { AppShell } from '@/components/AppShell';
import { TopTabs, TabKey } from '@/components/TopTabs';
import { SummaryView } from '@/components/summary/SummaryView';
import { UploadModal } from '@/components/upload/UploadModal';
import { DocumentDetailView } from '@/components/detail/DocumentDetailView';
import { useDocumentsByPo } from '@/hooks/useDocuments';

export default function Home() {
  const [poNumberInput, setPoNumberInput] = useState('CI4PO05788');
  const [activePoNumber, setActivePoNumber] = useState('CI4PO05788');
  const [activeTab, setActiveTab] = useState<TabKey>('po');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeSubTabId, setActiveSubTabId] = useState<string | null>(null);

  const { data, isLoading, isError } = useDocumentsByPo(activePoNumber);

  const counts = {
    po: data?.po?.length || 0,
    fulfillment: data?.invoice?.length || 0,
    delivery: data?.grn?.length || 0,
  };

  // Reset sub-tab selection whenever the main tab or PO changes
  useEffect(() => {
    setActiveSubTabId(null);
  }, [activeTab, activePoNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePoNumber(poNumberInput.trim());
  };

  // Determine which sub-tab list applies (GRNs for delivery, Invoices for fulfillment)
  const subTabDocs =
    activeTab === 'delivery' ? data?.grn || [] : activeTab === 'fulfillment' ? data?.invoice || [] : [];

  const activeSubDoc = subTabDocs.find((d: any) => d._id === activeSubTabId) || subTabDocs[0] || null;

  const renderFormFields = () => {
    if (activeTab === 'po') {
      const po = data?.po?.[0];
      if (!po) return [];
      return [
        { label: 'PO Number', value: po.poNumber },
        { label: 'PO Date', value: po.poDate ? new Date(po.poDate).toLocaleDateString() : null },
        { label: 'Vendor Name', value: po.vendorName },
        { label: 'Items Count', value: po.items?.length },
      ];
    }
    if (activeTab === 'delivery' && activeSubDoc) {
      return [
        { label: 'GRN Number', value: activeSubDoc.grnNumber },
        { label: 'PO Number', value: activeSubDoc.poNumber },
        { label: 'GRN Date', value: activeSubDoc.grnDate ? new Date(activeSubDoc.grnDate).toLocaleDateString() : null },
        { label: 'Items Count', value: activeSubDoc.items?.length },
      ];
    }
    if (activeTab === 'fulfillment' && activeSubDoc) {
      return [
        { label: 'Invoice Number', value: activeSubDoc.invoiceNumber },
        { label: 'PO Number', value: activeSubDoc.poNumber },
        { label: 'Invoice Date', value: activeSubDoc.invoiceDate ? new Date(activeSubDoc.invoiceDate).toLocaleDateString() : null },
        { label: 'Items Count', value: activeSubDoc.items?.length },
      ];
    }
    return [];
  };

  const formTitleMap: Record<string, string> = {
    po: 'Purchase Order Details',
    delivery: 'GRN Details',
    fulfillment: 'Invoice Details',
  };

  const documentTypeMap: Record<string, 'po' | 'grn' | 'invoice'> = {
    po: 'po',
    delivery: 'grn',
    fulfillment: 'invoice',
  };

  const activeDocumentId =
    activeTab === 'po' ? data?.po?.[0]?._id : activeSubDoc?._id || null;

  return (
    <AuthGuard>
      <AppShell>
        <div className="border-b border-cream-border bg-cream-card px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={poNumberInput}
              onChange={(e) => setPoNumberInput(e.target.value)}
              placeholder="Enter PO Number"
              className="flex-1 px-3 py-2 text-sm border border-cream-border rounded-md bg-cream focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover"
            >
              Load
            </button>
          </form>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-sm font-medium border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
          >
            + Upload Document
          </button>
        </div>

        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

        {/* Sub-tab pills for multiple GRNs/Invoices */}
        {(activeTab === 'delivery' || activeTab === 'fulfillment') && subTabDocs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 md:px-6 py-2 border-b border-cream-border bg-cream">
            {subTabDocs.map((doc: any) => {
              const label =
                activeTab === 'delivery'
                  ? `GRN: ${doc.grnNumber}`
                  : `Invoice: ${doc.invoiceNumber}`;
              const isActive = (activeSubDoc?._id || subTabDocs[0]?._id) === doc._id;
              return (
                <button
                  key={doc._id}
                  onClick={() => setActiveSubTabId(doc._id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap border transition-colors ${
                    isActive
                      ? 'bg-accent text-white border-accent'
                      : 'border-cream-border text-text-subtle hover:bg-cream-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 p-4 md:p-6">
          {activeTab === 'summary' && <SummaryView poNumber={activePoNumber} />}

          {activeTab !== 'summary' && (
            <>
              {isLoading && <p className="text-text-muted text-sm">Loading...</p>}
              {isError && (
                <p className="text-danger text-sm">
                  Failed to load documents for PO "{activePoNumber}".
                </p>
              )}
              {!isLoading && !isError && counts.po === 0 && activeTab === 'po' && (
                <p className="text-text-muted text-sm">No PO uploaded yet for this PO number.</p>
              )}
              {!isLoading && !isError && (activeTab === 'po' ? counts.po > 0 : subTabDocs.length > 0) && (
                <DocumentDetailView
                  poNumber={activePoNumber}
                  documentType={documentTypeMap[activeTab]}
                  documentId={activeDocumentId}
                  formTitle={formTitleMap[activeTab]}
                  formFields={renderFormFields()}
                />
              )}
              {!isLoading &&
                !isError &&
                activeTab !== 'po' &&
                subTabDocs.length === 0 && (
                  <p className="text-text-muted text-sm">
                    No {activeTab === 'delivery' ? 'GRNs' : 'Invoices'} uploaded yet for this PO number.
                  </p>
                )}
            </>
          )}
        </div>

        {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
      </AppShell>
    </AuthGuard>
  );
}
