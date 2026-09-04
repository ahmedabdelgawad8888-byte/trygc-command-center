import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill, Section, Stat } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { compactMoney, money, shortDate, toSAR } from "@/lib/format";
import type { Payment } from "@/lib/types";
import { BarChartCard, ChartRow, DonutChartCard, TrendChartCard, countBy, sumBy } from "@/components/charts";

function Payments() {
  const { db, inScope, entityName, clientName } = useApp();
  const { t } = useLang();
  const rows = inScope(db.payments);
  const invoice = (id: string) => db.invoices.find((i) => i.id === id);

  const columns: Column<Payment>[] = [
    { key: "date", header: t("Date", "التاريخ"), render: (r) => shortDate(r.date), sortValue: (r) => r.date },
    { key: "invoice", header: t("Invoice", "الفاتورة"), render: (r) => <span className="num font-medium">{invoice(r.invoiceId)?.number ?? "—"}</span>, sortValue: (r) => invoice(r.invoiceId)?.number ?? "" },
    { key: "client", header: t("Client", "العميل"), render: (r) => { const inv = invoice(r.invoiceId); return inv ? clientName(inv.clientId) : "—"; } },
    { key: "amount", header: t("Amount", "المبلغ"), render: (r) => <span className="num">{money(r.amount, r.currency)}</span>, sortValue: (r) => toSAR(r.amount, r.currency) },
    { key: "sar", header: t("Amount (SAR)", "المبلغ بالريال"), render: (r) => <span className="num">{money(toSAR(r.amount, r.currency), "SAR")}</span> },
    { key: "method", header: t("Method", "الطريقة"), render: (r) => <Pill tone="brand">{r.method}</Pill>, sortValue: (r) => r.method },
    { key: "ref", header: t("Reference", "المرجع"), render: (r) => <span className="num text-xs">{r.reference}</span> },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
  ];

  const totalSAR = rows.reduce((s, p) => s + toSAR(p.amount, p.currency), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Payments", "المدفوعات")}
        subtitle={t("Cash received against invoices. Recording a payment updates the invoice balance and status immediately.", "النقد المحصل مقابل الفواتير. تسجيل الدفعة يحدّث رصيد الفاتورة وحالتها فوراً.")}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("Payments recorded", "دفعات مسجلة")} value={String(rows.length)} tone="brand" />
        <Stat label={t("Cash collected (SAR)", "النقد المحصل")} value={compactMoney(totalSAR, "SAR")} tone="success" />
        <Stat label={t("Bank transfers", "تحويلات بنكية")} value={String(rows.filter((r) => r.method === "Bank Transfer").length)} />
      </div>
      <ChartRow>
        <DonutChartCard title={t("Collections by method", "التحصيل حسب الوسيلة")} data={sumBy(rows, (r) => r.method, (r) => toSAR(r.amount, r.currency))} format={(v) => compactMoney(v, "SAR")} />
        <BarChartCard title={t("Collections by entity (SAR)", "التحصيل حسب الكيان")} data={sumBy(rows, (r) => entityName(r.entityId), (r) => toSAR(r.amount, r.currency))} format={(v) => compactMoney(v, "SAR")} />
        <TrendChartCard title={t("Cash received over time (SAR)", "النقد المحصل عبر الزمن")} data={sumBy([...rows].sort((a, b) => a.date.localeCompare(b.date)), (r) => shortDate(r.date), (r) => toSAR(r.amount, r.currency))} format={(v) => compactMoney(v, "SAR")} />
      </ChartRow>
      <Section title={t("Payment register", "سجل المدفوعات")}>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.reference} ${invoice(r.invoiceId)?.number ?? ""}`} exportName="trygc-payments" pageSize={12} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/finance/payments")({
  head: () => ({
    meta: [
      { title: "Payments | Trygc CRM HUB" },
      { name: "description", content: "Payment register showing cash received against invoices in local currency and SAR." },
      { property: "og:title", content: "Payments | Trygc CRM HUB" },
      { property: "og:description", content: "Cash received against invoices, by entity and method." },
    ],
  }),
  component: Payments,
});
