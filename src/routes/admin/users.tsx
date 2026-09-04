import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, Section, Stat } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { shortDate } from "@/lib/format";
import type { User } from "@/lib/types";

function Users() {
  const { db, entityName, can, actions } = useApp();
  const { t } = useLang();
  const isAdmin = can("admin");

  const columns: Column<User>[] = [
    { key: "name", header: t("User", "المستخدم"), render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div>, sortValue: (r) => r.name },
    { key: "role", header: t("Role", "الدور"), render: (r) => <Pill tone="brand">{r.role}</Pill>, sortValue: (r) => r.role },
    { key: "dept", header: t("Department", "القسم"), render: (r) => r.department, sortValue: (r) => r.department },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "scope", header: t("Data scope", "نطاق البيانات"), render: (r) => <Pill tone={r.scope === "group" ? "orange" : "neutral"}>{r.scope === "group" ? t("Group-wide", "كل المجموعة") : t("Own entity", "كيانه فقط")}</Pill>, sortValue: (r) => r.scope },
    { key: "status", header: t("Status", "الحالة"), render: (r) => <Pill tone={r.status === "active" ? "success" : r.status === "suspended" ? "danger" : "warning"}>{r.status}</Pill>, sortValue: (r) => r.status },
    { key: "login", header: t("Last login", "آخر دخول"), render: (r) => shortDate(r.lastLogin), sortValue: (r) => r.lastLogin },
    {
      key: "act",
      header: "",
      render: (r) =>
        isAdmin ? (
          <Button size="sm" variant="outline" onClick={() => { const next = r.status === "active" ? "suspended" : "active"; actions.setUserStatus(r.id, next); toast.success(next === "active" ? t("Access restored", "تمت استعادة الوصول") : t("Access suspended", "تم تعليق الوصول"), { description: r.name }); }}>
            {r.status === "active" ? t("Suspend", "تعليق") : t("Reactivate", "إعادة تفعيل")}
          </Button>
        ) : <span className="text-xs text-muted-foreground">{t("Admin only", "للمسؤول فقط")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Users", "المستخدمون")}
        subtitle={t("Who can see what. Suspending a user cuts access immediately but keeps their records and history intact.", "من يرى ماذا. تعليق المستخدم يقطع الوصول فوراً مع الحفاظ على سجلاته وتاريخه.")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Users", "المستخدمون")} value={String(db.users.length)} tone="brand" />
        <Stat label={t("Active", "نشط")} value={String(db.users.filter((u) => u.status === "active").length)} tone="success" />
        <Stat label={t("Group-wide access", "وصول لكل المجموعة")} value={String(db.users.filter((u) => u.scope === "group").length)} tone="orange" />
        <Stat label={t("Suspended / offboarding", "معلق أو مغادر")} value={String(db.users.filter((u) => u.status !== "active").length)} tone="danger" />
      </div>
      <Section title={t("Directory", "الدليل")}>
        <DataTable rows={db.users} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.name} ${r.email} ${r.role}`} exportName="trygc-users" pageSize={12} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users | Trygc CRM HUB" },
      { name: "description", content: "User directory with roles, entity data scope, access status and last login across Trygc." },
      { property: "og:title", content: "Users | Trygc CRM HUB" },
      { property: "og:description", content: "Roles, data scope and access status for every Trygc user." },
    ],
  }),
  component: Users,
});
