"use client";

import { ReactNode } from "react";
import { IconRail } from "./IconRail";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <IconRail />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
