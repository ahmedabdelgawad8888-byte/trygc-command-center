import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, BadgeCheck, Banknote, Megaphone, Target, Users } from "lucide-react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Pill, Section, Stat, HealthPill, Bar } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { SeriesBarChartCard, CHART_AXIS, CHART_GRID, CHART_TOOLTIP, CHART_TOOLTIP_LABEL, CHART_CURSOR } from "@/components/charts";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { useExceptions } from "@/lib/use-exceptions";
import { campaignHealth, campaignStats, entityFinance, invoiceOutstanding, isOverdue } from "@/lib/derive";
import { compactMoney, daysBetween, money, num, shortDate, toSAR } from "@/lib/format";
import { TODAY } from "@/lib/data/seed";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/derive";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(2, 4)}`;

function lastMonths(count: number) {
  const [y, m] = [Number(TODAY.slice(0, 4)), Number(TODAY.slice(5, 7))];
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}` });
  }
  return out;
}

export function ExecDashboard() {
  const { db, inScope, scope, userName, entityName } = useApp();
  const { t } = useLang();
  const exceptions = useExceptions();
  const [branch, setBranch] = useState<string>("all");
  const [collectionMonth, setCollectionMonth] = useState<string | null>(null);

  const branchOf = <T extends { entityId: string }>(rows: T[]) => (branch === "all" ? rows : rows.filter((r) => r.entityId === branch));

  const deals = branchOf(inScope(db.deals));
  const campaigns = branchOf(inScope(db.campaigns));
  const invoices = branchOf(inScope(db.invoices));
  const entities = (scope === "group" ? db.entities : db.entities.filter((e) => e.id === scope)).filter((e) => branch === "all" || e.id === branch);


  const finance = useMemo(() => entities.map((e) => entityFinance(e, db.invoices, db.expenses)), [entities, db.invoices, db.expenses]);
  const totals = finance.reduce(
    (a, f) => ({
      revenue: a.revenue + f.revenueSAR,
      profit: a.profit + f.profitSAR,
      ar: a.ar + f.arSAR,
      cash: a.cash + f.cashSAR,
    }),
    { revenue: 0, profit: 0, ar: 0, cash: 0 },
  );

  const pipelineSAR = deals.filter((d) => !["Won", "Lost"].includes(d.stage)).reduce((s, d) => s + toSAR(d.value, d.currency), 0);
  const wonSAR = deals.filter((d) => d.stage === "Won").reduce((s, d) => s + toSAR(d.value, d.currency), 0);
  const overdueSAR = invoices.filter(isOverdue).reduce((s, i) => s + toSAR(invoiceOutstanding(i), i.currency), 0);
  const pendingApprovals = inScope(db.approvals).filter((a) => a.status === "Pending");

  const campaignRows = campaigns.map((c) => {
    const stats = campaignStats(c, db.campaignInfluencers.filter((r) => r.campaignId === c.id));
    return { campaign: c, stats, health: campaignHealth(c, stats) };
  });

  const stageData = ["New Lead", "Contacted", "Qualified", "Discovery", "Proposal", "Negotiation", "Won"].map((stage) => ({
    stage: stage.replace(" Lead", ""),
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + toSAR(d.value, d.currency), 0),
  }));

  const revenueByEntity = finance.map((f) => ({ name: f.entity.countryName, revenue: Math.round(f.revenueSAR), profit: Math.round(f.profitSAR) }));

  const openInvoices = invoices.filter((i) => invoiceOutstanding(i) > 0 && i.status !== "Cancelled");
  const ageingBuckets = [
    { name: t("Current", "جارية"), min: -9999, max: 0 },
    { name: "1–30", min: 1, max: 30 },
    { name: "31–60", min: 31, max: 60 },
    { name: "61–90", min: 61, max: 90 },
    { name: "90+", min: 91, max: 99999 },
  ].map((b) => ({
    name: b.name,
    value: Math.round(
      openInvoices
        .filter((i) => {
          const d = daysBetween(i.dueDate);
          return d >= b.min && d <= b.max;
        })
        .reduce((s, i) => s + toSAR(invoiceOutstanding(i), i.currency), 0),
    ),
  }));

  const topClients = useMemo(() => {
    const byClient = new Map<string, number>();
    for (const i of invoices) {
      if (["Draft", "Cancelled"].includes(i.status)) continue;
      byClient.set(i.clientId, (byClient.get(i.clientId) ?? 0) + toSAR(i.amount, i.currency));
    }
    return [...byClient.entries()]
      .map(([clientId, value]) => ({ name: db.clients.find((c) => c.id === clientId)?.name ?? clientId, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [invoices, db.clients]);

  const payments = branchOf(inScope(db.payments));
  const months = useMemo(() => lastMonths(6), []);
  const collections = months.map((m) => ({
    name: m.label,
    invoiced: Math.round(
      invoices.filter((i) => i.issueDate.startsWith(m.key) && !["Draft", "Cancelled"].includes(i.status)).reduce((s, i) => s + toSAR(i.amount, i.currency), 0),
    ),
    collected: Math.round(payments.filter((p) => p.date.startsWith(m.key)).reduce((s, p) => s + toSAR(p.amount, p.currency), 0)),
  }));
  const selectedMonthKey = months.find((m) => m.label === collectionMonth)?.key ?? null;
  const collectionRows = useMemo(() => {
    const inMonth = (iso: string) => (selectedMonthKey ? iso.startsWith(selectedMonthKey) : true);
    const invRows = invoices
      .filter((i) => !["Draft", "Cancelled"].includes(i.status) && inMonth(i.issueDate))
      .map((i) => ({
        id: `inv-${i.id}`,
        kind: t("Invoice", "فاتورة") as string,
        ref: i.number,
        client: db.clients.find((c) => c.id === i.clientId)?.name ?? i.clientId,
        entityId: i.entityId,
        date: i.issueDate,
        amountSAR: Math.round(toSAR(i.amount, i.currency)),
        status: i.status as string,
        link: `/finance/invoices`,
      }));
    const payRows = payments.filter((p) => inMonth(p.date)).map((p) => {
      const inv = db.invoices.find((i) => i.id === p.invoiceId);
      return {
        id: `pay-${p.id}`,
        kind: t("Payment", "تحصيل") as string,
        ref: p.reference,
        client: db.clients.find((c) => c.id === inv?.clientId)?.name ?? "—",
        entityId: p.entityId,
        date: p.date,
        amountSAR: Math.round(toSAR(p.amount, p.currency)),
        status: p.method as string,
        link: `/finance/payments`,
      };
    });
    return [...invRows, ...payRows].sort((a, b) => b.date.localeCompare(a.date));
  }, [invoices, payments, selectedMonthKey, db.clients, db.invoices, t]);

  const monthKeyNow = TODAY.slice(0, 7);
  const cashThisMonth = payments.filter((p) => p.date.startsWith(monthKeyNow)).reduce((s, p) => s + toSAR(p.amount, p.currency), 0);
  const slaBreaches = campaigns.filter((c) => {
    const stats = campaignStats(c, db.campaignInfluencers.filter((r) => r.campaignId === c.id));
    return campaignHealth(c, stats).health !== "green";
  }).length;

  const branchPerformance = useMemo(
    () =>
      (scope === "group" ? db.entities : db.entities.filter((e) => e.id === scope)).map((e) => {
        const f = entityFinance(e, db.invoices, db.expenses);
        return {
          id: e.id,
          name: e.countryName,
          receivables: Math.round(f.arSAR),
          collections: Math.round(db.payments.filter((p) => p.entityId === e.id).reduce((s, p) => s + toSAR(p.amount, p.currency), 0)),
          profit: Math.round(f.profitSAR),
        };
      }),
    [db.entities, db.invoices, db.expenses, db.payments, scope],
  );

  const timeline = useMemo(() => {
    const wanted = ["Approval", "Invoice", "Campaign", "Payment", "Export"];
    return inScope(db.activities)
      .filter((a) => branch === "all" || a.entityId === branch)
      .filter((a) => wanted.some((w) => a.module.includes(w) || a.action.includes(w)))
      .slice(0, 8);
  }, [db.activities, inScope, branch]);


  const coverage = db.campaignInfluencers.filter((r) => campaigns.some((c) => c.id === r.campaignId));
  const coverageBreakdown = [
    { name: t("Verified", "موثّق"), value: coverage.filter((r) => ["Posting Coverage Verified", "Completed"].includes(r.stage)).length, fill: "var(--color-chart-2)" },
    { name: t("Received", "مستلم"), value: coverage.filter((r) => r.stage === "Posting Coverage Received").length, fill: "var(--color-chart-1)" },
    { name: t("Scheduled", "مجدول"), value: coverage.filter((r) => ["Scheduled", "Visited", "Approved", "Confirmed"].includes(r.stage)).length, fill: "var(--color-chart-3)" },
    { name: t("Missing", "ناقص"), value: coverage.filter((r) => ["Missing Posting Coverage", "Missed Visit", "Replacement Required"].includes(r.stage)).length, fill: "var(--color-chart-5)" },
  ].filter((d) => d.value > 0);

  const excColumns: Column<Exception>[] = [
    { key: "issue", header: t("Issue", "المشكلة"), render: (r) => <span className="font-medium">{r.issue}</span>, sortValue: (r) => r.issue },
    { key: "category", header: t("Category", "التصنيف"), render: (r) => <Pill tone="brand">{r.category}</Pill>, sortValue: (r) => r.category },
    { key: "owner", header: t("Owner", "المسؤول"), render: (r) => userName(r.ownerId), sortValue: (r) => userName(r.ownerId) },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "age", header: t("Age", "العمر"), render: (r) => r.age, sortValue: (r) => parseInt(r.age) || 0 },
    { key: "impact", header: t("Impact", "الأثر"), render: (r) => <span className="text-muted-foreground">{r.impact}</span>, defaultHidden: true },
    { key: "action", header: t("Required action", "الإجراء المطلوب"), render: (r) => r.action },
    { key: "deadline", header: t("Deadline", "الموعد"), render: (r) => shortDate(r.deadline), sortValue: (r) => r.deadline },
    {
      key: "severity",
      header: t("Severity", "الخطورة"),
      render: (r) => <Pill tone={r.severity === "Critical" ? "danger" : r.severity === "High" ? "warning" : "neutral"}>{r.severity}</Pill>,
      sortValue: (r) => ({ Critical: 0, High: 1, Medium: 2 })[r.severity],
    },
    {
      key: "open",
      header: "",
      render: (r) => (
        <Link to={r.link as never} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          {t("Open", "فتح")} <ArrowUpRight className="size-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Executive Command Center", "مركز القيادة التنفيذي")}
        subtitle={t(
          "Group-wide performance across Saudi Arabia, Egypt and the GCC. Money is shown in local currency and consolidated to SAR.",
          "الأداء على مستوى المجموعة في السعودية ومصر والخليج. تُعرض المبالغ بالعملة المحلية وتُوحَّد بالريال السعودي.",
        )}
        meta={[
          <Pill key="scope" tone="brand">
            {scope === "group" ? t("Group scope · SAR consolidated", "نطاق المجموعة · موحّد بالريال") : entityName(scope)}
          </Pill>,
          <Pill key="ent" tone="neutral">
            {entities.length} {t("entities", "كيانات")}
          </Pill>,
          <Pill key="exc" tone={exceptions.length ? "danger" : "success"}>
            {exceptions.length} {t("open exceptions", "استثناءات مفتوحة")}
          </Pill>,
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/alerts">{t("Alerts", "التنبيهات")}</Link>
            </Button>
            <Button asChild>
              <Link to="/approvals">
                {t("Approvals", "الموافقات")} ({pendingApprovals.length})
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t("Branch filter", "تصفية الفرع")}</span>
        {[{ id: "all", label: t("All branches", "كل الفروع") }, ...(scope === "group" ? db.entities : db.entities.filter((e) => e.id === scope)).map((e) => ({ id: e.id, label: e.countryName }))].map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBranch(b.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              branch === b.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div title={t("Outstanding balance on invoices past their due date.", "الأرصدة القائمة على الفواتير المتأخرة.")}>
          <Stat
            label={t("Overdue receivables (SAR)", "الذمم المتأخرة")}
            value={compactMoney(overdueSAR, "SAR")}
            hint={`${invoices.filter(isOverdue).length} ${t("invoices past due", "فاتورة متأخرة")}`}
            tone={overdueSAR > 0 ? "danger" : "success"}
          />
        </div>
        <div title={t("Payments received since the start of this month.", "المدفوعات المستلمة منذ بداية الشهر.")}>
          <Stat label={t("Cash collected this month (SAR)", "المحصّل هذا الشهر")} value={compactMoney(cashThisMonth, "SAR")} hint={t("Bank, cheque, cash and card", "تحويل وشيك ونقد وبطاقة")} tone="success" />
        </div>
        <div title={t("Campaigns that are behind on delivery or coverage.", "الحملات المتأخرة في التنفيذ أو التغطية.")}>
          <Stat
            label={t("Campaign SLA status", "حالة اتفاقية الخدمة")}
            value={`${campaigns.length - slaBreaches}/${campaigns.length}`}
            hint={`${slaBreaches} ${t("breaching SLA", "خارج الاتفاقية")}`}
            tone={slaBreaches === 0 ? "success" : slaBreaches > 2 ? "danger" : "warning"}
          />
        </div>
        <div title={t("Requests waiting for a decision from an approver.", "طلبات بانتظار قرار المعتمد.")}>
          <Stat label={t("Open approvals", "الموافقات المفتوحة")} value={num(pendingApprovals.length)} hint={t("Waiting on a decision", "بانتظار القرار")} tone={pendingApprovals.length > 4 ? "warning" : "default"} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Revenue (SAR)", "الإيرادات")} value={compactMoney(totals.revenue, "SAR")} hint={t("Issued invoices, consolidated", "الفواتير الصادرة، موحّدة")} tone="brand" icon={<Banknote className="size-4" />} />
        <Stat label={t("Net profit (SAR)", "صافي الربح")} value={compactMoney(totals.profit, "SAR")} hint={`${Math.round((totals.profit / Math.max(1, totals.revenue)) * 100)}% ${t("margin", "هامش")}`} tone={totals.profit > 0 ? "success" : "danger"} />
        <Stat label={t("Open pipeline (SAR)", "خط الفرص")} value={compactMoney(pipelineSAR, "SAR")} hint={`${deals.filter((d) => !["Won", "Lost"].includes(d.stage)).length} ${t("live deals", "صفقة نشطة")}`} tone="orange" icon={<Target className="size-4" />} />
        <Stat label={t("Cash position (SAR)", "الوضع النقدي")} value={compactMoney(totals.cash, "SAR")} hint={t("Collected against issued invoices", "المحصّل مقابل الفواتير الصادرة")} icon={<AlertTriangle className="size-4" />} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Won this cycle (SAR)", "الصفقات المكسوبة")} value={compactMoney(wonSAR, "SAR")} hint={`${deals.filter((d) => d.stage === "Won").length} ${t("closed won", "مغلقة بالفوز")}`} icon={<BadgeCheck className="size-4" />} />
        <Stat label={t("Active campaigns", "الحملات النشطة")} value={num(campaigns.filter((c) => ["Active", "Delivery", "Closing"].includes(c.status)).length)} hint={`${campaignRows.filter((r) => r.health.health !== "green").length} ${t("need attention", "تحتاج متابعة")}`} icon={<Megaphone className="size-4" />} />
        <Stat label={t("Creators engaged", "صناع المحتوى")} value={num(coverage.length)} hint={`${coverage.filter((r) => r.stage === "Missing Posting Coverage").length} ${t("missing posting coverage", "بدون تغطية نشر")}`} icon={<Users className="size-4" />} />
        <Stat label={t("Open exceptions", "الاستثناءات المفتوحة")} value={num(exceptions.length)} hint={t("Need a decision today", "تحتاج قراراً اليوم")} tone={exceptions.length ? "warning" : "success"} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <Section title={t("Revenue and profit by entity (SAR)", "الإيرادات والأرباح حسب الكيان")} description={t("Consolidated at the locked FX rate for the period.", "موحّدة بسعر الصرف المثبت للفترة.")}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEntity} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid {...CHART_GRID} vertical={false} />
                  <XAxis dataKey="name" {...CHART_AXIS} />
                  <YAxis tickFormatter={(v: number) => compactMoney(v, "SAR")} {...CHART_AXIS} width={78} />
                  <Tooltip formatter={(v: number) => money(v, "SAR")} contentStyle={CHART_TOOLTIP} labelStyle={CHART_TOOLTIP_LABEL} />
                  <RBar dataKey="revenue" name={t("Revenue", "الإيرادات")} fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <RBar dataKey="profit" name={t("Profit", "الربح")} fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </Panel>

        <Panel>
          <Section title={t("Posting Coverage status", "حالة تغطية النشر")} description={t("Every creator deliverable in scope.", "كل مخرجات صناع المحتوى ضمن النطاق.")}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={coverageBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {coverageBreakdown.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={CHART_TOOLTIP_LABEL} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {coverageBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full" style={{ background: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="num ms-auto font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </Section>
        </Panel>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
        <Panel>
          <Section title={t("Pipeline value by stage (SAR)", "قيمة خط الفرص حسب المرحلة")} description={t("Open deal value in each stage of the funnel.", "قيمة الصفقات المفتوحة في كل مرحلة.")}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }} barCategoryGap={10}>
                  <CartesianGrid {...CHART_GRID} horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => compactMoney(v, "SAR")} {...CHART_AXIS} />
                  <YAxis type="category" dataKey="stage" {...CHART_AXIS} width={92} />
                  <Tooltip cursor={CHART_CURSOR} formatter={(v: number) => money(v, "SAR")} contentStyle={CHART_TOOLTIP} labelStyle={CHART_TOOLTIP_LABEL} />
                  <RBar dataKey="value" name={t("Pipeline value", "قيمة الفرص")} fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <Section title={t("Receivables ageing (SAR)", "أعمار الذمم المدينة")} description={t("Outstanding balance by days past due.", "الأرصدة القائمة حسب أيام التأخير.")}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageingBuckets} margin={{ left: 4, right: 8, top: 8 }}>
                    <CartesianGrid {...CHART_GRID} vertical={false} />
                    <XAxis dataKey="name" {...CHART_AXIS} />
                    <YAxis tickFormatter={(v: number) => compactMoney(v, "SAR")} {...CHART_AXIS} width={70} />
                    <Tooltip cursor={CHART_CURSOR} formatter={(v: number) => money(v, "SAR")} contentStyle={CHART_TOOLTIP} labelStyle={CHART_TOOLTIP_LABEL} />
                    <RBar dataKey="value" name={t("Outstanding", "المستحق")} fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </Panel>

          <Panel>
            <Section title={t("Top clients by billed value (SAR)", "أعلى العملاء بقيمة الفوترة")} description={t("Issued invoices consolidated to SAR.", "الفواتير الصادرة موحّدة بالريال.")}>
              <div className="space-y-2.5">
                {topClients.map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="num text-muted-foreground">{compactMoney(c.value, "SAR")}</span>
                    </div>
                    <Bar value={c.value} max={topClients[0]?.value ?? 1} tone="brand" />
                  </div>
                ))}
              </div>
            </Section>
          </Panel>
        </div>
        </div>



        <Panel>
          <Section title={t("Campaign health", "صحة الحملات")} description={t("Delivery against target creators.", "التنفيذ مقابل العدد المستهدف.")}>
            <div className="space-y-3">
              {campaignRows.slice(0, 6).map(({ campaign, stats, health }) => (
                <Link key={campaign.id} to="/campaigns/$campaignId" params={{ campaignId: campaign.id }} className="block rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{campaign.name}</span>
                    <HealthPill health={health.health} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{health.rootCause}</p>
                  <div className="mt-2">
                    <Bar value={stats.completed} max={campaign.targetInfluencers} tone={health.health === "green" ? "success" : health.health === "amber" ? "orange" : "danger"} />
                    <div className="num mt-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        {stats.completed}/{campaign.targetInfluencers} {t("completed", "مكتمل")}
                      </span>
                      <span>
                        {stats.missingCoverage} {t("missing coverage", "تغطية ناقصة")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        </Panel>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <SeriesBarChartCard
          title={t("Collections performance (SAR)", "أداء التحصيل")}
          description={t("Invoiced versus collected by month. Select a month to filter the records below.", "المفوتر مقابل المحصّل شهرياً. اختر شهراً لتصفية السجلات أدناه.")}
          data={collections}
          series={[
            { key: "invoiced", label: t("Invoiced", "المفوتر"), color: "var(--color-chart-3)" },
            { key: "collected", label: t("Collected", "المحصّل"), color: "var(--color-chart-1)" },
          ]}
          format={(v) => compactMoney(v, "SAR")}
          active={collectionMonth}
          onSelect={(name) => setCollectionMonth(collectionMonth === name ? null : name || null)}
        />
        <SeriesBarChartCard
          title={t("Branch performance (SAR)", "أداء الفروع")}
          description={t("Receivables, collections and profitability per branch. Select a branch to filter the whole page.", "الذمم والتحصيل والربحية لكل فرع. اختر فرعاً لتصفية الصفحة.")}
          data={branchPerformance.map((b) => ({ name: b.name, receivables: b.receivables, collections: b.collections, profit: b.profit }))}
          series={[
            { key: "receivables", label: t("Receivables", "الذمم"), color: "var(--color-chart-3)" },
            { key: "collections", label: t("Collections", "التحصيل"), color: "var(--color-chart-1)" },
            { key: "profit", label: t("Profit", "الربح"), color: "var(--color-chart-4)" },
          ]}
          format={(v) => compactMoney(v, "SAR")}
          active={branchPerformance.find((b) => b.id === branch)?.name ?? null}
          onSelect={(name) => {
            const hit = branchPerformance.find((b) => b.name === name);
            setBranch(hit && hit.id !== branch ? hit.id : "all");
          }}
        />
      </div>

      <Section
        title={t("Invoices and payments behind collections", "الفواتير والمدفوعات خلف التحصيل")}
        description={
          collectionMonth
            ? `${t("Filtered to", "مصفّى على")} ${collectionMonth}`
            : t("All months in the current view. Exports use your shared export settings.", "كل الأشهر في العرض الحالي. التصدير يستخدم إعدادات التصدير المشتركة.")
        }
        actions={
          collectionMonth ? (
            <Button variant="outline" size="sm" onClick={() => setCollectionMonth(null)}>
              {t("Clear month filter", "مسح تصفية الشهر")}
            </Button>
          ) : null
        }
      >
        <DataTable
          rows={collectionRows}
          columns={[
            { key: "kind", header: t("Type", "النوع"), render: (r) => <Pill tone={r.kind === t("Payment", "تحصيل") ? "success" : "neutral"}>{r.kind}</Pill>, sortValue: (r) => r.kind },
            { key: "ref", header: t("Reference", "المرجع"), render: (r) => <span className="font-medium">{r.ref}</span>, sortValue: (r) => r.ref },
            { key: "client", header: t("Client", "العميل"), render: (r) => r.client, sortValue: (r) => r.client },
            { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
            { key: "date", header: t("Date", "التاريخ"), render: (r) => shortDate(r.date), sortValue: (r) => r.date },
            { key: "amount", header: t("Amount (SAR)", "المبلغ"), render: (r) => <span className="num">{money(r.amountSAR, "SAR")}</span>, sortValue: (r) => r.amountSAR },
            { key: "status", header: t("Status", "الحالة"), render: (r) => r.status, sortValue: (r) => r.status },
            {
              key: "open",
              header: "",
              render: (r) => (
                <Link to={r.link as never} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  {t("Open", "فتح")} <ArrowUpRight className="size-3" />
                </Link>
              ),
            },
          ]}
          rowKey={(r) => r.id}
          searchable={(r) => `${r.kind} ${r.ref} ${r.client} ${r.status}`}
          exportName="trygc-collections"
          pageSize={8}
        />
      </Section>

      <Section
        title={t("Recent activity", "النشاط الأخير")}
        description={t("Approvals, invoice status changes, campaign milestones and exports.", "الموافقات وتغيّر حالة الفواتير ومعالم الحملات والتصدير.")}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/activity">{t("Full activity log", "سجل النشاط الكامل")}</Link>
          </Button>
        }
      >
        <Panel>
          <ol className="relative space-y-4 ps-5">
            <span className="absolute inset-y-1 start-1 w-px bg-border" aria-hidden />
            {timeline.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -start-4 top-1.5 size-2 rounded-full bg-primary" aria-hidden />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{a.action}</span>
                  <Pill tone="neutral">{a.module}</Pill>
                  <span className="text-xs text-muted-foreground">
                    {userName(a.actorId)} · {shortDate(a.at.slice(0, 10))} · {entityName(a.entityId)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.recordLabel}
                  {a.from || a.to ? ` · ${a.from ?? "—"} → ${a.to ?? "—"}` : ""}
                </p>
              </li>
            ))}
            {timeline.length === 0 ? <li className="text-xs text-muted-foreground">{t("No recent activity in this view.", "لا يوجد نشاط حديث في هذا العرض.")}</li> : null}
          </ol>
        </Panel>
      </Section>


      <Section
        title={t("Exceptions requiring a decision", "استثناءات تتطلب قراراً")}
        description={t("Every row states the owner, the impact and the exact next action.", "كل صف يوضح المسؤول والأثر والإجراء التالي.")}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/alerts">{t("Full exception queue", "قائمة الاستثناءات الكاملة")}</Link>
          </Button>
        }
      >
        <DataTable
          rows={exceptions.slice(0, 10)}
          columns={excColumns}
          rowKey={(r) => r.id}
          searchable={(r) => `${r.issue} ${r.category} ${r.action}`}
          exportName="trygc-exceptions"
          pageSize={10}
        />
      </Section>
    </div>
  );
}
