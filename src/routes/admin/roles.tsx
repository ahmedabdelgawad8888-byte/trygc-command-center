import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageHeader, Panel, Pill, Section, Stat } from "@/components/kit";
import { ChartRow, BarChartCard, ShareChartCard, countBy, sumBy } from "@/components/charts";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";

function Roles() {
  const { db } = useApp();
  const { t } = useLang();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Roles & Permissions", "الأدوار والصلاحيات")}
        subtitle={t("Permission decides what a person can do; data scope decides which entity's records they see. The two are separate on purpose.", "الصلاحية تحدد ما يمكن فعله، ونطاق البيانات يحدد سجلات أي كيان تُرى. الفصل بينهما مقصود.")}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("Roles", "الأدوار")} value={String(db.roles.length)} tone="brand" />
        <Stat label={t("Group-scoped roles", "أدوار على مستوى المجموعة")} value={String(db.roles.filter((r) => r.scope === "Group").length)} tone="orange" />
        <Stat label={t("Roles that may edit accounts", "أدوار تعدّل الحسابات")} value={String(db.roles.filter((r) => r.canEditCOA).length)} tone="danger" />
      </div>
      <ChartRow cols={2}>
        <BarChartCard title={t("People per role", "عدد الأشخاص لكل دور")} data={db.roles.map((r) => ({ name: r.name, value: r.members }))} horizontal colorful />
        <ShareChartCard title={t("Roles by data scope", "الأدوار حسب نطاق البيانات")} data={countBy(db.roles, (r) => r.scope)} />
      </ChartRow>
      <Section title={t("Role catalogue", "دليل الأدوار")}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {db.roles.map((r) => (
            <Panel key={r.name}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                </div>
                <Pill tone={r.scope === "Group" ? "orange" : "neutral"}>{r.scope}</Pill>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                {r.canEditCOA ? <Check className="size-3.5 text-success" /> : <X className="size-3.5 text-muted-foreground" />}
                <span className={r.canEditCOA ? "text-success" : "text-muted-foreground"}>{t("Can edit chart of accounts", "يمكنه تعديل شجرة الحسابات")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {r.permissions.map((p) => <Pill key={p} tone="brand">{p}</Pill>)}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{r.members} {t("people hold this role", "شخص يحمل هذا الدور")}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions | Trygc CRM HUB" },
      { name: "description", content: "Role catalogue separating what people can do from which entity records they can see." },
      { property: "og:title", content: "Roles & Permissions | Trygc CRM HUB" },
      { property: "og:description", content: "Permissions and data scope for every Trygc role." },
    ],
  }),
  component: Roles,
});
