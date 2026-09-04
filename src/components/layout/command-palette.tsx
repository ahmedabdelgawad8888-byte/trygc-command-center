import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useApp } from "@/lib/store";
import { navGroups } from "./nav-config";

export function CommandPalette({
  open,
  onOpenChange,
  onQuickCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onQuickCreate: (kind: string) => void;
}) {
  const { db } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search clients, campaigns, deals, invoices, tasks, people…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matches found.</CommandEmpty>
        <CommandGroup heading="Quick create">
          {["Lead", "Client", "Deal", "Campaign", "Task", "Invoice", "Payment", "Expense", "Folder"].map((k) => (
            <CommandItem
              key={k}
              value={`create ${k}`}
              onSelect={() => {
                onOpenChange(false);
                onQuickCreate(k);
              }}
            >
              Create {k}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Clients">
          {db.clients.map((c) => (
            <CommandItem key={c.id} value={`client ${c.name}`} onSelect={() => go(`/crm/clients/${c.id}`)}>
              {c.name}
              <span className="ms-auto text-xs text-muted-foreground">{c.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Campaigns">
          {db.campaigns.map((c) => (
            <CommandItem key={c.id} value={`campaign ${c.name}`} onSelect={() => go(`/campaigns/${c.id}`)}>
              {c.name}
              <span className="ms-auto text-xs text-muted-foreground">{c.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Deals">
          {db.deals.map((d) => (
            <CommandItem key={d.id} value={`deal ${d.name}`} onSelect={() => go("/crm/deals")}>
              {d.name}
              <span className="ms-auto text-xs text-muted-foreground">{d.stage}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Invoices">
          {db.invoices.map((i) => (
            <CommandItem key={i.id} value={`invoice ${i.number}`} onSelect={() => go("/finance/invoices")}>
              {i.number}
              <span className="ms-auto text-xs text-muted-foreground">{i.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Influencers">
          {db.influencers.map((i) => (
            <CommandItem key={i.id} value={`influencer ${i.name} ${i.handle}`} onSelect={() => go("/campaigns/influencers")}>
              {i.name}
              <span className="ms-auto text-xs text-muted-foreground">{i.handle}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {db.tasks.slice(0, 12).map((t) => (
            <CommandItem key={t.id} value={`task ${t.id} ${t.title}`} onSelect={() => go("/tasks")}>
              {t.id} — {t.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {db.users.map((u) => (
            <CommandItem key={u.id} value={`user ${u.name} ${u.role}`} onSelect={() => go("/admin/users")}>
              {u.name}
              <span className="ms-auto text-xs text-muted-foreground">{u.role}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {navGroups.flatMap((g) =>
            g.items.map((i) => (
              <CommandItem key={i.to} value={`go ${g.label} ${i.label}`} onSelect={() => go(i.to)}>
                {g.label} · {i.label}
              </CommandItem>
            )),
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
