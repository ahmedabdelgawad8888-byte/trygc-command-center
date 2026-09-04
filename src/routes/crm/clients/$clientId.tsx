import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Field, PageHeader, Panel, Pill, Section, Stat, StatusPill } from "@/components/kit";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { campaignHealth, campaignStats, invoiceOutstanding, isOverdue } from "@/lib/derive";
import { money, shortDate, toSAR } from "@/lib/format";

function Client360() {
  const { clientId } = useParams({ from: "/crm/clients/$clientId" });
  const { db, userName, entityName } = useApp();
  const { t } = useLang();
  const client = db.clients.find((c) => c.id === clientId);

  if (!client) {
    return <EmptyState title={t("Client not found", "العميل غير موجود")} description={t("This record may have been merged or removed.", "ربما تم دمج هذا السجل أو حذفه.")} />;
  }

  const deals = db.deals.filter((d) => d.clientId === client.id);
  const campaigns = db.campaigns.filter((c) => c.clientId === client.id);
  const invoices = db.invoices.filter((i) => i.clientId === client.id);
  const contacts = db.contacts.filter((c) => c.clientId === client.id);
  const tasks = db.tasks.filter((x) => x.clientId === client.id);
  const files = db.files.filter((f) => f.clientId === client.id);
  const activity = db.activities.filter((a) => a.recordId === client.id || campaigns.some((c) => c.id === a.recordId) || deals.some((d) => d.id === a.recordId));
  const ar = invoices.reduce((s, i) => s + invoiceOutstanding(i), 0);
  const overdue = invoices.filter(isOverdue);

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        subtitle={`${client.industry} · ${entityName(client.entityId)} · ${t("client since", "عميل منذ")} ${shortDate(client.since)}`}
        meta={[
          <StatusPill key="s" status={client.status} />,
          <Pill key="am" tone="brand">{t("AM", "مدير الحساب")}: {userName(client.accountManagerId)}</Pill>,
          <Pill key="esc" tone="orange">{t("Escalation", "التصعيد")}: {userName(client.escalationOwnerId)}</Pill>,
          <Pill key="sat" tone={client.satisfaction >= 4 ? "success" : "warning"}>{t("Satisfaction", "الرضا")} {client.satisfaction}/5</Pill>,
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Lifetime revenue", "الإيراد التراكمي")} value={money(client.lifetimeRevenue, client.currency)} hint={`${money(toSAR(client.lifetimeRevenue, client.currency), "SAR")} ${t("group", "مجموعة")}`} tone="brand" />
        <Stat label={t("Outstanding AR", "الذمم المستحقة")} value={money(ar, client.currency)} hint={`${overdue.length} ${t("overdue invoices", "فاتورة متأخرة")}`} tone={overdue.length ? "danger" : "default"} />
        <Stat label={t("Campaigns", "الحملات")} value={String(campaigns.length)} hint={`${campaigns.filter((c) => ["Active", "Delivery"].includes(c.status)).length} ${t("in delivery", "قيد التنفيذ")}`} tone="orange" />
        <Stat label={t("Open deals", "صفقات مفتوحة")} value={String(deals.filter((d) => !["Won", "Lost"].includes(d.stage)).length)} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t("Overview", "نظرة عامة")}</TabsTrigger>
          <TabsTrigger value="contacts">{t("Contacts", "جهات الاتصال")}</TabsTrigger>
          <TabsTrigger value="deals">{t("Deals", "الصفقات")}</TabsTrigger>
          <TabsTrigger value="campaigns">{t("Campaigns", "الحملات")}</TabsTrigger>
          <TabsTrigger value="finance">{t("Finance", "المالية")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("Tasks", "المهام")}</TabsTrigger>
          <TabsTrigger value="files">{t("Files", "الملفات")}</TabsTrigger>
          <TabsTrigger value="activity">{t("Activity", "النشاط")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 xl:grid-cols-2">
          <Panel>
            <Section title={t("Account summary", "ملخص الحساب")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("Status", "الحالة")} value={<StatusPill status={client.status} />} />
                <Field label={t("Entity", "الكيان")} value={entityName(client.entityId)} />
                <Field label={t("Billing currency", "عملة الفوترة")} value={client.currency} />
                <Field label={t("Last interaction", "آخر تفاعل")} value={shortDate(client.lastInteraction)} />
                <Field label={t("Next action", "الإجراء التالي")} value={client.nextAction} />
                <Field label={t("Account manager", "مدير الحساب")} value={userName(client.accountManagerId)} />
              </div>
            </Section>
          </Panel>
          <Panel>
            <Section title={t("Delivery health", "صحة التنفيذ")}>
              <div className="space-y-2">
                {campaigns.map((c) => {
                  const stats = campaignStats(c, db.campaignInfluencers.filter((r) => r.campaignId === c.id));
                  const health = campaignHealth(c, stats);
                  return (
                    <Link key={c.id} to="/campaigns/$campaignId" params={{ campaignId: c.id }} className="block rounded-lg border p-3 hover:bg-muted/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <Pill tone={health.health === "green" ? "success" : health.health === "amber" ? "warning" : "danger"}>{health.health}</Pill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{health.rootCause} · {stats.completed}/{c.targetInfluencers} {t("completed", "مكتمل")}</p>
                    </Link>
                  );
                })}
                {campaigns.length === 0 && <p className="text-sm text-muted-foreground">{t("No campaigns yet for this client.", "لا توجد حملات لهذا العميل بعد.")}</p>}
              </div>
            </Section>
          </Panel>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Panel>
            <div className="grid gap-3 md:grid-cols-2">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.primary && <Pill tone="brand">{t("Primary", "رئيسي")}</Pill>}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                  <p className="num mt-1 text-xs">{c.email} · {c.phone}</p>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-sm text-muted-foreground">{t("No contacts recorded.", "لا توجد جهات اتصال.")}</p>}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <Panel>
            <div className="space-y-2">
              {deals.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{userName(d.ownerId)} · {t("close", "الإغلاق")} {shortDate(d.expectedClose)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-sm font-semibold">{money(d.value, d.currency)}</span>
                    <Pill tone={d.stage === "Won" ? "success" : d.stage === "Lost" ? "danger" : "brand"}>{d.stage}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <Panel>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <Link key={c.id} to="/campaigns/$campaignId" params={{ campaignId: c.id }} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.city} · {shortDate(c.startDate)} → {shortDate(c.endDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-sm font-semibold">{money(c.budget, c.currency)}</span>
                    <StatusPill status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <Panel>
            <div className="space-y-2">
              {invoices.map((i) => (
                <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="num text-sm font-medium">{i.number}</p>
                    <p className="text-xs text-muted-foreground">{t("Issued", "صدرت")} {shortDate(i.issueDate)} · {t("due", "الاستحقاق")} {shortDate(i.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-sm">{money(invoiceOutstanding(i), i.currency)} {t("outstanding", "مستحق")}</span>
                    <StatusPill status={isOverdue(i) ? "Overdue" : i.status} />
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-sm text-muted-foreground">{t("No invoices raised yet.", "لم تصدر فواتير بعد.")}</p>}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Panel>
            <div className="space-y-2">
              {tasks.map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs text-muted-foreground">{userName(x.ownerId)} · {t("due", "الاستحقاق")} {shortDate(x.dueDate)}</p>
                  </div>
                  <StatusPill status={x.status} />
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground">{t("No tasks linked to this client.", "لا مهام مرتبطة بهذا العميل.")}</p>}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Panel>
            <div className="grid gap-2 md:grid-cols-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.size} · {shortDate(f.updatedAt)}</span>
                </div>
              ))}
              {files.length === 0 && <p className="text-sm text-muted-foreground">{t("No documents stored for this client.", "لا توجد مستندات لهذا العميل.")}</p>}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Panel>
            <ol className="relative space-y-4 ps-5">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -start-5 top-1.5 size-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium">{a.action} — {a.recordLabel}</p>
                  <p className="text-xs text-muted-foreground">{a.at} · {userName(a.actorId)} · {a.module}{a.from || a.to ? ` · ${a.from ?? "—"} → ${a.to ?? "—"}` : ""}</p>
                </li>
              ))}
              {activity.length === 0 && <p className="text-sm text-muted-foreground">{t("No activity recorded yet.", "لا يوجد نشاط مسجل.")}</p>}
            </ol>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/crm/clients/$clientId")({
  head: () => ({
    meta: [
      { title: "Client 360 | Trygc CRM HUB" },
      { name: "description", content: "One client, one screen: contacts, deals, campaigns, invoices, tasks, documents and the full activity trail." },
      { property: "og:title", content: "Client 360 | Trygc CRM HUB" },
      { property: "og:description", content: "Contacts, deals, campaigns, invoices, tasks, files and activity for a single client." },
    ],
  }),
  component: Client360,
});
