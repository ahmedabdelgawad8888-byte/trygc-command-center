import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill, Section } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import type { ActivityEvent } from "@/lib/types";

function ActivityFeed() {
  const { db, inScope, userName, entityName } = useApp();
  const { t } = useLang();
  const rows = inScope(db.activities);

  const columns: Column<ActivityEvent>[] = [
    { key: "at", header: t("When", "الوقت"), render: (r) => <span className="num text-xs">{r.at}</span>, sortValue: (r) => r.at },
    { key: "actor", header: t("Actor", "المستخدم"), render: (r) => userName(r.actorId), sortValue: (r) => userName(r.actorId) },
    { key: "module", header: t("Module", "الوحدة"), render: (r) => <Pill tone="brand">{r.module}</Pill>, sortValue: (r) => r.module },
    { key: "action", header: t("Action", "الإجراء"), render: (r) => <span className="font-medium">{r.action}</span>, sortValue: (r) => r.action },
    { key: "record", header: t("Record", "السجل"), render: (r) => r.recordLabel, sortValue: (r) => r.recordLabel },
    { key: "change", header: t("Change", "التغيير"), render: (r) => (r.from || r.to ? <span className="text-xs text-muted-foreground">{r.from ?? "—"} → {r.to ?? "—"}</span> : "—") },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Activity Feed", "سجل النشاط")}
        subtitle={t("Immutable history of every state change made in the system, with actor, timestamp and before/after values.", "سجل غير قابل للتعديل لكل تغيير في النظام، مع المستخدم والوقت والقيم قبل وبعد.")}
      />
      <Section title={t("All events", "كل الأحداث")}>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.action} ${r.recordLabel} ${r.module}`} exportName="trygc-activity" pageSize={20} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Feed | Trygc Operations OS" },
      { name: "description", content: "Immutable audit history of every change across CRM, campaigns, operations and finance." },
      { property: "og:title", content: "Activity Feed | Trygc Operations OS" },
      { property: "og:description", content: "Who changed what, when, and from which value to which value." },
    ],
  }),
  component: ActivityFeed,
});
