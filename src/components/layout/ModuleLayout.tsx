import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { AppHeader, type Crumb } from "./AppHeader";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Conteo opcional (p. ej. total de docentes) */
  count?: ReactNode;
  end?: boolean;
}

export interface NavGroup {
  id: string;
  label?: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface ModuleLayoutProps {
  title: string;
  groups: NavGroup[];
  baseCrumbs?: Crumb[];
}

const COLLAPSE_KEY = "ceprunsa:sidebar-collapsed";
const GROUPS_KEY = "ceprunsa:sidebar-groups";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento no disponible: el menú vuelve a su estado por defecto
  }
}

/** Header guinda + menú lateral marino colapsable (iconos) y panel en móvil */
export function ModuleLayout({ title, groups, baseCrumbs = [] }: ModuleLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => readStorage(COLLAPSE_KEY, false));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    readStorage(GROUPS_KEY, Object.fromEntries(groups.map((g) => [g.id, g.defaultOpen ?? true]))),
  );

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => writeStorage(COLLAPSE_KEY, collapsed), [collapsed]);
  useEffect(() => writeStorage(GROUPS_KEY, openGroups), [openGroups]);

  const activeItem = groups
    .flatMap((g) => g.items)
    .filter((item) => location.pathname.startsWith(item.to))
    .sort((a, b) => b.to.length - a.to.length)[0];

  const crumbs: Crumb[] = [...baseCrumbs, { label: title }, ...(activeItem ? [{ label: activeItem.label, to: activeItem.to }] : [])];

  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const renderNav = (rail: boolean) => (
    <nav aria-label={title} className={cn("flex flex-1 flex-col gap-0.5", rail && "items-center")}>
      {groups.map((group, gi) => {
        const open = rail || !group.label || (openGroups[group.id] ?? true);
        return (
          <div key={group.id} className={cn("flex flex-col gap-0.5", rail && "items-center")}>
            {rail && gi > 0 && <span className="my-2 h-px w-7 bg-white/10" aria-hidden="true" />}
            {!rail && group.label && (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
                className="mt-2 flex h-8 w-full cursor-pointer items-center justify-between rounded-lg px-2.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-white/5"
              >
                {group.label}
                {open ? <FiChevronDown aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
              </button>
            )}
            {open &&
              group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={rail ? item.label : undefined}
                  aria-label={rail ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-[10px] text-[13.5px] transition-colors",
                      rail ? "size-11 justify-center" : "h-[38px] w-full justify-between gap-2.5 px-2.5",
                      isActive
                        ? "bg-guinda-700 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(210,174,109,0.5)]"
                        : "text-[#C9CCE0] hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2.5">
                        <span className={cn("text-[17px]", isActive && rail ? "text-white" : "")}>{item.icon}</span>
                        {!rail && item.label}
                      </span>
                      {!rail && item.count !== undefined && (
                        <span className={cn("tabular text-[11px] font-bold", isActive ? "text-oro-300" : "text-marino-300")}>{item.count}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader crumbs={crumbs} onOpenMenu={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col gap-2 overflow-y-auto bg-marino-900 py-3 lg:flex",
            collapsed ? "w-[68px] items-center px-0" : "w-[264px] px-3",
          )}
        >
          {!collapsed && <span className="px-2.5 pb-1 pt-1 font-display text-sm font-bold text-white">{title}</span>}
          {renderNav(collapsed)}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-[10px] text-[13px] text-[#C9CCE0] hover:bg-white/5 hover:text-white",
              collapsed ? "size-11 justify-center" : "h-10 px-2.5",
            )}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : undefined}
          >
            {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            {!collapsed && "Contraer menú"}
          </button>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-marino-900/50 lg:hidden" onMouseDown={() => setMobileOpen(false)}>
            <aside
              className="flex h-full w-[284px] flex-col gap-2 overflow-y-auto bg-marino-900 px-3 py-4"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2.5 pb-2">
                <span className="font-display text-sm font-bold text-white">{title}</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-white hover:bg-white/10"
                >
                  <FiX />
                </button>
              </div>
              {renderNav(false)}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/** Header guinda con ruta, sin menú lateral (módulos de una sola pantalla) */
export function SimpleLayout({ crumbs, greeting, subtitle, children }: {
  crumbs?: Crumb[];
  greeting?: boolean;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader crumbs={crumbs} greeting={greeting} subtitle={subtitle} />
      {children ?? <Outlet />}
    </div>
  );
}
