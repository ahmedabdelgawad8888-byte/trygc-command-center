import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, BadgeCheck, Banknote, Megaphone, Target, Users } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { useExceptions } from "@/lib/use-exceptions";
import { campaignHealth, campaignStats, entityFinance, invoiceOutstanding, isOverdue } from "@/lib/derive";
import { compactMoney, money, num, shortDate, toSAR } from "@/lib/format";
import type { Exception } from "@/lib/derive";

export function ExecDashboard() {
  const { db, inScope, scope, userName, entityName } = useApp();
  const { t } = useLang();
  const exceptions = useExceptions();

  const deals = inScope(db.deals);
  const campaigns = inScope(db.campaigns);
  const invoices = inScope(db.invoices);
  const entities = scope === "group" ? db.entities : db.entities.filter((e) => e.id === scope);

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Revenue (SAR)", "الإيرادات")} value={compactMoney(totals.revenue, "SAR")} hint={t("Issued invoices, consolidated", "الفواتير الصادرة، موحّدة")} tone="brand" icon={<Banknote className="size-4" />} />
        <Stat label={t("Net profit (SAR)", "صافي الربح")} value={compactMoney(totals.profit, "SAR")} hint={`${Math.round((totals.profit / Math.max(1, totals.revenue)) * 100)}% ${t("margin", "هامش")}`} tone={totals.profit > 0 ? "success" : "danger"} />
        <Stat label={t("Open pipeline (SAR)", "خط الفرص")} value={compactMoney(pipelineSAR, "SAR")} hint={`${deals.filter((d) => !["Won", "Lost"].includes(d.stage)).length} ${t("live deals", "صفقة نشطة")}`} tone="orange" icon={<Target className="size-4" />} />
        <Stat label={t("Overdue AR (SAR)", "الذمم المتأخرة")} value={compactMoney(overdueSAR, "SAR")} hint={`${invoices.filter(isOverdue).length} ${t("invoices past due", "فاتورة متأخرة")}`} tone="danger" icon={<AlertTriangle className="size-4" />} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Won this cycle (SAR)", "الصفقات المكسوبة")} value={compactMoney(wonSAR, "SAR")} hint={`${deals.filter((d) => d.stage === "Won").length} ${t("closed won", "مغلقة بالفوز")}`} icon={<BadgeCheck className="size-4" />} />
        <Stat label={t("Active campaigns", "الحملات النشطة")} value={num(campaigns.filter((c) => ["Active", "Delivery", "Closing"].includes(c.status)).length)} hint={`${campaignRows.filter((r) => r.health.health !== "green").length} ${t("need attention", "تحتاج متابعة")}`} icon={<Megaphone className="size-4" />} />
        <Stat label={t("Creators engaged", "صناع المحتوى")} value={num(coverage.length)} hint={`${coverage.filter((r) => r.stage === "Missing Posting Coverage").length} ${t("missing posting coverage", "بدون تغطية نشر")}`} icon={<Users className="size-4" />} />
        <Stat label={t("Pending approvals", "الموافقات المعلقة")} value={num(pendingApprovals.length)} hint={t("Waiting on a decision", "بانتظار القرار")} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <Section title={t("Revenue and profit by entity (SAR)", "الإيرادات والأرباح حسب الكيان")} description={t("Consolidated at the locked FX rate for the period.", "موحّدة بسعر الصرف المثبت للفترة.")}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEntity} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickFormatter={(v: number) => compactMoney(v, "SAR")} tickLine={false} axisLine={false} fontSize={11} width={78} />
                  <Tooltip formatter={(v: number) => money(v, "SAR")} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
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
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
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
        <Panel className="xl:col-span-2">
          <Section title={t("Pipeline value by stage (SAR)", "قيمة خط الفرص حسب المرحلة")} description={t("Open deal value in each stage of the funnel.", "قيمة الصفقات المفتوحة في كل مرحلة.")}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }} barCategoryGap={10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                  <XAxis type="number" tickFormatter={(v: number) => compactMoney(v, "SAR")} tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} fontSize={11} width={92} />
                  <Tooltip cursor={{ fill: "var(--color-muted)" }} formatter={(v: number) => money(v, "SAR")} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <RBar dataKey="value" name={t("Pipeline value", "قيمة الفرص")} fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </Panel>


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
