import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/kit";
import { useDrill } from "@/lib/drill";
import { cn } from "@/lib/utils";

export type ChartPoint = { name: string; value: number };

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

const AXIS = { tickLine: false, axisLine: false, fontSize: 11 } as const;
const TOOLTIP = { borderRadius: 10, fontSize: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" } as const;

/** Click-through: selecting a segment filters the records table on the same page. */
function useChartDrill(title: string) {
  const { drill, setDrill } = useDrill();
  const active = drill && drill.source === title ? drill.label : null;
  const pick = (name?: string | number) => {
    const label = String(name ?? "").trim();
    if (!label) return;
    setDrill(active === label ? null : { label, source: title });
  };
  const dim = (name: string) => (active && active !== name ? 0.28 : 1);
  return { active, pick, dim };
}

function Frame({ title, description, children, className }: { title: string; description?: string | undefined; children: React.ReactNode; className?: string | undefined }) {
  return (
    <Panel className={cn("min-w-0", className)}>
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="h-56 w-full">{children}</div>
    </Panel>
  );
}

export function BarChartCard({
  title,
  description,
  data,
  format,
  horizontal = false,
  colorful = false,
  className,
}: {
  title: string;
  description?: string | undefined;
  data: ChartPoint[];
  format?: ((v: number) => string) | undefined;
  horizontal?: boolean;
  colorful?: boolean;
  className?: string | undefined;
}) {
  const fmt = format ?? ((v: number) => String(v));
  const { pick, dim } = useChartDrill(title);
  return (
    <Frame title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: 4, right: 12, top: 6, bottom: 4 }} barCategoryGap={horizontal ? 8 : 14}>
          <CartesianGrid strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} className="stroke-border" />
          <XAxis
            type={horizontal ? "number" : "category"}
            {...(horizontal ? { tickFormatter: fmt, tickCount: 4, interval: "preserveStartEnd" as const } : { dataKey: "name" as const, interval: 0 as const })}
            {...AXIS}
          />
          <YAxis
            type={horizontal ? "category" : "number"}
            {...(horizontal ? { dataKey: "name" as const } : { tickFormatter: fmt })}
            width={horizontal ? 104 : 64}
            {...AXIS}
          />
          <Tooltip cursor={{ fill: "color-mix(in oklab, var(--color-muted) 60%, transparent)" }} formatter={(v: number) => fmt(v)} contentStyle={TOOLTIP} />
          <Bar
            dataKey="value"
            name={title}
            fill={PALETTE[0]}
            radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            maxBarSize={horizontal ? 20 : 44}
            className="cursor-pointer"
            onClick={(d: { name?: string | number }) => pick(d?.name)}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colorful ? PALETTE[i % PALETTE.length] : PALETTE[0]} fillOpacity={dim(d.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export function DonutChartCard({
  title,
  description,
  data,
  format,
  className,
}: {
  title: string;
  description?: string | undefined;
  data: ChartPoint[];
  format?: ((v: number) => string) | undefined;
  className?: string | undefined;
}) {
  const fmt = format ?? ((v: number) => String(v));
  const rows = data.filter((d) => d.value > 0);
  const { pick, dim } = useChartDrill(title);
  return (
    <Frame title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            className="cursor-pointer"
            onClick={(d: { name?: string | number }) => pick(d?.name)}
          >
            {rows.map((d, i) => (
              <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} fillOpacity={dim(d.name)} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TOOLTIP} />
        </PieChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export function TrendChartCard({
  title,
  description,
  data,
  format,
  className,
}: {
  title: string;
  description?: string | undefined;
  data: ChartPoint[];
  format?: ((v: number) => string) | undefined;
  className?: string | undefined;
}) {
  const fmt = format ?? ((v: number) => String(v));
  const id = `grad-${title.replace(/\W/g, "")}`;
  const { pick } = useChartDrill(title);
  return (
    <Frame title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 4, right: 12, top: 6, bottom: 4 }} className="cursor-pointer" onClick={(e: { activeLabel?: string | number }) => pick(e?.activeLabel)}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.45} />
              <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="name" {...AXIS} />
          <YAxis tickFormatter={fmt} width={64} {...AXIS} />
          <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TOOLTIP} />
          <Area type="linear" dataKey="value" name={title} stroke={PALETTE[0]} strokeWidth={2} fill={`url(#${id})`} dot={{ r: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export function ChartRow({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("grid items-start gap-4", cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3")}>{children}</div>;
}

export function countBy<T>(rows: T[], key: (r: T) => string): ChartPoint[] {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r);
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return [...m.entries()].map(([name, value]) => ({ name, value }));
}

export function sumBy<T>(rows: T[], key: (r: T) => string, amount: (r: T) => number): ChartPoint[] {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r);
    m.set(k, (m.get(k) ?? 0) + amount(r));
  });
  return [...m.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));
}
