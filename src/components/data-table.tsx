import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  defaultHidden?: boolean;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchable?: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  bulkActions?: (selected: string[], clear: () => void) => ReactNode;
  toolbar?: ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  exportName?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchable,
  onRowClick,
  selectable,
  bulkActions,
  toolbar,
  pageSize = 12,
  emptyMessage = "No records match the current filters.",
  exportName = "export",
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [hidden, setHidden] = useState<string[]>(columns.filter((c) => c.defaultHidden).map((c) => c.key));
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const visible = columns.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return rows;
    return rows.filter((r) => searchable(r).toLowerCase().includes(q));
  }, [rows, query, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const brandTitle = exportName.replace(/^trygc-?/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) || "Export";
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fileBase = `trygc-crm-hub-${exportName.replace(/^trygc-?/, "")}`;

  const exportCsv = () => {
    const head = visible.map((c) => `"${c.header}"`).join(",");
    const body = sorted
      .map((r) =>
        visible
          .map((c) => {
            const v = c.sortValue ? c.sortValue(r) : "";
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const banner = [`"Trygc CRM HUB"`, `"${brandTitle}"`, `"Generated ${stamp} UTC"`, `""`].join("\n");
    const blob = new Blob([`${banner}\n${head}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBase}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m] as string);
    const head = visible.map((c) => `<th>${esc(c.header)}</th>`).join("");
    const body = sorted
      .map((r) => `<tr>${visible.map((c) => `<td>${esc(c.sortValue ? c.sortValue(r) : "")}</td>`).join("")}</tr>`)
      .join("");
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Trygc CRM HUB — ${esc(brandTitle)}</title><style>
      *{font-family:ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif}
      body{margin:32px;color:#141824}
      header{display:flex;align-items:center;gap:12px;border-bottom:3px solid #FF7A18;padding-bottom:12px;margin-bottom:20px}
      header img{height:36px}
      .brand{font-size:18px;font-weight:700;letter-spacing:-0.01em}
      .sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7B3FF2;font-weight:600}
      h1{font-size:15px;margin:0 0 4px}
      .meta{font-size:11px;color:#666;margin-bottom:14px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{text-align:left;background:#f4f4f7;padding:6px 8px;border-bottom:1px solid #ddd}
      td{padding:5px 8px;border-bottom:1px solid #eee}
      footer{margin-top:18px;font-size:10px;color:#888}
      @media print{body{margin:14mm}}
    </style></head><body>
      <header><img src="${window.location.origin}/favicon.png" alt="Trygc" /><div><div class="brand">Trygc</div><div class="sub">CRM HUB</div></div></header>
      <h1>${esc(brandTitle)}</h1>
      <div class="meta">Generated ${esc(stamp)} UTC · ${sorted.length} records</div>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <footer>Trygc CRM HUB — confidential internal report.</footer>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };


  const toggleSort = (key: string) =>
    setSort((prev) => (prev?.key !== key ? { key, dir: "asc" } : prev.dir === "asc" ? { key, dir: "desc" } : null));

  const allChecked = pageRows.length > 0 && pageRows.every((r) => selected.includes(rowKey(r)));

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchable ? (
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search records…"
              className="pl-8"
            />
          </div>
        ) : null}
        {toolbar}
        <div className="ms-auto flex items-center gap-2">
          {selectable && selected.length > 0 ? (
            <div className="flex items-center gap-2 rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand">
              {selected.length} selected
              {bulkActions?.(selected, () => setSelected([]))}
            </div>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="size-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              {columns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.includes(c.key)}
                  onCheckedChange={(v) => setHidden((prev) => (v ? prev.filter((k) => k !== c.key) : [...prev, c.key]))}
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border bg-card shadow-[var(--shadow-panel)]">
        <table className="w-full min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
            <tr className="border-b">
              {selectable ? (
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(v) =>
                      setSelected((prev) =>
                        v ? Array.from(new Set([...prev, ...pageRows.map(rowKey)])) : prev.filter((id) => !pageRows.map(rowKey).includes(id)),
                      )
                    }
                    aria-label="Select page"
                  />
                </th>
              ) : null}
              {visible.map((c) => (
                <th key={c.key} className={cn("px-3 py-2.5 text-start text-xs font-semibold tracking-wide text-muted-foreground uppercase", c.className)}>
                  {c.sortValue ? (
                    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(c.key)}>
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visible.length + (selectable ? 1 : 0)} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const id = rowKey(r);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={cn("border-b last:border-0 transition-colors hover:bg-muted/40", onRowClick && "cursor-pointer")}
                  >
                    {selectable ? (
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(id)}
                          onCheckedChange={(v) => setSelected((prev) => (v ? [...prev, id] : prev.filter((s) => s !== id)))}
                          aria-label="Select row"
                        />
                      </td>
                    ) : null}
                    {visible.map((c) => (
                      <td key={c.key} className={cn("px-3 py-2.5 align-middle", c.className)}>
                        {c.render(r)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {sorted.length} record{sorted.length === 1 ? "" : "s"} · page {current + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
