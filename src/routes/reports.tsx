import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, Pill, Section, Stat } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { campaignStats, entityFinance, invoiceOutstanding } from "@/lib/derive";
import { compactMoney, money, num, pct, toSAR } from "@/lib/format";

const CHART = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Reports() {
  const { db, inScope, userName, clientName } = useApp();
  const { t } = useLang();
  const [tab, setTab] = useState("revenue");

  const entityRows = db.entities.map((e) => entityFinance(e, db.invoices, db.expenses));
  const campaigns = inScope(db.campaigns);
  const deals = inScope(db.deals);
  const clients = inScope(db.clients);

  const byIndustry = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of inScope(db.invoices)) {
      const c = db.clients.find((x) => x.id === inv.clientId);
      const key = c?.industry ?? "Other";
      map.set(key, (map.get(key) ?? 0) + toSAR(inv.amount, inv.currency));
    }
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [db.invoices, db.clients, inScope]);

  const salesRows = useMemo(() => {
    const owners = [...new Set(deals.map((d) => d.ownerId))];
    return owners.map((id) => {
      const own = deals.filter((d) => d.ownerId === id);
      const won = own.filter((d) => d.stage === "Won");
      const lost = own.filter((d) => d.stage === "Lost");
      return {
        id,
        name: userName(id),
        open: own.length - won.length - lost.length,
        won: won.length,
        lost: lost.length,
        winRate: won.length + lost.length ? won.length / (won.length + lost.length) : 0,
        wonSAR: won.reduce((s, d) => s + toSAR(d.value, d.currency), 0),
        pipelineSAR: own.filter((d) => d.stage !== "Won" && d.stage !== "Lost").reduce((s, d) => s + toSAR(d.value, d.currency), 0),
      };
    }).sort((a, b) => b.wonSAR - a.wonSAR);
  }, [deals, userName]);

  const campaignRows = campaigns.map((c) => {
    const stats = campaignStats(c, db.campaignInfluencers.filter((r) => r.campaignId === c.id));
    return { campaign: c, stats };
  });

  const clientRows = clients.map((c) => {
    const invs = db.invoices.filter((i) => i.clientId === c.id);
    return {
      client: c,
      revenueSAR: invs.reduce((s, i) => s + toSAR(i.amount, i.currency), 0),
      outstandingSAR: invs.reduce((s, i) => s + toSAR(invoiceOutstanding(i), i.currency), 0),
      campaigns: db.campaigns.filter((x) => x.clientId === c.id).length,
    };
  }).sort((a, b) => b.revenueSAR - a.revenueSAR);

  type SalesRow = (typeof salesRows)[number];
  type CampRow = (typeof campaignRows)[number];
  type ClientRow = (typeof clientRows)[number];

  const salesCols: Column<SalesRow>[] = [
    { key: "name", header: t("Owner", "المسؤول"), render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "open", header: t("Open deals", "صفقات مفتوحة"), render: (r) => num(r.open), sortValue: (r) => r.open },
    { key: "won", header: t("Won", "مكتسبة"), render: (r) => num(r.won), sortValue: (r) => r.won },
    { key: "lost", header: t("Lost", "خاسرة"), render: (r) => num(r.lost), sortValue: (r) => r.lost },
    { key: "wr", header: t("Win rate", "معدل الفوز"), render: (r) => <Pill tone={r.winRate >= 0.5 ? "success" : r.winRate >= 0.3 ? "warning" : "danger"}>{pct(r.winRate)}</Pill>, sortValue: (r) => r.winRate },
    { key: "pipe", header: t("Open pipeline (SAR)", "خط الأنابيب"), render: (r) => <span className="num">{money(r.pipelineSAR, "SAR")}</span>, sortValue: (r) => r.pipelineSAR },
    { key: "wonv", header: t("Won value (SAR)", "قيمة المكتسب"), render: (r) => <span className="num font-medium">{money(r.wonSAR, "SAR")}</span>, sortValue: (r) => r.wonSAR },
  ];

  const campCols: Column<CampRow>[] = [
    { key: "name", header: t("Campaign", "الحملة"), render: (r) => <div><div className="font-medium">{r.campaign.name}</div><div className="text-xs text-muted-foreground">{clientName(r.campaign.clientId)}</div></div>, sortValue: (r) => r.campaign.name },
    { key: "creators", header: t("Creators", "صناع المحتوى"), render: (r) => num(r.stats.identified), sortValue: (r) => r.stats.identified },
    { key: "target", header: t("Target", "المستهدف"), render: (r) => num(r.stats.target), sortValue: (r) => r.stats.target },
    { key: "verified", header: t("Coverage verified", "تغطية موثقة"), render: (r) => num(r.stats.verified), sortValue: (r) => r.stats.verified },
    { key: "coverage", header: t("Posting Coverage", "تغطية النشر"), render: (r) => { const rate = r.stats.target ? r.stats.verified / r.stats.target : 0; return <Pill tone={rate >= 0.8 ? "success" : rate >= 0.5 ? "warning" : "danger"}>{pct(rate)}</Pill>; }, sortValue: (r) => (r.stats.target ? r.stats.verified / r.stats.target : 0) },
    { key: "gaps", header: t("Coverage gaps", "فجوات التغطية"), render: (r) => <span className={r.stats.missingCoverage ? "font-medium text-danger" : ""}>{num(r.stats.missingCoverage + r.stats.missedVisits)}</span>, sortValue: (r) => r.stats.missingCoverage + r.stats.missedVisits },
    { key: "budget", header: t("Budget", "الميزانية"), render: (r) => <span className="num">{money(r.campaign.budget, r.campaign.currency)}</span>, sortValue: (r) => toSAR(r.campaign.budget, r.campaign.currency) },
  ];

  const clientCols: Column<ClientRow>[] = [
    { key: "name", header: t("Client", "العميل"), render: (r) => <span className="font-medium">{r.client.name}</span>, sortValue: (r) => r.client.name },
    { key: "industry", header: t("Industry", "القطاع"), render: (r) => r.client.industry, sortValue: (r) => r.client.industry },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <Pill tone={r.client.status === "At Risk" ? "danger" : r.client.status === "Active" ? "success" : "neutral"}>{r.client.status}</Pill>, sortValue: (r) => r.client.status },
    { key: "camp", header: t("Campaigns", "الحملات"), render: (r) => num(r.campaigns), sortValue: (r) => r.campaigns },
    { key: "rev", header: t("Billed (SAR)", "المفوتر"), render: (r) => <span className="num font-medium">{money(r.revenueSAR, "SAR")}</span>, sortValue: (r) => r.revenueSAR },
    { key: "out", header: t("Outstanding (SAR)", "المستحق"), render: (r) => <span className={`num ${r.outstandingSAR > 0 ? "text-danger" : ""}`}>{money(r.outstandingSAR, "SAR")}</span>, sortValue: (r) => r.outstandingSAR },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Reports", "التقارير")}
        subtitle={t("Every figure is computed from live records — no static charts. Export any view for board packs.", "كل رقم محسوب من السجلات الحية — لا رسوم ثابتة. صدّر أي عرض لملفات مجلس الإدارة.")}
        actions={<Button variant="outline" onClick={() => toast.success(t("Report scheduled", "تمت جدولة التقرير"), { description: t("Weekly board pack will be emailed every Sunday 08:00 AST.", "سيُرسل ملخص المجلس كل أحد 8:00 صباحاً.") })}>{t("Schedule board pack", "جدولة ملخص المجلس")}</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Group revenue (SAR)", "إيرادات المجموعة")} value={compactMoney(entityRows.reduce((s, e) => s + e.revenueSAR, 0), "SAR")} tone="brand" />
        <Stat label={t("Active campaigns", "حملات نشطة")} value={String(campaigns.filter((c) => c.status === "Active").length)} tone="orange" />
        <Stat label={t("Clients", "العملاء")} value={String(clients.length)} />
        <Stat label={t("Open deals", "صفقات مفتوحة")} value={String(deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length)} tone="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">{t("Revenue", "الإيرادات")}</TabsTrigger>
          <TabsTrigger value="sales">{t("Sales performance", "أداء المبيعات")}</TabsTrigger>
          <TabsTrigger value="campaigns">{t("Campaign delivery", "تنفيذ الحملات")}</TabsTrigger>
          <TabsTrigger value="clients">{t("Client profitability", "ربحية العملاء")}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <Section title={t("Revenue by entity (SAR)", "الإيرادات حسب الكيان")}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={entityRows.map((e) => ({ name: e.entity.countryName, revenue: Math.round(e.revenueSAR), profit: Math.round(e.profitSAR) }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(v: number) => compactMoney(v, "SAR")} fontSize={11} width={72} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number) => money(v, "SAR")} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="revenue" name={t("Revenue", "الإيرادات")} fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="profit" name={t("Profit", "الربح")} fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </Panel>
            <Panel>
              <Section title={t("Revenue by industry (SAR)", "الإيرادات حسب القطاع")}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byIndustry} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {byIndustry.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => money(v, "SAR")} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Section title={t("Sales performance by owner", "أداء المبيعات حسب المسؤول")}>
            <DataTable rows={salesRows} columns={salesCols} rowKey={(r) => r.id} searchable={(r) => r.name} exportName="trygc-sales-performance" pageSize={10} />
          </Section>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <Section title={t("Campaign delivery & Posting Coverage", "تنفيذ الحملات وتغطية النشر")}>
            <DataTable rows={campaignRows} columns={campCols} rowKey={(r) => r.campaign.id} searchable={(r) => r.campaign.name} exportName="trygc-campaign-delivery" pageSize={10} />
          </Section>
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <Section title={t("Client revenue & exposure", "إيرادات العملاء والانكشاف")}>
            <DataTable rows={clientRows} columns={clientCols} rowKey={(r) => r.client.id} searchable={(r) => r.client.name} exportName="trygc-client-report" pageSize={10} />
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Trygc Operations OS" },
      { name: "description", content: "Live revenue, sales performance, campaign delivery and client profitability reporting across Trygc entities." },
      { property: "og:title", content: "Reports | Trygc Operations OS" },
      { property: "og:description", content: "Live cross-entity revenue, sales, delivery and client reporting." },
    ],
  }),
  component: Reports,
});
