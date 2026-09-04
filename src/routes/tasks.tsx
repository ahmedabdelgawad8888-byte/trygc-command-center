import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, PageHeader, Pill, Section, Stat, StatusPill } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { taskIsOverdue } from "@/lib/derive";
import { shortDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/lib/types";
import { BarChartCard, ChartRow, ShareChartCard, TrendChartCard, countBy, sumBy } from "@/components/charts";

const COLUMNS: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Blocked", "Pending Approval", "Done"];

function Tasks() {
  const { db, inScope, userName, entityName, clientName, actions } = useApp();
  const { t } = useLang();
  const rows = inScope(db.tasks);

  const cols: Column<Task>[] = [
    { key: "title", header: t("Task", "المهمة"), render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.clientId ? clientName(r.clientId) : r.department}</div></div>, sortValue: (r) => r.title },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <StatusPill status={r.status} />, sortValue: (r) => COLUMNS.indexOf(r.status) },
    { key: "owner", header: t("Owner", "المسؤول"), render: (r) => userName(r.ownerId), sortValue: (r) => userName(r.ownerId) },
    { key: "dept", header: t("Department", "القسم"), render: (r) => r.department, sortValue: (r) => r.department },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "priority", header: t("Priority", "الأولوية"), render: (r) => <Pill tone={r.priority === "Critical" ? "danger" : r.priority === "High" ? "warning" : "neutral"}>{r.priority}</Pill>, sortValue: (r) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[r.priority] },
    { key: "due", header: t("Due", "الاستحقاق"), render: (r) => <span className={taskIsOverdue(r) ? "font-medium text-danger" : ""}>{shortDate(r.dueDate)}</span>, sortValue: (r) => r.dueDate },
    { key: "progress", header: t("Progress", "التقدم"), render: (r) => <div className="w-32"><Bar value={r.percent} max={100} tone={r.rag === "green" ? "success" : r.rag === "amber" ? "orange" : "danger"} /><span className="num text-[11px] text-muted-foreground">{r.percent}%</span></div>, sortValue: (r) => r.percent },
    { key: "deliverable", header: t("Deliverable", "المخرج"), render: (r) => r.deliverable, defaultHidden: true },
    { key: "act", header: "", render: (r) => <Button size="sm" variant="outline" onClick={() => { actions.setTaskStatus(r.id, r.status === "Done" ? "In Progress" : "Done"); toast.success(t("Task updated", "تم تحديث المهمة"), { description: r.title }); }}>{r.status === "Done" ? t("Reopen", "إعادة فتح") : t("Complete", "إنهاء")}</Button> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Tasks & PMO", "المهام وإدارة المشاريع")}
        subtitle={t("Departmental delivery with owners, deliverables, SLAs and RAG status. Nothing tracked in private lists.", "تنفيذ الأقسام مع المسؤولين والمخرجات والمهل وحالة RAG. لا شيء يُتابع في قوائم خاصة.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Open tasks", "مهام مفتوحة")} value={String(rows.filter((r) => !["Done", "Cancelled"].includes(r.status)).length)} tone="brand" />
        <Stat label={t("Overdue", "متأخرة")} value={String(rows.filter(taskIsOverdue).length)} tone="danger" />
        <Stat label={t("Blocked", "متوقفة")} value={String(rows.filter((r) => r.status === "Blocked").length)} tone="warning" />
        <Stat label={t("Completed", "مكتملة")} value={String(rows.filter((r) => r.status === "Done").length)} tone="success" />
      </div>
      <ChartRow>
        <ShareChartCard title={t("Tasks by status", "المهام حسب الحالة")} data={countBy(rows, (r) => r.status)} />
        <BarChartCard title={t("Tasks by department", "حسب القسم")} horizontal data={countBy(rows, (r) => r.department)} />
        <BarChartCard title={t("Tasks by priority", "حسب الأولوية")} colorful data={countBy(rows, (r) => r.priority)} />
      </ChartRow>
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">{t("Kanban", "لوحة كانبان")}</TabsTrigger>
          <TabsTrigger value="table">{t("Table", "جدول")}</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {COLUMNS.map((status) => (
              <div key={status} className="min-w-[220px] rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide">{status}</span>
                  <span className="num text-xs text-muted-foreground">{rows.filter((r) => r.status === status).length}</span>
                </div>
                <div className="space-y-2">
                  {rows.filter((r) => r.status === status).map((r) => (
                    <div key={r.id} className="rounded-lg border bg-background p-3">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{userName(r.ownerId)} · {shortDate(r.dueDate)}</p>
                      <div className="mt-2"><Bar value={r.percent} max={100} tone={r.rag === "green" ? "success" : r.rag === "amber" ? "orange" : "danger"} /></div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {COLUMNS.filter((s) => s !== status).slice(0, 3).map((s) => (
                          <Button key={s} size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => { actions.setTaskStatus(r.id, s); toast.success(t("Moved", "تم النقل"), { description: `${r.title} → ${s}` }); }}>{s}</Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <Section><DataTable rows={rows} columns={cols} rowKey={(r) => r.id} searchable={(r) => `${r.title} ${r.department} ${r.deliverable}`} exportName="trygc-tasks" pageSize={12} /></Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & PMO | Trygc CRM HUB" },
      { name: "description", content: "Kanban and table views of departmental tasks with owners, deliverables, SLA dates and RAG progress." },
      { property: "og:title", content: "Tasks & PMO | Trygc CRM HUB" },
      { property: "og:description", content: "Departmental task delivery with owners, deliverables and RAG progress." },
    ],
  }),
  component: Tasks,
});
