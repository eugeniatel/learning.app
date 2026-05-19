import Link from "next/link";
import { BookOpen, GitBranch, Inbox, Layers, HelpCircle, Rewind, Home, NotebookPen, Search, Wand2 } from "lucide-react";
import { PhaseIndicator } from "./phase-indicator";
import type { Phase } from "@/lib/types";

const items = [
  { href: "/", label: "This week", icon: Home },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/weeks", label: "All weeks", icon: Layers },
  { href: "/concepts", label: "Concepts", icon: Layers },
  { href: "/search", label: "Search", icon: Search },
  { href: "/questions", label: "Open questions", icon: HelpCircle },
  { href: "/backlog", label: "Backlog", icon: Inbox },
  { href: "/reflections", label: "Reflections", icon: NotebookPen },
  { href: "/review", label: "Review", icon: Rewind },
  { href: "/rebalance", label: "Rebalance", icon: Wand2 },
  { href: "/flexible-map", label: "Flexible map", icon: GitBranch },
];

export function SideNav({ phase }: { phase: Phase }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r bg-sidebar px-4 py-6">
      <div className="px-2">
        <h1 className="text-[15px] font-medium text-sidebar-foreground">Curriculum</h1>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Parallel deep study</p>
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-2.5 py-2.5 text-[13.5px] text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <PhaseIndicator phase={phase} />
      </div>
    </aside>
  );
}
