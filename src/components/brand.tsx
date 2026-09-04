import { cn } from "@/lib/utils";

export function TrygcMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} role="img" aria-label="Trygc">
      <path d="M45 15C36 7 22 9 16 20 10 31 13 44 24 50" fill="none" stroke="#FF7A18" strokeWidth="10" strokeLinecap="round" />
      <path d="M45 24v20c0 7-5 11-11 10-4-.5-7-3-8-7" fill="none" stroke="#7B3FF2" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function TrygcLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <TrygcMark className="size-8 shrink-0" />
      {collapsed ? null : (
        <div className="leading-tight">
          <div className="font-display text-base font-semibold tracking-tight">Trygc</div>
          <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Operations OS</div>
        </div>
      )}
    </div>
  );
}
