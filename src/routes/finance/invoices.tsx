import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, Stat, StatusPill } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { invoiceOutstanding, isOverdue } from "@/lib/derive";
import { compactMoney, money, shortDate, toSAR } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BarChartCard, ChartRow, DonutChartCard, TrendChartCard, countBy, sumBy } from "@/components/charts";

function Invoices() {
  const { db, inScope, clientName, entityName, campaignName, actions } = useApp();
  const { t } = useLang();
  const rows = inScope(db.invoices);

  const columns: Column<Invoice>[] = [
    { key: "number", header: t("Invoice", "الفاتورة"), render: (r) => <div><div className="num font-medium">{r.number}</div><div className="text-xs text-muted-foreground">{clientName(r.clientId)}</div></div>, sortValue: (r) => r.number },
    { key: "campaign", header: t("Campaign", "الحملة"), render: (r) => (r.campaignId ? campaignName(r.campaignId) : "—"), defaultHidden: true },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "issue", header: t("Issued", "الإصدار"), render: (r) => shortDate(r.issueDate), sortValue: (r) => r.issueDate },
    { key: "due", header: t("Due", "الاستحقاق"), render: (r) => <span className={isOverdue(r) ? "font-medium text-danger" : ""}>{shortDate(r.dueDate)}</span>, sortValue: (r) => r.dueDate },
    { key: "amount", header: t("Amount", "المبلغ"), render: (r) => <span className="num">{money(r.amount, r.currency)}</span>, sortValue: (r) => toSAR(r.amount, r.currency) },
    { key: "paid", header: t("Paid", "المدفوع"), render: (r) => <span className="num">{money(r.paid, r.currency)}</span>, sortValue: (r) => r.paid },
    { key: "out", header: t("Outstanding", "المستحق"), render: (r) => <span className="num font-medium">{money(invoiceOutstanding(r), r.currency)}</span>, sortValue: (r) => toSAR(invoiceOutstanding(r), r.currency) },
    { key: "sar", header: t("Outstanding (SAR)", "المستحق بالريال"), render: (r) => <span className="num">{money(toSAR(invoiceOutstanding(r), r.currency), "SAR")}</span>, defaultHidden: true },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <StatusPill status={isOverdue(r) ? "Overdue" : r.status} />, sortValue: (r) => r.status },
    { key: "act", header: "", render: (r) => (r.status === "Draft" ? <Button size="sm" onClick={() => { actions.setInvoiceStatus(r.id, "Issued"); toast.success(t("Invoice issued", "تم إصدار الفاتورة"), { description: r.number }); }}>{t("Issue", "إصدار")}</Button> : <span className="text-xs text-muted-foreground">—</span>) },
  ];

  const arSAR = rows.reduce((s, i) => s + toSAR(invoiceOutstanding(i), i.currency), 0);
  const overdueSAR = rows.filter(isOverdue).reduce((s, i) => s + toSAR(invoiceOutstanding(i), i.currency), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Invoices & Receivables", "الفواتير والذمم")}
        subtitle={t("Issued in the entity's own currency, aged and consolidated to SAR for the group view.", "تصدر بعملة الكيان وتُقادم وتُوحّد بالريال لعرض المجموعة.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Invoices", "الفواتير")} value={String(rows.length)} tone="brand" />
        <Stat label={t("Outstanding (SAR)", "المستحق")} value={compactMoney(arSAR, "SAR")} tone="orange" />
        <Stat label={t("Overdue (SAR)", "المتأخر")} value={compactMoney(overdueSAR, "SAR")} tone="danger" />
        <Stat label={t("Fully paid", "مدفوعة بالكامل")} value={String(rows.filter((r) => invoiceOutstanding(r) === 0 && r.status !== "Draft").length)} tone="success" />
      </div>
      <ChartRow>
        <DonutChartCard title={t("Invoices by status", "الفواتير حسب الحالة")} data={countBy(rows, (r) => r.status)} />
        <BarChartCard title={t("Billed by client (SAR)", "المفوتر حسب العميل")} horizontal data={sumBy(rows, (r) => clientName(r.clientId), (r) => toSAR(r.amount, r.currency))} format={(v) => compactMoney(v, "SAR")} />
        <BarChartCard title={t("Outstanding by entity (SAR)", "المستحق حسب الكيان")} data={sumBy(rows, (r) => entityName(r.entityId), (r) => toSAR(invoiceOutstanding(r), r.currency))} format={(v) => compactMoney(v, "SAR")} />
      </ChartRow>
      <Section title={t("Receivables ledger", "سجل الذمم")}>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.number} ${clientName(r.clientId)}`} exportName="trygc-invoices" pageSize={12} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/finance/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices & Receivables | Trygc CRM HUB" },
      { name: "description", content: "Multi-entity invoice ledger with ageing, outstanding balances in local currency and SAR, and overdue flags." },
      { property: "og:title", content: "Invoices & Receivables | Trygc CRM HUB" },
      { property: "og:description", content: "Invoice ledger with ageing and outstanding balances by entity." },
    ],
  }),
  component: Invoices,
});
