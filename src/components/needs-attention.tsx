"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionOverride, getSubjectQuestions } from "@/lib/local-store";
import type { Question, SessionStatus } from "@/lib/types";

type AttentionItem = {
  subjectId: string;
  subjectTitle: string;
  weekId: string | null;
  weekNumber: number | null;
  sessions: { id: string; estimatedMinutes: number; status: SessionStatus }[];
  questionSeed: Question[];
};

type Alert = { key: string; text: string; href: string };

function computeAlerts(items: AttentionItem[], live: boolean): Alert[] {
  const alerts: Alert[] = [];
  for (const item of items) {
    const sessions = item.sessions.map((session) =>
      live ? { ...session, ...getSessionOverride(session.id) } : session
    );
    if (item.weekId && item.weekNumber != null) {
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.estimatedMinutes ?? 0), 0);
      if (totalMinutes > 300) {
        alerts.push({
          key: `${item.subjectId}-heavy`,
          text: `Week ${item.weekNumber} in ${item.subjectTitle} looks heavy at about ${Math.round(totalMinutes / 60)} hours`,
          href: `/weeks/${item.weekId}`,
        });
      }
      const undone = sessions.filter((session) => session.status !== "done").length;
      if (undone >= 3) {
        alerts.push({
          key: `${item.subjectId}-undone`,
          text: `Week ${item.weekNumber} in ${item.subjectTitle} has ${undone} sessions left`,
          href: `/weeks/${item.weekId}`,
        });
      }
    }
    const questions = live ? getSubjectQuestions(item.subjectId, item.questionSeed) : item.questionSeed;
    const openQuestions = questions.filter((question) => question.status === "open").length;
    if (openQuestions >= 3) {
      alerts.push({
        key: `${item.subjectId}-questions`,
        text: `${openQuestions} open questions in ${item.subjectTitle}`,
        href: "/questions",
      });
    }
  }
  return alerts;
}

export function NeedsAttention({ items }: { items: AttentionItem[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(() => computeAlerts(items, false));

  useEffect(() => {
    queueMicrotask(() => setAlerts(computeAlerts(items, true)));
  }, [items]);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8 flex flex-col gap-2">
      <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Needs attention
      </p>
      {alerts.map((alert) => (
        <Link
          key={alert.key}
          href={alert.href}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-[14px] text-foreground transition-colors duration-[180ms] ease-out hover:bg-muted/40"
        >
          {alert.text}
        </Link>
      ))}
    </div>
  );
}
