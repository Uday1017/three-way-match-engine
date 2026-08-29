'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from './AuthGuard';
import { AppShell } from '@/components/AppShell';
import { TopTabs, TabKey } from '@/components/TopTabs';
import { SummaryView } from '@/components/summary/SummaryView';
import { UploadModal } from '@/components/upload/UploadModal';
import { documentsApi } from '@/lib/api';

export default function Home() {
  const [poNumberInput, setPoNumberInput] = useState('CI4PO05788');
  const [activePoNumber, setActivePoNumber] = useState('CI4PO05788');
  const [activeTab, setActiveTab] = useState<TabKey>('po');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents', activePoNumber],
    queryFn: () => documentsApi.list({ poNumber: activePoNumber }),
    enabled: !!activePoNumber,
  });

  const counts = {
    po: data?.po?.length || 0,
    fulfillment: data?.invoice?.length || 0,
    delivery: data?.grn?.length || 0,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePoNumber(poNumberInput.trim());
  };

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

        <div className="flex-1 p-4 md:p-6">
          {activeTab === 'summary' && <SummaryView poNumber={activePoNumber} />}

          {activeTab !== 'summary' && (
            <>
              {isLoading && <p className="text-text-muted text-sm">Loading...</p>}
              {isError && (
                <p className="text-danger text-sm">
                  Failed to load documents for PO "{activePoNumber}". Has it been uploaded yet?
                </p>
              )}
              {!isLoading && !isError && (
                <div className="text-sm text-text-subtle">
                  <p className="mb-2">
                    Active tab: <span className="font-medium">{activeTab}</span>
                  </p>
                  <p>PO: {counts.po} | Invoices: {counts.fulfillment} | GRNs: {counts.delivery}</p>
                </div>
              )}
            </>
          )}
        </div>

        {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
      </AppShell>
    </AuthGuard>
  );
}
