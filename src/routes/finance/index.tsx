import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Pill, Section, Stat } from "@/components/kit";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { entityFinance, invoiceOutstanding, isOverdue } from "@/lib/derive";
import { compactMoney, money, shortDate, toSAR } from "@/lib/format";

function FinanceCenter() {
  const { db, scope, inScope, clientName } = useApp();
  const { t } = useLang();
  const entities = scope === "group" ? db.entities : db.entities.filter((e) => e.id === scope);
  const fin = entities.map((e) => entityFinance(e, db.invoices, db.expenses));
  const totals = fin.reduce((a, f) => ({ rev: a.rev + f.revenueSAR, exp: a.exp + f.expensesSAR, ar: a.ar + f.arSAR, ap: a.ap + f.apSAR, cash: a.cash + f.cashSAR }), { rev: 0, exp: 0, ar: 0, ap: 0, cash: 0 });
  const overdue = inScope(db.invoices).filter(isOverdue);
  const pendingCoa = db.coaRequests.filter((r) => r.status === "Pending Review");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Finance Command Center", "مركز القيادة المالي")}
        subtitle={t("Local-currency truth per entity, consolidated to SAR for the group. Nothing is silently converted.", "الحقيقة بالعملة المحلية لكل كيان، وموحّدة بالريال للمجموعة. لا تحويل صامت.")}
        actions={<Button variant="outline" asChild><Link to="/finance/consolidation">{t("Group consolidation", "التوحيد الجماعي")}</Link></Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label={t("Revenue (SAR)", "الإيرادات")} value={compactMoney(totals.rev, "SAR")} tone="brand" />
        <Stat label={t("Expenses (SAR)", "المصروفات")} value={compactMoney(totals.exp, "SAR")} tone="orange" />
        <Stat label={t("Net profit (SAR)", "صافي الربح")} value={compactMoney(totals.rev - totals.exp, "SAR")} tone={totals.rev - totals.exp >= 0 ? "success" : "danger"} />
        <Stat label={t("Accounts receivable", "الذمم المدينة")} value={compactMoney(totals.ar, "SAR")} hint={`${overdue.length} ${t("overdue", "متأخرة")}`} tone="danger" />
        <Stat label={t("Cash collected", "النقد المحصل")} value={compactMoney(totals.cash, "SAR")} tone="success" />
      </div>

      <Panel>
        <Section title={t("Entity performance (SAR)", "أداء الكيانات")} description={t("Revenue, expenses and receivables per operating company.", "الإيرادات والمصروفات والذمم لكل شركة.")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fin.map((f) => ({ name: f.entity.countryName, revenue: Math.round(f.revenueSAR), expenses: Math.round(f.expensesSAR), ar: Math.round(f.arSAR) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v: number) => compactMoney(v, "SAR")} fontSize={11} tickLine={false} axisLine={false} width={78} />
                <Tooltip formatter={(v: number) => money(v, "SAR")} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <RBar dataKey="revenue" name={t("Revenue", "الإيرادات")} fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <RBar dataKey="expenses" name={t("Expenses", "المصروفات")} fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                <RBar dataKey="ar" name={t("Receivables", "الذمم")} fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <Section title={t("Overdue receivables", "ذمم متأخرة")} actions={<Button size="sm" variant="outline" asChild><Link to="/finance/invoices">{t("All invoices", "كل الفواتير")}</Link></Button>}>
            <div className="space-y-2">
              {overdue.map((i) => (
                <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="num text-sm font-medium">{i.number}</p>
                    <p className="text-xs text-muted-foreground">{clientName(i.clientId)} · {t("due", "الاستحقاق")} {shortDate(i.dueDate)}</p>
                  </div>
                  <Pill tone="danger">{money(invoiceOutstanding(i), i.currency)}</Pill>
                </div>
              ))}
              {overdue.length === 0 && <p className="text-sm text-muted-foreground">{t("No overdue invoices.", "لا فواتير متأخرة.")}</p>}
            </div>
          </Section>
        </Panel>
        <Panel>
          <Section title={t("Governance queue", "قائمة الحوكمة")} actions={<Button size="sm" variant="outline" asChild><Link to="/finance/coa">{t("Chart of accounts", "شجرة الحسابات")}</Link></Button>}>
            <div className="space-y-2">
              {pendingCoa.map((r) => (
                <div key={r.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{r.code} — {r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.justification}</p>
                </div>
              ))}
              {pendingCoa.length === 0 && <p className="text-sm text-muted-foreground">{t("No account requests pending.", "لا طلبات حسابات معلقة.")}</p>}
            </div>
          </Section>
        </Panel>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/finance/")({
  head: () => ({
    meta: [
      { title: "Finance Command Center | Trygc CRM HUB" },
      { name: "description", content: "Revenue, expenses, receivables and cash by entity in local currency and consolidated to SAR." },
      { property: "og:title", content: "Finance Command Center | Trygc CRM HUB" },
      { property: "og:description", content: "Multi-entity revenue, expenses, receivables and cash consolidated in SAR." },
    ],
  }),
  component: FinanceCenter,
});
