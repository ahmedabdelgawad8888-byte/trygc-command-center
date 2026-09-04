import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
  CalendarRange,
  ClipboardList,
  Coins,
  CreditCard,
  FileSpreadsheet,
  FolderTree,
  Gauge,
  Import,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Receipt,
  MessagesSquare,
  ScrollText,
  Server,
  Settings2,
  ShieldCheck,
  Table2,
  Target,
  UserRound,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  badge?: "approvals" | "alerts" | "tasks";
}

export interface NavGroup {
  label: string;
  labelAr: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Command Center",
    labelAr: "مركز القيادة",
    items: [
      { to: "/dashboard", label: "Executive Overview", labelAr: "النظرة التنفيذية", icon: LayoutDashboard },
      { to: "/workspace", label: "My Workspace", labelAr: "مساحتي", icon: UserRound },
      { to: "/alerts", label: "Alerts & Exceptions", labelAr: "التنبيهات والاستثناءات", icon: AlertTriangle, badge: "alerts" },
      { to: "/approvals", label: "Approvals", labelAr: "الموافقات", icon: BadgeCheck, badge: "approvals" },
      { to: "/activity", label: "Activity Feed", labelAr: "سجل النشاط", icon: Activity },
    ],
  },
  {
    label: "Workspace",
    labelAr: "مساحة العمل",
    items: [
      { to: "/calendar", label: "Calendar & Scheduling", labelAr: "التقويم والجدولة", icon: CalendarRange },
      { to: "/inbox", label: "Email", labelAr: "البريد", icon: Inbox },
      { to: "/chat", label: "Team Chat", labelAr: "محادثة الفريق", icon: MessagesSquare },
    ],
  },
  {
    label: "CRM",
    labelAr: "إدارة العملاء",
    items: [
      { to: "/crm", label: "CRM Dashboard", labelAr: "لوحة المبيعات", icon: Gauge },
      { to: "/crm/leads", label: "Leads", labelAr: "العملاء المحتملون", icon: Target },
      { to: "/crm/deals", label: "Deals & Pipeline", labelAr: "الصفقات", icon: Workflow },
      { to: "/crm/clients", label: "Clients & Client 360", labelAr: "العملاء", icon: Building2 },
      { to: "/crm/activities", label: "Activities & Meetings", labelAr: "الأنشطة", icon: CalendarClock },
    ],
  },
  {
    label: "Campaigns",
    labelAr: "الحملات",
    items: [
      { to: "/campaigns", label: "Campaign Command Center", labelAr: "مركز الحملات", icon: Megaphone },
      { to: "/campaigns/coverage", label: "Posting Coverage", labelAr: "تغطية النشر", icon: ListChecks },
      { to: "/campaigns/influencers", label: "Influencer Directory", labelAr: "دليل صناع المحتوى", icon: Users },
    ],
  },
  {
    label: "Community",
    labelAr: "المجتمع",
    items: [{ to: "/community", label: "Community Workspace", labelAr: "مساحة المجتمع", icon: Boxes }],
  },
  {
    label: "Operations",
    labelAr: "العمليات",
    items: [{ to: "/operations", label: "Operations Queues", labelAr: "طوابير العمليات", icon: Server }],
  },
  {
    label: "Tasks & PMO",
    labelAr: "المهام",
    items: [{ to: "/tasks", label: "Tasks & Kanban", labelAr: "المهام واللوحة", icon: ClipboardList, badge: "tasks" }],
  },
  {
    label: "Finance",
    labelAr: "المالية",
    items: [
      { to: "/finance", label: "Finance Command Center", labelAr: "مركز المالية", icon: Banknote },
      { to: "/finance/entities", label: "Entities", labelAr: "الكيانات", icon: Building2 },
      { to: "/finance/coa", label: "Chart of Accounts", labelAr: "شجرة الحسابات", icon: FileSpreadsheet },
      { to: "/finance/invoices", label: "Invoices & AR", labelAr: "الفواتير", icon: Receipt },
      { to: "/finance/payments", label: "Payments", labelAr: "المدفوعات", icon: CreditCard },
      { to: "/finance/expenses", label: "Expenses & AP", labelAr: "المصروفات", icon: Coins },
      { to: "/finance/fx", label: "Exchange Rates", labelAr: "أسعار الصرف", icon: Table2 },
      { to: "/finance/consolidation", label: "Group Consolidation", labelAr: "التوحيد الجماعي", icon: BarChart3 },
    ],
  },
  {
    label: "Reporting",
    labelAr: "التقارير",
    items: [{ to: "/reports", label: "Reports & Builder", labelAr: "التقارير", icon: BarChart3 }],
  },
  {
    label: "Files",
    labelAr: "الملفات",
    items: [{ to: "/files", label: "Corporate Files", labelAr: "ملفات الشركة", icon: FolderTree }],
  },
  {
    label: "Admin",
    labelAr: "الإدارة",
    items: [
      { to: "/admin/users", label: "Users & Teams", labelAr: "المستخدمون", icon: Users },
      { to: "/admin/roles", label: "Roles & Permissions", labelAr: "الأدوار والصلاحيات", icon: ShieldCheck },
      { to: "/admin/automations", label: "Automation Rules", labelAr: "قواعد الأتمتة", icon: Zap },
      { to: "/admin/integrations", label: "Integration Center", labelAr: "التكاملات", icon: Server },
      { to: "/admin/migration", label: "Import / Migration", labelAr: "الاستيراد والترحيل", icon: Import },
      { to: "/admin/saas", label: "SaaS Access", labelAr: "وصول التطبيقات", icon: KeyRound },
      { to: "/admin/audit", label: "Audit Log", labelAr: "سجل التدقيق", icon: ScrollText },
      { to: "/settings", label: "Settings", labelAr: "الإعدادات", icon: Settings2 },
    ],
  },
];
