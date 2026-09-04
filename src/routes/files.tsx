import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Folder, Image as ImageIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, Section, Stat } from "@/components/kit";
import { DataTable, type Column } from "@/components/data-table";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { shortDate } from "@/lib/format";
import type { CorporateFile } from "@/lib/types";
import { BarChartCard, ChartRow, DonutChartCard, TrendChartCard, countBy, sumBy } from "@/components/charts";

const icon = (kind: CorporateFile["kind"]) => {
  if (kind === "folder") return <Folder className="size-4 text-brand" />;
  if (kind === "sheet") return <FileSpreadsheet className="size-4 text-success" />;
  if (kind === "image") return <ImageIcon className="size-4 text-orange" />;
  return <FileText className="size-4 text-muted-foreground" />;
};

function Files() {
  const { db, inScope, entityName, clientName, campaignName } = useApp();
  const { t } = useLang();
  const all = inScope(db.files);
  const [path, setPath] = useState("/");

  const folders = useMemo(() => [...new Set(all.map((f) => f.path))].sort(), [all]);
  const rows = path === "/" ? all : all.filter((f) => f.path.startsWith(path));

  const columns: Column<CorporateFile>[] = [
    { key: "name", header: t("Name", "الاسم"), render: (r) => <div className="flex items-center gap-2">{icon(r.kind)}<span className="font-medium">{r.name}</span></div>, sortValue: (r) => r.name },
    { key: "path", header: t("Location", "الموقع"), render: (r) => <span className="text-xs text-muted-foreground">{r.path}</span>, sortValue: (r) => r.path },
    { key: "linked", header: t("Linked to", "مرتبط بـ"), render: (r) => (r.clientId ? clientName(r.clientId) : r.campaignId ? campaignName(r.campaignId) : t("Corporate", "مؤسسي")) },
    { key: "entity", header: t("Entity", "الكيان"), render: (r) => entityName(r.entityId), sortValue: (r) => entityName(r.entityId) },
    { key: "owner", header: t("Owner", "المالك"), render: (r) => r.owner, sortValue: (r) => r.owner },
    { key: "size", header: t("Size", "الحجم"), render: (r) => <span className="num text-xs">{r.size}</span> },
    { key: "updated", header: t("Updated", "آخر تحديث"), render: (r) => shortDate(r.updatedAt), sortValue: (r) => r.updatedAt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Corporate Files", "الملفات المؤسسية")}
        subtitle={t("One structured vault. Every document is attached to an entity, a client or a campaign — never floating on someone's laptop.", "خزانة واحدة منظمة. كل مستند مرتبط بكيان أو عميل أو حملة — لا ملفات سائبة.")}
        meta={[<Pill key="a" tone="brand">{t("Access follows role and entity", "الوصول يتبع الدور والكيان")}</Pill>]}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Documents", "المستندات")} value={String(all.filter((f) => f.kind !== "folder").length)} tone="brand" />
        <Stat label={t("Folders", "المجلدات")} value={String(folders.length)} />
        <Stat label={t("Client-linked", "مرتبط بعميل")} value={String(all.filter((f) => f.clientId).length)} tone="success" />
        <Stat label={t("Campaign-linked", "مرتبط بحملة")} value={String(all.filter((f) => f.campaignId).length)} tone="orange" />
      </div>
      <ChartRow cols={2}>
        <DonutChartCard title={t("Files by type", "الملفات حسب النوع")} data={countBy(rows, (r) => r.kind)} />
        <BarChartCard title={t("Files by entity", "الملفات حسب الكيان")} horizontal data={countBy(rows, (r) => entityName(r.entityId))} />
      </ChartRow>
      <Section title={t("Vault", "الخزانة")} description={t("Filter by folder, then search inside it.", "رشّح حسب المجلد ثم ابحث داخله.")}>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant={path === "/" ? "default" : "outline"} onClick={() => setPath("/")}>{t("All files", "كل الملفات")}</Button>
          {folders.map((f) => (
            <Button key={f} size="sm" variant={path === f ? "default" : "outline"} onClick={() => setPath(f)} className="gap-1">
              <ChevronRight className="size-3" />{f}
            </Button>
          ))}
        </div>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} searchable={(r) => `${r.name} ${r.path} ${r.owner}`} exportName="trygc-files" pageSize={12} />
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Corporate Files | Trygc CRM HUB" },
      { name: "description", content: "Structured document vault where every file is linked to an entity, client or campaign with role-based access." },
      { property: "og:title", content: "Corporate Files | Trygc CRM HUB" },
      { property: "og:description", content: "Structured vault linking documents to entities, clients and campaigns." },
    ],
  }),
  component: Files,
});
