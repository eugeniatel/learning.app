import type { Module, Phase } from "@/lib/types";

type NodeState = "current" | "complete" | "ready" | "locked";

type MapNode = {
  module: Module;
  state: NodeState;
};

function NodePill({ node }: { node: MapNode }) {
  const { module, state } = node;
  const stateClass: Record<NodeState, string> = {
    current: "border-[var(--ring)] bg-accent text-accent-foreground",
    complete: "border-foreground/20 bg-muted text-foreground",
    ready: "border-border bg-card text-foreground",
    locked: "border-border bg-background text-muted-foreground",
  };

  return (
    <div className={["rounded-lg border px-3 py-2", stateClass[state]].join(" ")}>
      <p className="text-[12px] text-muted-foreground">
        {module.track === "interpretability" ? "Interp" : module.track === "branch" ? "Branch" : "Module"} {module.number}
      </p>
      <p className="mt-0.5 text-[13px] font-medium leading-snug">{module.title}</p>
    </div>
  );
}

function Rail({ title, nodes }: { title: string; nodes: MapNode[] }) {
  return (
    <section>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
        {nodes.map((node) => (
          <NodePill key={node.module.id} node={node} />
        ))}
      </div>
    </section>
  );
}

export function FlexibleMap({
  phase,
  main,
  interpretability,
  branches,
  readyBranches,
}: {
  phase: Phase;
  main: MapNode[];
  interpretability: MapNode[];
  branches: MapNode[];
  readyBranches: Module[];
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">
          {phase === "flexible" ? "Flexible phase is active." : "Flexible phase is available when you switch from This week."}
        </p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Flexible map</h1>
      </div>

      <div className="flex flex-col gap-8">
        <Rail title="Main spine" nodes={main} />
        <Rail title="Interpretability" nodes={interpretability} />

        <section>
          <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            Branches
          </p>
          <div className="grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4">
            {branches.map((node) => (
              <NodePill key={node.module.id} node={node} />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            Ready to pull
          </p>
          {readyBranches.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {readyBranches.map((branch) => (
                <div key={branch.id} className="rounded-lg border border-border bg-card px-4 py-3">
                  <p className="text-[13px] font-medium text-foreground">{branch.title}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Attached to {branch.branchOf}. {branch.hoursMin} to {branch.hoursMax} hours.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-muted-foreground">
              No branches are ready yet. Complete their prerequisites first.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
