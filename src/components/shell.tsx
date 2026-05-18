import type { ReactNode } from "react";
import { SideNav } from "./side-nav";
import type { Phase } from "@/lib/types";

export function Shell({
  phase,
  children,
  wide = false,
}: {
  phase: Phase;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <SideNav phase={phase} />
      <main className="flex-1 overflow-y-auto">
        <div className={["mx-auto px-10 py-12", wide ? "max-w-6xl" : "max-w-3xl"].join(" ")}>
          {children}
        </div>
      </main>
    </div>
  );
}
