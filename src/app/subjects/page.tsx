import Link from "next/link";
import { Shell } from "@/components/shell";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { SubjectEnableToggle } from "@/components/subject-enable-toggle";
import { SubjectsTabs } from "@/components/subjects-tabs";
import { FlexibleMap } from "@/components/flexible-map";
import { getModules, getProgress, getSubjects } from "@/lib/data";
import { getFlexibleMapData } from "@/lib/flexible-map";

export default async function SubjectsPage() {
  const [subjects, progress, modules, mapData] = await Promise.all([
    getSubjects(),
    getProgress(),
    getModules(),
    getFlexibleMapData(),
  ]);
  const enabledSubjects = subjects.filter((subject) => progress.subjects[subject.id]?.enabled !== false);

  const subjectsView = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => {
        const count = modules.filter((module) => module.subjectId === subject.id).length;
        const isActive = subject.id === progress.currentSubjectId;
        const isEnabled = progress.subjects[subject.id]?.enabled !== false;
        return (
          <section
            key={subject.id}
            className={[
              "rounded-lg border bg-card px-4 py-4",
              isActive ? "border-[var(--ring)]" : "border-border",
            ].join(" ")}
          >
            <p className="text-[12px] text-muted-foreground">{subject.cadence}</p>
            <h2 className="mt-1 text-[15px] font-medium text-foreground">{subject.title}</h2>
            <p className="mt-3 text-[13px] text-muted-foreground">{subject.description}</p>
            <p className="mt-4 text-[12px] text-muted-foreground">
              {count} modules{isActive ? ", current" : ""}
            </p>
            <SubjectEnableToggle subjectId={subject.id} initialEnabled={isEnabled} />
          </section>
        );
      })}
    </div>
  );

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Study areas</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Subjects</h1>
        <div className="mt-4">
          <SubjectSwitcher subjects={enabledSubjects} currentSubjectId={progress.currentSubjectId} />
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href="/setup-subject"
            className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-[13px] hover:bg-muted"
          >
            Add subject
          </Link>
          <Link
            href="/import"
            className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-[13px] hover:bg-muted"
          >
            Import markdown
          </Link>
        </div>
      </div>
      <SubjectsTabs
        subjectsView={subjectsView}
        mapView={
          <FlexibleMap
            phase={progress.phase}
            main={mapData.main}
            interpretability={mapData.interpretability}
            branches={mapData.branches}
            readyBranches={mapData.readyBranches}
          />
        }
      />
    </Shell>
  );
}
