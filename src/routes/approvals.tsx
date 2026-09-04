import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, Stat, StatusPill } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { ChartRow, BarChartCard, ShareChartCard, countBy, sumBy } from "@/components/charts";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { money, shortDate } from "@/lib/format";
import type { Approval } from "@/lib/types";

function Approvals() {
  const { db, inScope, userName, entityName, actions } = useApp();
  const { t } = useLang();
  const rows = inScope(db.approvals);

  const decide = (id: string, decision: Approval["status"], title: string) => {
    actions.decideApproval(id, decision);
    toast.success(`${decision}`, { description: title });
  };

  const columns: Column<Approval>[] = [
    { key: "type", header: t("Type", "النوع"), render: (r) => r.type, sortValue: (r) => r.type },
    { key: "title", header: t("Request", "الطلب"), render: (r) => <span className="font-medium">{r.title}</span>, sortValue: (r) => r.title },
    { key: "requester", header: t("Requested by", "مقدم الطلب"), render: (r) => userName(r.requesterId), sortValue: (r) => userName(r.requesterId) },
    { key: "approver", header: t("Approver", "المعتمد"), render: (r) => userName(r.approverId), sortValue: (r) => userName(r.approverId) },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "value", header: t("Value", "القيمة"), render: (r) => (r.value && r.currency ? <span className="num">{money(r.value, r.currency)}</span> : "—"), sortValue: (r) => r.value ?? 0 },
    { key: "submitted", header: t("Submitted", "تاريخ التقديم"), render: (r) => shortDate(r.submittedAt), sortValue: (r) => r.submittedAt },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <StatusPill status={r.status} />, sortValue: (r) => r.status },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "Pending" ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => decide(r.id, "Approved", r.title)}>{t("Approve", "اعتماد")}</Button>
            <Button size="sm" variant="outline" onClick={() => decide(r.id, "Returned", r.title)}>{t("Return", "إرجاع")}</Button>
            <Button size="sm" variant="ghost" onClick={() => decide(r.id, "Rejected", r.title)}>{t("Reject", "رفض")}</Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("Decided", "تم البت")}</span>
        ),
    },
  ];

  const count = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Approvals", "الموافقات")}
        subtitle={t("A single inbox for finance, campaign, access and governance decisions. Every decision is written to the audit trail.", "صندوق واحد لقرارات المالية والحملات والوصول والحوكمة. كل قرار يُسجَّل في سجل التدقيق.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Pending", "معلقة")} value={String(count("Pending"))} tone="warning" />
        <Stat label={t("Approved", "معتمدة")} value={String(count("Approved"))} tone="success" />
        <Stat label={t("Returned", "مُرجعة")} value={String(count("Returned"))} />
        <Stat label={t("Rejected", "مرفوضة")} value={String(count("Rejected"))} tone="danger" />
      </div>
      <ChartRow>
        <ShareChartCard title={t("Approvals by status", "الموافقات حسب الحالة")} data={countBy(rows, (r) => r.status)} />
        <BarChartCard title={t("Approvals by type", "الموافقات حسب النوع")} data={countBy(rows, (r) => r.type)} horizontal colorful />
        <BarChartCard title={t("Pending value by entity", "القيمة المعلقة حسب الكيان")} data={sumBy(rows.filter((r) => r.status === "Pending"), (r) => entityName(r.entityId), (r) => r.value ?? 0)} horizontal format={(v) => money(v, "SAR")} />
      </ChartRow>
      <Section title={t("Approval inbox", "صندوق الموافقات")}>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.title} ${r.type}`} exportName="trygc-approvals" pageSize={12} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals | Trygc CRM HUB" },
      { name: "description", content: "Approve, return or reject finance, campaign, access and chart-of-accounts requests from one inbox." },
      { property: "og:title", content: "Approvals | Trygc CRM HUB" },
      { property: "og:description", content: "One approval inbox across finance, campaigns, access and governance." },
    ],
  }),
  component: Approvals,
});
