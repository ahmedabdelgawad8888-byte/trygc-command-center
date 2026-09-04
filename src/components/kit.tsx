import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Health } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  actions,
  meta,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {title ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-[var(--shadow-panel)]", className)}>{children}</div>;
}

export function Stat({
  label,
  value,
  delta,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  tone?: "default" | "brand" | "orange" | "danger" | "success" | "warning";
  icon?: ReactNode;
}) {
  const toneRing: Record<string, string> = {
    default: "",
    brand: "border-brand/30",
    orange: "border-accent-orange/40",
    danger: "border-danger/40",
    success: "border-success/40",
    warning: "border-warning/40",
  };
  const toneText: Record<string, string> = {
    default: "text-foreground",
    brand: "text-brand",
    orange: "text-accent-orange",
    danger: "text-danger",
    success: "text-success",
    warning: "text-warning",
  };
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-[var(--shadow-panel)]", toneRing[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <div className={cn("num mt-2 text-2xl font-semibold", toneText[tone])}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {delta ? <span className="font-medium">{delta}</span> : null}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}

const pillTones: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand-soft text-brand",
  orange: "bg-accent-orange-soft text-accent-orange",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-muted text-info",
};

export type PillTone = keyof typeof pillTones;

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: PillTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", pillTones[tone], className)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): PillTone {
  const s = status.toLowerCase();
  if (["won", "paid", "approved", "completed", "active", "connected", "done", "green", "posting coverage verified", "valid"].some((k) => s === k || s.includes(k)))
    return "success";
  if (["lost", "overdue", "critical", "rejected", "error", "blocked", "red", "missed visit", "missing posting coverage", "escalated", "at risk", "revoked", "failing", "expired", "cancelled"].some((k) => s.includes(k)))
    return "danger";
  if (["pending", "amber", "partial", "needs configuration", "on hold", "returned", "suspended", "postponed", "replacement required", "no response", "onboarding", "draft"].some((k) => s.includes(k)))
    return "warning";
  if (["in progress", "delivery", "negotiation", "proposal", "issued", "scheduled", "confirmed", "submitted to client"].some((k) => s.includes(k))) return "brand";
  return "neutral";
}

export function StatusPill({ status }: { status: string }) {
  return <Pill tone={statusTone(status)}>{status}</Pill>;
}

export function HealthPill({ health }: { health: Health }) {
  const map: Record<Health, PillTone> = { green: "success", amber: "warning", red: "danger", critical: "danger" };
  const label: Record<Health, string> = { green: "Healthy", amber: "Watch", red: "At risk", critical: "Critical" };
  return (
    <Pill tone={map[health]}>
      <span className="size-1.5 rounded-full bg-current" />
      {label[health]}
    </Pill>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function Bar({ value, max, tone = "brand" }: { value: number; max: number; tone?: "brand" | "orange" | "success" | "danger" }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  const bg = { brand: "bg-brand", orange: "bg-accent-orange", success: "bg-success", danger: "bg-danger" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", bg)} style={{ width: `${pct}%` }} />
    </div>
  );
}
