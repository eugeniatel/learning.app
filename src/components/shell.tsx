import type { ReactNode } from "react";
import { SideNav } from "./side-nav";
import type { Phase } from "@/lib/types";

export function Shell({ phase, children }: { phase: Phase; children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <SideNav phase={phase} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-10 py-12">{children}</div>
      </main>
    </div>
  );
}
