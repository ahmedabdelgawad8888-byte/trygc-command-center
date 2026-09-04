import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Pill, Section, Stat, StatusPill } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { compactMoney, money, shortDate, toSAR } from "@/lib/format";
import type { Client } from "@/lib/types";
import { BarChartCard, ChartRow, ShareChartCard, TrendChartCard, countBy, sumBy } from "@/components/charts";

function Clients() {
  const { db, inScope, userName, entityName } = useApp();
  const { t } = useLang();
  const navigate = useNavigate();
  const rows = inScope(db.clients);

  const columns: Column<Client>[] = [
    { key: "name", header: t("Client", "العميل"), render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <StatusPill status={r.status} />, sortValue: (r) => r.status },
    { key: "industry", header: t("Industry", "القطاع"), render: (r) => r.industry, sortValue: (r) => r.industry },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "am", header: t("Account manager", "مدير الحساب"), render: (r) => userName(r.accountManagerId), sortValue: (r) => userName(r.accountManagerId) },
    { key: "ltv", header: t("Lifetime revenue", "الإيراد التراكمي"), render: (r) => <span className="num">{money(r.lifetimeRevenue, r.currency)}</span>, sortValue: (r) => toSAR(r.lifetimeRevenue, r.currency) },
    { key: "sat", header: t("Satisfaction", "الرضا"), render: (r) => <Pill tone={r.satisfaction >= 4.3 ? "success" : r.satisfaction >= 3.5 ? "warning" : "danger"}>{r.satisfaction}/5</Pill>, sortValue: (r) => r.satisfaction },
    { key: "since", header: t("Client since", "عميل منذ"), render: (r) => shortDate(r.since), sortValue: (r) => r.since, defaultHidden: true },
    { key: "last", header: t("Last interaction", "آخر تفاعل"), render: (r) => shortDate(r.lastInteraction), sortValue: (r) => r.lastInteraction },
    { key: "next", header: t("Next action", "الإجراء التالي"), render: (r) => r.nextAction },
  ];

  const ltvSAR = rows.reduce((s, c) => s + toSAR(c.lifetimeRevenue, c.currency), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Clients", "العملاء")}
        subtitle={t("Every account with its owner, health and commercial history. Open a client for the full 360 view.", "كل حساب مع مسؤوله وصحته وتاريخه التجاري. افتح العميل لعرض 360 الكامل.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Clients", "العملاء")} value={String(rows.length)} tone="brand" />
        <Stat label={t("Active", "نشط")} value={String(rows.filter((c) => c.status === "Active").length)} tone="success" />
        <Stat label={t("At risk", "في خطر")} value={String(rows.filter((c) => c.status === "At Risk").length)} tone="danger" />
        <Stat label={t("Lifetime revenue (SAR)", "الإيراد التراكمي")} value={compactMoney(ltvSAR, "SAR")} tone="orange" />
      </div>
      <ChartRow>
        <ShareChartCard title={t("Clients by status", "العملاء حسب الحالة")} data={countBy(rows, (r) => r.status)} />
        <BarChartCard title={t("Lifetime revenue by industry (SAR)", "الإيراد التراكمي حسب القطاع")} horizontal data={sumBy(rows, (r) => r.industry, (r) => toSAR(r.lifetimeRevenue, r.currency))} format={(v) => compactMoney(v, "SAR")} />
        <BarChartCard title={t("Clients by entity", "العملاء حسب الكيان")} colorful data={countBy(rows, (r) => entityName(r.entityId))} />
      </ChartRow>
      <Section title={t("Client book", "سجل العملاء")}>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          searchable={(r) => `${r.name} ${r.industry} ${r.status}`}
          onRowClick={(r) => navigate({ to: "/crm/clients/$clientId", params: { clientId: r.id } })}
          exportName="trygc-clients"
          pageSize={12}
        />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/crm/clients/")({
  head: () => ({
    meta: [
      { title: "Clients | Trygc CRM HUB" },
      { name: "description", content: "Trygc client book with account owners, status, satisfaction and lifetime revenue by entity." },
      { property: "og:title", content: "Clients | Trygc CRM HUB" },
      { property: "og:description", content: "Client book with owners, status, satisfaction and lifetime revenue." },
    ],
  }),
  component: Clients,
});
