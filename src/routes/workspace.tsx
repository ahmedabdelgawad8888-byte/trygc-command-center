import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Pill, Section, Stat, StatusPill } from "@/components/kit";
import { ChartRow, BarChartCard, DonutChartCard, countBy, sumBy } from "@/components/charts";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { useExceptions } from "@/lib/use-exceptions";
import { ageLabel, money, shortDate } from "@/lib/format";
import { taskIsOverdue } from "@/lib/derive";

function Workspace() {
  const { db, currentUser, entityName, clientName, actions } = useApp();
  const { t } = useLang();
  const exceptions = useExceptions().filter((e) => e.ownerId === currentUser.id);

  const myTasks = db.tasks.filter((x) => x.ownerId === currentUser.id && !["Done", "Cancelled"].includes(x.status));
  const myQueue = db.queueItems.filter((q) => q.ownerId === currentUser.id && q.status !== "Done");
  const myApprovals = db.approvals.filter((a) => a.approverId === currentUser.id && a.status === "Pending");
  const myDeals = db.deals.filter((d) => d.ownerId === currentUser.id && !["Won", "Lost"].includes(d.stage));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(`Good day, ${currentUser.name.split(" ")[0]}`, `أهلاً، ${currentUser.name.split(" ")[0]}`)}
        subtitle={t("Your work only: what is due, what is blocked, and what is waiting on your decision.", "عملك فقط: المستحق، والمتوقف، وما ينتظر قرارك.")}
        meta={[<Pill key="r" tone="brand">{currentUser.role}</Pill>, <Pill key="e">{entityName(currentUser.entityId)}</Pill>]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Open tasks", "المهام المفتوحة")} value={String(myTasks.length)} hint={`${myTasks.filter(taskIsOverdue).length} ${t("overdue", "متأخرة")}`} tone={myTasks.some(taskIsOverdue) ? "danger" : "brand"} />
        <Stat label={t("Queue items", "بنود الطابور")} value={String(myQueue.length)} hint={t("Assigned to you", "مسندة إليك")} tone="orange" />
        <Stat label={t("Awaiting your approval", "بانتظار موافقتك")} value={String(myApprovals.length)} tone="warning" />
        <Stat label={t("Live deals", "صفقات نشطة")} value={String(myDeals.length)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <ChartRow cols={2}>
            <DonutChartCard title={t("My tasks by status", "مهامي حسب الحالة")} data={countBy(myTasks, (x) => x.status)} />
            <BarChartCard title={t("My open deal value by stage", "قيمة صفقاتي حسب المرحلة")} data={sumBy(myDeals, (d) => d.stage, (d) => d.value)} horizontal colorful format={(v) => money(v, "SAR")} />
          </ChartRow>
          <Section title={t("Today's tasks", "مهام اليوم")} actions={<Button size="sm" variant="outline" asChild><Link to="/tasks">{t("All tasks", "كل المهام")}</Link></Button>}>
            <div className="space-y-2">
              {myTasks.slice(0, 8).map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{task.title}</span>
                      <StatusPill status={task.status} />
                      {taskIsOverdue(task) && <Pill tone="danger">{t("Overdue", "متأخرة")}</Pill>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("Due", "الاستحقاق")} {shortDate(task.dueDate)} · {task.deliverable}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { actions.setTaskStatus(task.id, task.status === "In Progress" ? "Done" : "In Progress"); toast.success(t("Task updated", "تم تحديث المهمة"), { description: task.title }); }}>
                    {task.status === "In Progress" ? t("Complete", "إنهاء") : t("Start", "بدء")}
                  </Button>
                </div>
              ))}
              {myTasks.length === 0 && <p className="text-sm text-muted-foreground">{t("No open tasks assigned to you.", "لا توجد مهام مفتوحة مسندة إليك.")}</p>}
            </div>
          </Section>
        </Panel>

        <Panel>
          <Section title={t("Waiting on you", "بانتظارك")} actions={<Button size="sm" variant="outline" asChild><Link to="/approvals">{t("Approval inbox", "صندوق الموافقات")}</Link></Button>}>
            <div className="space-y-2">
              {myApprovals.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} · {a.value && a.currency ? money(a.value, a.currency) : t("No value", "بدون قيمة")} · {ageLabel(a.submittedAt)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => { actions.decideApproval(a.id, "Approved"); toast.success(t("Approved", "تم الاعتماد"), { description: a.title }); }}>{t("Approve", "اعتماد")}</Button>
                </div>
              ))}
              {myApprovals.length === 0 && <p className="text-sm text-muted-foreground">{t("Nothing is waiting on your decision.", "لا شيء ينتظر قرارك.")}</p>}
            </div>
          </Section>
        </Panel>

        <Panel>
          <Section title={t("My operations queue", "طابور عملياتي")} actions={<Button size="sm" variant="outline" asChild><Link to="/operations">{t("Open queues", "فتح الطوابير")}</Link></Button>}>
            <div className="space-y-2">
              {myQueue.slice(0, 8).map((q) => (
                <div key={q.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Pill tone="brand">{q.queue}</Pill>
                    <span className="truncate text-sm font-medium">{q.title}</span>
                    <StatusPill status={q.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t("SLA", "المهلة")} {shortDate(q.slaDeadline)} · {q.nextAction}</p>
                </div>
              ))}
              {myQueue.length === 0 && <p className="text-sm text-muted-foreground">{t("Your queue is clear.", "طابورك فارغ.")}</p>}
            </div>
          </Section>
        </Panel>

        <Panel>
          <Section title={t("My exceptions", "استثناءاتي")} actions={<Button size="sm" variant="outline" asChild><Link to="/alerts">{t("All alerts", "كل التنبيهات")}</Link></Button>}>
            <div className="space-y-2">
              {exceptions.slice(0, 8).map((e) => (
                <div key={e.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Pill tone={e.severity === "Critical" ? "danger" : "warning"}>{e.severity}</Pill>
                    <span className="truncate text-sm font-medium">{e.issue}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.action} · {t("due", "الموعد")} {shortDate(e.deadline)}</p>
                </div>
              ))}
              {exceptions.length === 0 && <p className="text-sm text-muted-foreground">{t("No exceptions assigned to you.", "لا توجد استثناءات مسندة إليك.")}</p>}
            </div>
          </Section>
        </Panel>

        <Panel className="xl:col-span-2">
          <Section title={t("My deals needing action", "صفقاتي التي تحتاج إجراءً")}>
            <div className="grid gap-2 md:grid-cols-2">
              {myDeals.map((d) => (
                <Link key={d.id} to="/crm/deals" className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{d.name}</span>
                    <Pill tone="brand">{d.stage}</Pill>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {clientName(d.clientId)} · <span className="num">{money(d.value, d.currency)}</span> · {t("last activity", "آخر نشاط")} {ageLabel(d.lastActivity)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary">{d.nextAction}</p>
                </Link>
              ))}
            </div>
          </Section>
        </Panel>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "My Workspace | Trygc CRM HUB" },
      { name: "description", content: "Your personal queue: tasks due today, approvals waiting on you, assigned operations items and deals needing action." },
      { property: "og:title", content: "My Workspace | Trygc CRM HUB" },
      { property: "og:description", content: "Personal queue of tasks, approvals, operations items and deals." },
    ],
  }),
  component: Workspace,
});
