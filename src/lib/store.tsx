import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as seed from "./data/seed";
import type {
  Account,
  ActivityEvent,
  Approval,
  AutomationRule,
  Campaign,
  CampaignInfluencer,
  Client,
  CoaRequest,
  Contact,
  CorporateFile,
  Currency,
  Deal,
  Entity,
  Expense,
  Influencer,
  InfluencerStage,
  Integration,
  Invoice,
  LeadStage,
  Notification,
  Payment,
  QueueItem,
  RoleDef,
  SaasSeat,
  Task,
  TaskStatus,
  User,
} from "./types";

export type Scope = "group" | string;

interface DB {
  entities: Entity[];
  users: User[];
  roles: RoleDef[];
  clients: Client[];
  contacts: Contact[];
  deals: Deal[];
  campaigns: Campaign[];
  influencers: Influencer[];
  campaignInfluencers: CampaignInfluencer[];
  tasks: Task[];
  queueItems: QueueItem[];
  accounts: Account[];
  coaRequests: CoaRequest[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  approvals: Approval[];
  activities: ActivityEvent[];
  notifications: Notification[];
  files: CorporateFile[];
  integrations: Integration[];
  saasSeats: SaasSeat[];
  automationRules: AutomationRule[];
}

const initialDb: DB = {
  entities: seed.entities,
  users: seed.users,
  roles: seed.roles,
  clients: seed.clients,
  contacts: seed.contacts,
  deals: seed.deals,
  campaigns: seed.campaigns,
  influencers: seed.influencers,
  campaignInfluencers: seed.campaignInfluencers,
  tasks: seed.tasks,
  queueItems: seed.queueItems,
  accounts: seed.accounts,
  coaRequests: seed.coaRequests,
  invoices: seed.invoices,
  payments: seed.payments,
  expenses: seed.expenses,
  approvals: seed.approvals,
  activities: seed.activities,
  notifications: seed.notifications,
  files: seed.files,
  integrations: seed.integrations,
  saasSeats: seed.saasSeats,
  automationRules: seed.automationRules,
};

function nowStamp() {
  return `${seed.TODAY} ${new Date().toTimeString().slice(0, 5)}`;
}

interface Ctx {
  db: DB;
  scope: Scope;
  setScope: (s: Scope) => void;
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  can: (perm: "coa.write" | "finance.approve" | "admin" | "assign" | "export" | "reports.confidential") => boolean;
  inScope: <T extends { entityId: string }>(rows: T[]) => T[];
  userName: (id?: string) => string;
  entityName: (id: string) => string;
  entityCurrency: (id: string) => Currency;
  clientName: (id?: string) => string;
  campaignName: (id?: string) => string;
  influencerName: (id?: string) => string;
  log: (e: Omit<ActivityEvent, "id" | "at" | "actorId">) => void;
  actions: {
    addDeal: (d: Omit<Deal, "id" | "createdAt" | "lastActivity">) => Deal;
    moveDeal: (id: string, stage: LeadStage) => void;
    touchDeal: (id: string) => void;
    convertDeal: (id: string) => void;
    addClient: (c: Omit<Client, "id">) => Client;
    addCampaign: (c: Omit<Campaign, "id">) => Campaign;
    addCampaignInfluencer: (campaignId: string, influencerId: string, fee: number, currency: Currency) => void;
    moveInfluencer: (id: string, stage: InfluencerStage, note?: string) => void;
    addTask: (t: Omit<Task, "id">) => Task;
    setTaskStatus: (id: string, status: TaskStatus) => void;
    assignQueueItem: (ids: string[], ownerId: string) => void;
    setQueueStatus: (id: string, status: QueueItem["status"]) => void;
    addInvoice: (i: Omit<Invoice, "id">) => Invoice;
    setInvoiceStatus: (id: string, status: Invoice["status"]) => void;
    addPayment: (p: Omit<Payment, "id">) => void;
    requestAccount: (r: Omit<CoaRequest, "id" | "status" | "requestedAt" | "requestedBy">) => void;
    decideCoaRequest: (id: string, decision: "Approved" | "Rejected") => void;
    decideApproval: (id: string, decision: Approval["status"]) => void;
    markNotification: (id: string, read: boolean) => void;
    markAllNotificationsRead: () => void;
    addExpense: (e: Omit<Expense, "id">) => void;
    addFile: (f: Omit<CorporateFile, "id">) => void;
    addEntity: (e: Omit<Entity, "id">) => void;
    addUser: (u: Omit<User, "id" | "lastLogin">) => void;
    setUserStatus: (id: string, status: User["status"]) => void;
    toggleAutomation: (id: string) => void;
    setSeatStatus: (id: string, status: SaasSeat["status"]) => void;
  };
}

const AppContext = createContext<Ctx | null>(null);

let counter = 1000;
const uid = (p: string) => `${p}${++counter}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(initialDb);
  const [scope, setScope] = useState<Scope>("group");
  const [currentUserId, setCurrentUserId] = useState("u1");

  const currentUser = (db.users.find((u) => u.id === currentUserId) ?? db.users[0]) as User;

  const log = useCallback(
    (e: Omit<ActivityEvent, "id" | "at" | "actorId">) => {
      setDb((prev) => ({
        ...prev,
        activities: [{ ...e, id: uid("a"), at: nowStamp(), actorId: currentUserId }, ...prev.activities],
      }));
    },
    [currentUserId],
  );

  const value = useMemo<Ctx>(() => {
    const userName = (id?: string) => db.users.find((u) => u.id === id)?.name ?? "Unassigned";
    const entityName = (id: string) => db.entities.find((e) => e.id === id)?.name ?? id;
    const entityCurrency = (id: string) => db.entities.find((e) => e.id === id)?.currency ?? "SAR";
    const clientName = (id?: string) => db.clients.find((c) => c.id === id)?.name ?? "—";
    const campaignName = (id?: string) => db.campaigns.find((c) => c.id === id)?.name ?? "—";
    const influencerName = (id?: string) => db.influencers.find((c) => c.id === id)?.name ?? "—";

    const pushActivity = (prev: DB, e: Omit<ActivityEvent, "id" | "at" | "actorId">): DB => ({
      ...prev,
      activities: [{ ...e, id: uid("a"), at: nowStamp(), actorId: currentUserId }, ...prev.activities],
    });

    const can: Ctx["can"] = (perm) => {
      const r = currentUser.role;
      if (r === "Group Admin") return true;
      if (perm === "coa.write") return r === "Group Finance";
      if (perm === "finance.approve") return r === "Group Finance" || r === "Executive Management";
      if (perm === "admin") return r === "IT Admin";
      if (perm === "assign") return ["Operations Manager", "Queue Manager", "Community Manager", "Sales Manager"].includes(r);
      if (perm === "export")
        return !["Viewer", "Community Specialist", "Operations Specialist", "Quality"].includes(r);
      if (perm === "reports.confidential")
        return ["Executive Management", "Group Finance", "Branch Accountant"].includes(r);
      return false;
    };

    return {
      db,
      scope,
      setScope,
      currentUser,
      setCurrentUserId,
      can,
      inScope: (rows) => (scope === "group" ? rows : rows.filter((r) => r.entityId === scope)),
      userName,
      entityName,
      entityCurrency,
      clientName,
      campaignName,
      influencerName,
      log,
      actions: {
        addDeal: (d) => {
          const deal: Deal = { ...d, id: uid("d"), createdAt: seed.TODAY, lastActivity: seed.TODAY };
          setDb((prev) =>
            pushActivity({ ...prev, deals: [deal, ...prev.deals] }, {
              action: "Created deal",
              module: "CRM",
              recordId: deal.id,
              recordLabel: deal.name,
              entityId: deal.entityId,
              to: deal.stage,
            }),
          );
          return deal;
        },
        moveDeal: (id, stage) =>
          setDb((prev) => {
            const deal = prev.deals.find((d) => d.id === id);
            if (!deal) return prev;
            return pushActivity(
              {
                ...prev,
                deals: prev.deals.map((d) =>
                  d.id === id ? { ...d, stage, lastActivity: seed.TODAY, probability: stage === "Won" ? 100 : stage === "Lost" ? 0 : d.probability } : d,
                ),
              },
              { action: "Moved deal stage", module: "CRM", recordId: id, recordLabel: deal.name, entityId: deal.entityId, from: deal.stage, to: stage },
            );
          }),
        touchDeal: (id) =>
          setDb((prev) => ({ ...prev, deals: prev.deals.map((d) => (d.id === id ? { ...d, lastActivity: seed.TODAY } : d)) })),
        convertDeal: (id) =>
          setDb((prev) => {
            const deal = prev.deals.find((d) => d.id === id);
            if (!deal) return prev;
            const client = prev.clients.find((c) => c.id === deal.clientId);
            const campaign: Campaign = {
              id: uid("cmp"),
              name: `${client?.name ?? "Client"} — ${deal.name.split("—").pop()?.trim() ?? "New Campaign"}`,
              clientId: deal.clientId,
              entityId: deal.entityId,
              city: "—",
              dealId: deal.id,
              ownerId: deal.ownerId,
              opsOwnerId: "u9",
              backupOwnerId: "u11",
              targetInfluencers: 10,
              startDate: seed.TODAY,
              endDate: deal.expectedClose,
              budget: deal.value,
              currency: deal.currency,
              brief: "Converted from won deal — brief pending from client.",
              postingRequirements: "To be defined with client.",
              status: "Planning",
              clientApproval: "Pending",
              nextAction: "Collect brief and creator criteria",
              slaHours: 48,
            };
            return pushActivity(
              {
                ...prev,
                deals: prev.deals.map((d) => (d.id === id ? { ...d, stage: "Won", probability: 100, lastActivity: seed.TODAY } : d)),
                clients: prev.clients.map((c) => (c.id === deal.clientId ? { ...c, status: c.status === "Prospect" ? "Active" : c.status } : c)),
                campaigns: [campaign, ...prev.campaigns],
              },
              { action: "Converted won deal into campaign", module: "CRM", recordId: campaign.id, recordLabel: campaign.name, entityId: deal.entityId, from: deal.stage, to: "Won" },
            );
          }),
        addClient: (c) => {
          const client: Client = { ...c, id: uid("c") };
          setDb((prev) =>
            pushActivity({ ...prev, clients: [client, ...prev.clients] }, { action: "Created client", module: "CRM", recordId: client.id, recordLabel: client.name, entityId: client.entityId }),
          );
          return client;
        },
        addCampaign: (c) => {
          const campaign: Campaign = { ...c, id: uid("cmp") };
          setDb((prev) =>
            pushActivity({ ...prev, campaigns: [campaign, ...prev.campaigns] }, { action: "Created campaign", module: "Campaigns", recordId: campaign.id, recordLabel: campaign.name, entityId: campaign.entityId }),
          );
          return campaign;
        },
        addCampaignInfluencer: (campaignId, influencerId, fee, currency) =>
          setDb((prev) => {
            const row: CampaignInfluencer = {
              id: uid("ci"),
              campaignId,
              influencerId,
              stage: "Target",
              fee,
              currency,
              history: [{ at: nowStamp(), stage: "Target", by: currentUserId }],
            };
            const camp = prev.campaigns.find((c) => c.id === campaignId);
            return pushActivity({ ...prev, campaignInfluencers: [...prev.campaignInfluencers, row] }, {
              action: "Added influencer to campaign",
              module: "Campaigns",
              recordId: campaignId,
              recordLabel: `${prev.influencers.find((i) => i.id === influencerId)?.name} — ${camp?.name ?? ""}`,
              entityId: camp?.entityId ?? "sa",
              to: "Target",
            });
          }),
        moveInfluencer: (id, stage, note) =>
          setDb((prev) => {
            const row = prev.campaignInfluencers.find((r) => r.id === id);
            if (!row) return prev;
            const camp = prev.campaigns.find((c) => c.id === row.campaignId);
            return pushActivity(
              {
                ...prev,
                campaignInfluencers: prev.campaignInfluencers.map((r) =>
                  r.id === id ? { ...r, stage, ...(note !== undefined ? { note } : {}), history: [...r.history, { at: nowStamp(), stage, by: currentUserId }] } : r,
                ),
              },
              {
                action: "Moved influencer stage",
                module: "Campaigns",
                recordId: row.campaignId,
                recordLabel: `${prev.influencers.find((i) => i.id === row.influencerId)?.name} — ${camp?.name ?? ""}`,
                entityId: camp?.entityId ?? "sa",
                from: row.stage,
                to: stage,
              },
            );
          }),
        addTask: (t) => {
          const task: Task = { ...t, id: `T-${++counter}` };
          setDb((prev) => pushActivity({ ...prev, tasks: [task, ...prev.tasks] }, { action: "Created task", module: "Tasks", recordId: task.id, recordLabel: task.title, entityId: task.entityId }));
          return task;
        },
        setTaskStatus: (id, status) =>
          setDb((prev) => {
            const t = prev.tasks.find((x) => x.id === id);
            if (!t) return prev;
            return pushActivity(
              { ...prev, tasks: prev.tasks.map((x) => (x.id === id ? { ...x, status, percent: status === "Done" ? 100 : x.percent } : x)) },
              { action: "Changed task status", module: "Tasks", recordId: id, recordLabel: t.title, entityId: t.entityId, from: t.status, to: status },
            );
          }),
        assignQueueItem: (ids, ownerId) =>
          setDb((prev) =>
            pushActivity({ ...prev, queueItems: prev.queueItems.map((q) => (ids.includes(q.id) ? { ...q, ownerId } : q)) }, {
              action: `Assigned ${ids.length} queue item(s)`,
              module: "Operations",
              recordId: ids.join(","),
              recordLabel: userName(ownerId),
              entityId: prev.queueItems.find((q) => q.id === ids[0])?.entityId ?? "sa",
              to: userName(ownerId),
            }),
          ),
        setQueueStatus: (id, status) =>
          setDb((prev) => {
            const q = prev.queueItems.find((x) => x.id === id);
            if (!q) return prev;
            return pushActivity({ ...prev, queueItems: prev.queueItems.map((x) => (x.id === id ? { ...x, status } : x)) }, {
              action: "Changed queue status",
              module: "Operations",
              recordId: id,
              recordLabel: q.title,
              entityId: q.entityId,
              from: q.status,
              to: status,
            });
          }),
        addInvoice: (i) => {
          const inv: Invoice = { ...i, id: uid("inv") };
          setDb((prev) => pushActivity({ ...prev, invoices: [inv, ...prev.invoices] }, { action: "Created invoice", module: "Finance", recordId: inv.id, recordLabel: inv.number, entityId: inv.entityId, to: inv.status }));
          return inv;
        },
        setInvoiceStatus: (id, status) =>
          setDb((prev) => {
            const inv = prev.invoices.find((x) => x.id === id);
            if (!inv) return prev;
            return pushActivity({ ...prev, invoices: prev.invoices.map((x) => (x.id === id ? { ...x, status } : x)) }, {
              action: "Changed invoice status",
              module: "Finance",
              recordId: id,
              recordLabel: inv.number,
              entityId: inv.entityId,
              from: inv.status,
              to: status,
            });
          }),
        addPayment: (p) =>
          setDb((prev) => {
            const payment: Payment = { ...p, id: uid("p") };
            const invoices = prev.invoices.map((inv) => {
              if (inv.id !== p.invoiceId) return inv;
              const paid = inv.paid + p.amount;
              const status: Invoice["status"] = paid >= inv.amount ? "Paid" : "Partially Paid";
              return { ...inv, paid, status };
            });
            const inv = prev.invoices.find((x) => x.id === p.invoiceId);
            return pushActivity({ ...prev, payments: [payment, ...prev.payments], invoices }, {
              action: "Recorded payment",
              module: "Finance",
              recordId: p.invoiceId,
              recordLabel: inv?.number ?? p.invoiceId,
              entityId: p.entityId,
              to: `${p.currency} ${p.amount}`,
            });
          }),
        requestAccount: (r) =>
          setDb((prev) => {
            const req: CoaRequest = { ...r, id: `COA-${++counter}`, status: "Pending Review", requestedAt: seed.TODAY, requestedBy: currentUserId };
            const approval: Approval = {
              id: `AP-${counter}`,
              type: "COA Creation",
              title: `New account ${req.code} — ${req.name}`,
              requesterId: currentUserId,
              approverId: "u3",
              entityId: req.entityId,
              submittedAt: seed.TODAY,
              status: "Pending",
              linkTo: "/finance/coa",
            };
            return pushActivity({ ...prev, coaRequests: [req, ...prev.coaRequests], approvals: [approval, ...prev.approvals] }, {
              action: "Requested new COA account",
              module: "Finance",
              recordId: req.id,
              recordLabel: `${req.code} ${req.name}`,
              entityId: req.entityId,
            });
          }),
        decideCoaRequest: (id, decision) =>
          setDb((prev) => {
            const req = prev.coaRequests.find((r) => r.id === id);
            if (!req) return prev;
            const accounts =
              decision === "Approved"
                ? [
                    ...prev.accounts,
                    {
                      code: req.code,
                      name: req.name,
                      type: req.type,
                      category: "Requested",
                      entities: [req.entityId],
                      currencyBehaviour: "Local",
                      active: true,
                      createdBy: req.requestedBy,
                      approvedBy: currentUserId,
                      effectiveDate: seed.TODAY,
                    } satisfies Account,
                  ].sort((a, b) => a.code.localeCompare(b.code))
                : prev.accounts;
            return pushActivity(
              {
                ...prev,
                accounts,
                coaRequests: prev.coaRequests.map((r) => (r.id === id ? { ...r, status: decision, decidedBy: currentUserId } : r)),
                approvals: prev.approvals.map((a) => (a.title.includes(req.code) && a.type === "COA Creation" ? { ...a, status: decision } : a)),
              },
              { action: `COA request ${decision.toLowerCase()}`, module: "Finance", recordId: id, recordLabel: `${req.code} ${req.name}`, entityId: req.entityId, from: "Pending Review", to: decision },
            );
          }),
        decideApproval: (id, decision) =>
          setDb((prev) => {
            const ap = prev.approvals.find((a) => a.id === id);
            if (!ap) return prev;
            return pushActivity({ ...prev, approvals: prev.approvals.map((a) => (a.id === id ? { ...a, status: decision } : a)) }, {
              action: `Approval ${decision.toLowerCase()}`,
              module: "Approvals",
              recordId: id,
              recordLabel: ap.title,
              entityId: ap.entityId,
              from: ap.status,
              to: decision,
            });
          }),
        markNotification: (id, read) => setDb((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read } : n)) })),
        markAllNotificationsRead: () => setDb((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) })),
        addExpense: (e) =>
          setDb((prev) => pushActivity({ ...prev, expenses: [{ ...e, id: uid("e") }, ...prev.expenses] }, { action: "Created expense", module: "Finance", recordId: e.description, recordLabel: e.description, entityId: e.entityId })),
        addFile: (f) => setDb((prev) => ({ ...prev, files: [{ ...f, id: uid("f") }, ...prev.files] })),
        addEntity: (e) =>
          setDb((prev) =>
            pushActivity({ ...prev, entities: [...prev.entities, { ...e, id: e.country.toLowerCase() + (prev.entities.length + 1) }] }, {
              action: "Created entity",
              module: "Admin",
              recordId: e.name,
              recordLabel: e.legalName,
              entityId: "sa",
            }),
          ),
        addUser: (u) =>
          setDb((prev) => pushActivity({ ...prev, users: [...prev.users, { ...u, id: uid("u"), lastLogin: "—" }] }, { action: "Created user", module: "Admin", recordId: u.email, recordLabel: u.name, entityId: u.entityId })),
        setUserStatus: (id, status) =>
          setDb((prev) => {
            const u = prev.users.find((x) => x.id === id);
            if (!u) return prev;
            return pushActivity({ ...prev, users: prev.users.map((x) => (x.id === id ? { ...x, status } : x)) }, {
              action: "Changed user status",
              module: "Admin",
              recordId: id,
              recordLabel: u.name,
              entityId: u.entityId,
              from: u.status,
              to: status,
            });
          }),
        toggleAutomation: (id) =>
          setDb((prev) => ({ ...prev, automationRules: prev.automationRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
        setSeatStatus: (id, status) =>
          setDb((prev) => {
            const s = prev.saasSeats.find((x) => x.id === id);
            if (!s) return prev;
            return pushActivity({ ...prev, saasSeats: prev.saasSeats.map((x) => (x.id === id ? { ...x, status } : x)) }, {
              action: "Changed SaaS seat status",
              module: "Admin",
              recordId: id,
              recordLabel: `${s.app} — ${userName(s.userId)}`,
              entityId: prev.users.find((u) => u.id === s.userId)?.entityId ?? "sa",
              from: s.status,
              to: status,
            });
          }),
      },
    };
  }, [db, scope, currentUser, currentUserId, log]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
