import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Languages,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { TrygcLogo } from "@/components/brand";
import { navGroups } from "@/components/layout/nav-config";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickCreate, QUICK_CREATE_KINDS, type QuickCreateKind } from "@/components/layout/quick-create";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import { ExportQueueButton } from "@/components/export-queue-panel";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { db, currentUser } = useApp();
  const { t, lang } = useLang();

  const counts = useMemo(
    () => ({
      approvals: db.approvals.filter((a) => a.status === "Pending").length,
      alerts: db.notifications.filter((n) => !n.read).length,
      tasks: db.tasks.filter((x) => x.ownerId === currentUser.id && x.status !== "Done").length,
    }),
    [db.approvals, db.notifications, db.tasks, currentUser.id],
  );

  return (
    <nav className="space-y-5 px-2 pb-8">
      {navGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {lang === "ar" ? group.labelAr : group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
              const badge = item.badge ? counts[item.badge] : 0;
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  onClick={onNavigate}
                  title={collapsed ? t(item.label, item.labelAr) : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{t(item.label, item.labelAr)}</span>}
                  {!collapsed && badge > 0 && (
                    <Badge variant="secondary" className="ms-auto h-5 min-w-5 justify-center px-1 text-[11px]">
                      {badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { db, scope, setScope, currentUser, setCurrentUserId, entityName, actions } = useApp();
  const { t, lang, toggleLang, dir } = useLang();
  const { dark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quick, setQuick] = useState<{ open: boolean; kind: QuickCreateKind }>({ open: false, kind: "Lead" });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const unread = db.notifications.filter((n) => !n.read);
  const Collapse = dir === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-e bg-background transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-[268px]",
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-0")}>
          <Link to="/" className="flex items-center">
            <TrygcLogo collapsed={collapsed} />
          </Link>
        </div>
        <ScrollArea className="flex-1 py-3">
          <NavLinks collapsed={collapsed} />
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed((c) => !c)}>
            <Collapse className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span className="ms-1">{t("Collapse", "طي القائمة")}</span>}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <PanelLeft className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b px-4">
                <TrygcLogo />
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)] py-3">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-md"
          >
            <Search className="size-4" />
            <span className="truncate">{t("Search clients, campaigns, invoices…", "ابحث عن العملاء والحملات والفواتير…")}</span>
            <kbd className="ms-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:block">⌘K</kbd>
          </button>

          <div className="ms-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden gap-2 md:flex">
                  <Globe className="size-4" />
                  <span className="max-w-[140px] truncate">{scope === "group" ? t("Group (all entities)", "المجموعة (كل الكيانات)") : entityName(scope)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t("Scope", "النطاق")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setScope("group")}>
                  <Globe className="size-4" /> {t("Group (SAR consolidated)", "المجموعة (موحّد بالريال)")}
                  {scope === "group" && <Check className="ms-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {db.entities.map((e) => (
                  <DropdownMenuItem key={e.id} onClick={() => setScope(e.id)}>
                    <Building2 className="size-4" /> {e.name} · {e.currency}
                    {scope === e.id && <Check className="ms-auto size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">{t("Create", "إنشاء")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {QUICK_CREATE_KINDS.map((k) => (
                  <DropdownMenuItem key={k} onClick={() => setQuick({ open: true, kind: k })}>
                    {k}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ExportQueueButton />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  {unread.length > 0 && (
                    <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {unread.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  {t("Notifications", "الإشعارات")}
                  <button className="text-xs font-normal text-primary" onClick={() => actions.markAllNotificationsRead()}>
                    {t("Mark all read", "تعليم الكل كمقروء")}
                  </button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {db.notifications.slice(0, 12).map((n) => (
                    <DropdownMenuItem key={n.id} onClick={() => actions.markNotification(n.id, true)} className="flex-col items-start gap-0.5">
                      <div className="flex w-full items-center gap-2">
                        <span className={cn("size-1.5 shrink-0 rounded-full", n.read ? "bg-muted-foreground/40" : "bg-primary")} />
                        <span className="truncate text-sm font-medium">{n.title}</span>
                      </div>
                      <span className="ps-3.5 text-xs text-muted-foreground">{n.detail}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleLang} title={t("Switch to Arabic", "التبديل إلى الإنجليزية")}>
              <Languages className="size-4" />
              <span className="sr-only">{lang}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-start leading-tight xl:block">
                    <span className="block text-sm font-medium">{currentUser.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{currentUser.role}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{currentUser.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {currentUser.role} · {entityName(currentUser.entityId)} · {t("Last login", "آخر دخول")} {shortDate(currentUser.lastLogin)}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">{t("Switch demo user (RBAC)", "تبديل المستخدم (الصلاحيات)")}</DropdownMenuLabel>
                <div className="max-h-72 overflow-y-auto">
                  {db.users.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => setCurrentUserId(u.id)}>
                      <span className="truncate">{u.name}</span>
                      <span className="ms-auto text-[11px] text-muted-foreground">{u.role}</span>
                      {u.id === currentUser.id && <Check className="ms-1 size-3.5" />}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onQuickCreate={(k) => setQuick({ open: true, kind: k as QuickCreateKind })} />
      <QuickCreate open={quick.open} kind={quick.kind} onOpenChange={(v) => setQuick((q) => ({ ...q, open: v }))} />
    </div>
  );
}
