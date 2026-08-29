import Link from "next/link";

export function IconRail() {
  return (
    <div className="hidden md:flex w-16 bg-charcoal flex-col items-center py-5 gap-4 min-h-screen shrink-0">
      <Link
        href="/"
        className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white font-semibold text-xs"
      >
        3W
      </Link>
      <Link
        href="/sku-master"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-medium"
        title="SKU Master"
      >
        SKU
      </Link>
      <div className="flex-1" />
    </div>
  );
}
