"use client";

export type TabKey = "po" | "fulfillment" | "delivery" | "summary";

interface TopTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: {
    po: number;
    fulfillment: number;
    delivery: number;
  };
}

const TABS: { key: TabKey; label: string; showCount: boolean }[] = [
  { key: "po", label: "Purchase Order", showCount: true },
  { key: "fulfillment", label: "Fulfillment", showCount: true },
  { key: "delivery", label: "Delivery", showCount: true },
  { key: "summary", label: "Summary", showCount: false },
];

export function TopTabs({ activeTab, onTabChange, counts }: TopTabsProps) {
  const countFor = (key: TabKey): number => {
    if (key === "po") return counts.po;
    if (key === "fulfillment") return counts.fulfillment;
    if (key === "delivery") return counts.delivery;
    return 0;
  };

  return (
    <div className="flex overflow-x-auto border-b border-cream-border bg-cream-card px-4 md:px-6">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? "border-accent text-charcoal-text"
              : "border-transparent text-text-muted hover:text-text-subtle"
          }`}
        >
          {tab.label}
          {tab.showCount && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-accent text-white"
                  : "bg-cream-muted text-text-muted"
              }`}
            >
              {countFor(tab.key)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
