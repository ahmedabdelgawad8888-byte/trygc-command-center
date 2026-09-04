import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/store";
import { TODAY } from "@/lib/data/seed";
import type { Currency, LeadStage } from "@/lib/types";

export const QUICK_CREATE_KINDS = ["Lead", "Client", "Deal", "Campaign", "Influencer", "Task", "Invoice", "Payment", "Expense", "Folder"] as const;
export type QuickCreateKind = (typeof QUICK_CREATE_KINDS)[number];

type FormKey =
  | "entityId" | "name" | "clientId" | "ownerId" | "amount" | "stage" | "source" | "expectedClose"
  | "nextAction" | "industry" | "city" | "target" | "startDate" | "endDate" | "brief" | "posting"
  | "campaignId" | "influencerId" | "department" | "priority" | "dueDate" | "deliverable"
  | "invoiceId" | "reference" | "method" | "accountCode" | "vendor" | "path";
type FormState = Partial<Record<FormKey, string>>;

export function QuickCreate({ open, kind, onOpenChange }: { open: boolean; kind: QuickCreateKind; onOpenChange: (v: boolean) => void }) {
  const { db, scope, currentUser, actions, entityCurrency } = useApp();
  const navigate = useNavigate();
  const [type, setType] = useState<QuickCreateKind>(kind);
  const defaultEntity = scope === "group" ? currentUser.entityId : scope;

  const [form, setForm] = useState<FormState>({});
  useEffect(() => {
    setType(kind);
    setForm({ entityId: defaultEntity });
  }, [kind, open, defaultEntity]);

  const set = (k: FormKey, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const entityId = form.entityId ?? defaultEntity;
  const currency = entityCurrency(entityId) as Currency;

  const go = (to: string, params?: Record<string, string>) => {
    void navigate(params ? ({ to, params } as never) : ({ to } as never));
  };

  const submit = () => {
    const amount = Number(form.amount ?? 0);
    switch (type) {
      case "Lead":
      case "Deal": {
        if (!form.name || !form.clientId) { toast.error("Name and client are required"); return; }
        const deal = actions.addDeal({
          name: form.name,
          clientId: form.clientId,
          entityId,
          industry: db.clients.find((c) => c.id === form.clientId)?.industry ?? "Other",
          source: form.source ?? "Outbound",
          ownerId: form.ownerId ?? currentUser.id,
          value: amount,
          currency,
          stage: (type === "Lead" ? "New Lead" : (form.stage as LeadStage)) ?? "New Lead",
          probability: type === "Lead" ? 10 : 30,
          expectedClose: form.expectedClose ?? TODAY,
          nextAction: form.nextAction ?? "Qualify opportunity",
          nextActionDate: form.expectedClose ?? TODAY,
          priority: "Medium",
        });
        toast.success(`${type} created`, { description: deal.name });
        go(type === "Lead" ? "/crm/leads" : "/crm/deals");
        break;
      }
      case "Client": {
        if (!form.name) { toast.error("Client name is required"); return; }
        const c = actions.addClient({
          name: form.name,
          entityId,
          industry: form.industry ?? "Other",
          accountManagerId: form.ownerId ?? currentUser.id,
          escalationOwnerId: "u2",
          status: "Prospect",
          since: TODAY,
          lifetimeRevenue: 0,
          currency,
          satisfaction: 0,
          lastInteraction: TODAY,
          nextAction: form.nextAction ?? "Discovery call",
        });
        toast.success("Client created", { description: c.name });
        go("/crm/clients/$clientId", { clientId: c.id });
        break;
      }
      case "Campaign": {
        if (!form.name || !form.clientId) { toast.error("Name and client are required"); return; }
        const c = actions.addCampaign({
          name: form.name,
          clientId: form.clientId,
          entityId,
          city: form.city ?? "—",
          ownerId: form.ownerId ?? currentUser.id,
          opsOwnerId: "u9",
          backupOwnerId: "u11",
          targetInfluencers: Number(form.target ?? 10),
          startDate: form.startDate ?? TODAY,
          endDate: form.endDate ?? TODAY,
          budget: amount,
          currency,
          brief: form.brief ?? "Brief pending from client.",
          postingRequirements: form.posting ?? "1 Reel + 3 Stories within 48h of visit.",
          status: "Planning",
          clientApproval: "Pending",
          nextAction: "Collect creator criteria",
          slaHours: 48,
        });
        toast.success("Campaign created", { description: c.name });
        go("/campaigns/$campaignId", { campaignId: c.id });
        break;
      }
      case "Influencer": {
        if (!form.campaignId || !form.influencerId) { toast.error("Campaign and influencer are required"); return; }
        actions.addCampaignInfluencer(form.campaignId, form.influencerId, amount, currency);
        toast.success("Influencer added to campaign");
        go("/campaigns/$campaignId", { campaignId: form.campaignId });
        break;
      }
      case "Task": {
        if (!form.name) { toast.error("Task title is required"); return; }
        const t = actions.addTask({
          title: form.name,
          description: form.brief ?? "",
          department: form.department ?? currentUser.department,
          ownerId: form.ownerId ?? currentUser.id,
          entityId,
          priority: (form.priority as "Low" | "Medium" | "High" | "Critical") ?? "Medium",
          status: "To Do",
          startDate: TODAY,
          dueDate: form.dueDate ?? TODAY,
          percent: 0,
          slaHours: 48,
          rag: "green",
          deliverable: form.deliverable ?? "—",
          ...(form.clientId ? { clientId: form.clientId } : {}),
          ...(form.campaignId ? { campaignId: form.campaignId } : {}),
        });
        toast.success("Task created", { description: t.id });
        go("/tasks");
        break;
      }
      case "Invoice": {
        if (!form.clientId || !amount) { toast.error("Client and amount are required"); return; }
        const prefix = entityId.toUpperCase().slice(0, 2);
        const inv = actions.addInvoice({
          number: `INV-${prefix}-2026-${Math.floor(1000 + Math.random() * 8999)}`,
          clientId: form.clientId,
          entityId,
          issueDate: TODAY,
          dueDate: form.dueDate ?? TODAY,
          amount,
          paid: 0,
          currency,
          status: "Draft",
          lines: [{ description: form.brief ?? "Campaign services", qty: 1, unitPrice: amount }],
          ...(form.campaignId ? { campaignId: form.campaignId } : {}),
        });
        toast.success("Invoice drafted", { description: inv.number });
        go("/finance/invoices");
        break;
      }
      case "Payment": {
        if (!form.invoiceId || !amount) { toast.error("Invoice and amount are required"); return; }
        const inv = db.invoices.find((i) => i.id === form.invoiceId)!;
        actions.addPayment({
          invoiceId: inv.id,
          entityId: inv.entityId,
          date: TODAY,
          amount,
          currency: inv.currency,
          method: (form.method as "Bank Transfer") ?? "Bank Transfer",
          reference: form.reference ?? "—",
        });
        toast.success("Payment recorded", { description: `${inv.currency} ${amount.toLocaleString()} against ${inv.number}` });
        go("/finance/payments");
        break;
      }
      case "Expense": {
        if (!form.name || !amount) { toast.error("Description and amount are required"); return; }
        actions.addExpense({
          description: form.name,
          entityId,
          accountCode: form.accountCode ?? "5100",
          date: TODAY,
          amount,
          currency,
          status: "Pending Approval",
          vendor: form.vendor ?? "—",
          ...(form.campaignId ? { campaignId: form.campaignId } : {}),
        });
        toast.success("Expense submitted for approval");
        go("/finance/expenses");
        break;
      }
      case "Folder": {
        if (!form.name) { toast.error("Folder name is required"); return; }
        actions.addFile({
          name: form.name,
          kind: "folder",
          path: form.path ?? "/Corporate",
          entityId,
          size: "0 KB",
          updatedAt: TODAY,
          owner: currentUser.name,
        });
        toast.success("Folder created");
        go("/files");
        break;
      }
    }
    onOpenChange(false);
  };

  const entitySelect = (
    <div className="space-y-1.5">
      <Label>Entity</Label>
      <Select value={entityId} onValueChange={(v) => set("entityId", v)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {db.entities.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name} · {e.currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const clientSelect = (
    <div className="space-y-1.5">
      <Label>Client</Label>
      <Select value={form.clientId ?? ""} onValueChange={(v) => set("clientId", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select client" />
        </SelectTrigger>
        <SelectContent>
          {db.clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const ownerSelect = (
    <div className="space-y-1.5">
      <Label>Owner</Label>
      <Select value={form.ownerId ?? currentUser.id} onValueChange={(v) => set("ownerId", v)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {db.users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick create</DialogTitle>
          <DialogDescription>Create records without leaving the page. Amounts are recorded in the entity currency ({currency}).</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Record type</Label>
          <Select value={type} onValueChange={(v) => setType(v as QuickCreateKind)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUICK_CREATE_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid max-h-[50vh] gap-4 overflow-y-auto pe-1 sm:grid-cols-2">
          {["Lead", "Deal", "Client", "Campaign", "Task", "Invoice", "Expense", "Folder"].includes(type) ? entitySelect : null}

          {["Lead", "Deal", "Client", "Campaign", "Task", "Expense", "Folder"].includes(type) ? (
            <div className="space-y-1.5">
              <Label>{type === "Expense" ? "Description" : type === "Folder" ? "Folder name" : "Name"}</Label>
              <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder={type === "Client" ? "Al Romansiah Restaurants" : "Enter a clear name"} />
            </div>
          ) : null}

          {["Lead", "Deal", "Campaign", "Invoice"].includes(type) ? clientSelect : null}
          {["Lead", "Deal", "Client", "Campaign", "Task"].includes(type) ? ownerSelect : null}

          {["Lead", "Deal", "Campaign", "Invoice", "Payment", "Expense", "Influencer"].includes(type) ? (
            <div className="space-y-1.5">
              <Label>Amount ({type === "Payment" ? "invoice currency" : currency})</Label>
              <Input type="number" value={form.amount ?? ""} onChange={(e) => set("amount", e.target.value)} placeholder="0" />
            </div>
          ) : null}

          {type === "Campaign" ? (
            <>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="Riyadh" />
              </div>
              <div className="space-y-1.5">
                <Label>Target influencers</Label>
                <Input type="number" value={form.target ?? ""} onChange={(e) => set("target", e.target.value)} placeholder="10" />
              </div>
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input type="date" value={form.endDate ?? ""} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Brief</Label>
                <Textarea value={form.brief ?? ""} onChange={(e) => set("brief", e.target.value)} placeholder="What must this campaign deliver?" />
              </div>
            </>
          ) : null}

          {type === "Influencer" ? (
            <>
              <div className="space-y-1.5">
                <Label>Campaign</Label>
                <Select value={form.campaignId ?? ""} onValueChange={(v) => set("campaignId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Influencer</Label>
                <Select value={form.influencerId ?? ""} onValueChange={(v) => set("influencerId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select influencer" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.influencers
                      .filter((i) => !i.blacklisted)
                      .map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name} · {i.handle}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          {type === "Task" ? (
            <>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department ?? currentUser.department} onValueChange={(v) => set("department", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sales", "Community", "Operations", "Quality", "Finance", "IT", "Management"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority ?? "Medium"} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Critical"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Deliverable</Label>
                <Input value={form.deliverable ?? ""} onChange={(e) => set("deliverable", e.target.value)} placeholder="What proves this is done?" />
              </div>
            </>
          ) : null}

          {type === "Invoice" ? (
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
          ) : null}

          {type === "Payment" ? (
            <>
              <div className="space-y-1.5">
                <Label>Invoice</Label>
                <Select value={form.invoiceId ?? ""} onValueChange={(v) => set("invoiceId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.invoices
                      .filter((i) => i.paid < i.amount && i.status !== "Cancelled")
                      .map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.number} · {i.currency} {(i.amount - i.paid).toLocaleString()} due
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reference</Label>
                <Input value={form.reference ?? ""} onChange={(e) => set("reference", e.target.value)} placeholder="Bank reference" />
              </div>
            </>
          ) : null}

          {type === "Expense" ? (
            <>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select value={form.accountCode ?? "5100"} onValueChange={(v) => set("accountCode", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {db.accounts
                      .filter((a) => a.type === "Expense" && a.category !== "Header")
                      .map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.code} — {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vendor</Label>
                <Input value={form.vendor ?? ""} onChange={(e) => set("vendor", e.target.value)} />
              </div>
            </>
          ) : null}

          {type === "Folder" ? (
            <div className="space-y-1.5">
              <Label>Parent path</Label>
              <Input value={form.path ?? "/Corporate"} onChange={(e) => set("path", e.target.value)} />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create {type}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
