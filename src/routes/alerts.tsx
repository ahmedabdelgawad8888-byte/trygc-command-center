import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Pill, Section, Stat } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { useExceptions } from "@/lib/use-exceptions";
import { shortDate } from "@/lib/format";
import type { Exception } from "@/lib/derive";

function Alerts() {
  const { userName, entityName } = useApp();
  const { t } = useLang();
  const rows = useExceptions();

  const columns: Column<Exception>[] = [
    { key: "severity", header: t("Severity", "الخطورة"), render: (r) => <Pill tone={r.severity === "Critical" ? "danger" : r.severity === "High" ? "warning" : "neutral"}>{r.severity}</Pill>, sortValue: (r) => ({ Critical: 0, High: 1, Medium: 2 })[r.severity] },
    { key: "category", header: t("Category", "التصنيف"), render: (r) => r.category, sortValue: (r) => r.category },
    { key: "issue", header: t("Issue", "المشكلة"), render: (r) => <span className="font-medium">{r.issue}</span>, sortValue: (r) => r.issue },
    { key: "owner", header: t("Owner", "المسؤول"), render: (r) => userName(r.ownerId), sortValue: (r) => userName(r.ownerId) },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "age", header: t("Age", "العمر"), render: (r) => r.age, sortValue: (r) => parseInt(r.age) || 0 },
    { key: "impact", header: t("Business impact", "الأثر"), render: (r) => <span className="text-muted-foreground">{r.impact}</span> },
    { key: "action", header: t("Required action", "الإجراء المطلوب"), render: (r) => r.action },
    { key: "deadline", header: t("Deadline", "الموعد"), render: (r) => shortDate(r.deadline), sortValue: (r) => r.deadline },
    { key: "link", header: "", render: (r) => <Link to={r.link as never} className="text-xs font-medium text-primary">{t("Open", "فتح")}</Link> },
  ];

  const bySeverity = (s: string) => rows.filter((r) => r.severity === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Alerts & Exceptions", "التنبيهات والاستثناءات")}
        subtitle={t("Everything blocking delivery, cash or governance right now — with an owner and a required action on every line.", "كل ما يعيق التنفيذ أو التحصيل أو الحوكمة الآن — مع مسؤول وإجراء مطلوب لكل بند.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Total exceptions", "إجمالي الاستثناءات")} value={String(rows.length)} tone="brand" />
        <Stat label={t("Critical", "حرجة")} value={String(bySeverity("Critical"))} tone="danger" />
        <Stat label={t("High", "عالية")} value={String(bySeverity("High"))} tone="warning" />
        <Stat label={t("Medium", "متوسطة")} value={String(bySeverity("Medium"))} />
      </div>
      <Section title={t("Exception queue", "قائمة الاستثناءات")}>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.issue} ${r.category} ${r.action}`} exportName="trygc-exceptions" pageSize={15} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts & Exceptions | Trygc Operations OS" },
      { name: "description", content: "Stuck deals, missing posting coverage, missed visits, overdue invoices and pending governance items in one queue." },
      { property: "og:title", content: "Alerts & Exceptions | Trygc Operations OS" },
      { property: "og:description", content: "Every blocked item with an owner, impact and required action." },
    ],
  }),
  component: Alerts,
});
