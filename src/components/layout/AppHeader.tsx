import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";
import logo from "@/assets/logo-light.png";
import { useCurrentAdmission } from "@/api/queries";
import { ROLE_LABEL, useAuth } from "@/auth/AuthProvider";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface Crumb {
  label: string;
  to?: string;
}

interface AppHeaderProps {
  crumbs?: Crumb[];
  /** Saludo grande (menú principal y paneles de rol) */
  greeting?: boolean;
  subtitle?: string;
  onOpenMenu?: () => void;
  right?: ReactNode;
}

export function AppHeader({ crumbs, greeting, subtitle, onOpenMenu, right }: AppHeaderProps) {
  const { user } = useAuth();
  const admission = useCurrentAdmission(user?.role === "administrador");

  return (
    <header className="app-header sticky top-0 z-40 flex h-16 items-center justify-between gap-3 pr-3 sm:pr-5">
      <div className="flex h-full min-w-0 items-center gap-3 sm:gap-4">
        <Link to="/" className="logo-cutout flex h-full shrink-0 items-center pl-4 pr-6 sm:pl-5 sm:pr-7" aria-label="Ir al inicio">
          <img src={logo} alt="CEPRUNSA" className="h-7 w-auto sm:h-8" />
        </Link>
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-white/10 text-white lg:hidden"
          >
            <FiMenu />
          </button>
        )}
        {greeting ? (
          <div className="flex min-w-0 flex-col text-white">
            <span className="truncate font-display text-[15px] font-bold sm:text-base">
              Bienvenido{user?.firstName ? `, ${user.firstName.split(" ")[0]}` : ""}
            </span>
            <span className="truncate text-xs text-white/80">{subtitle ?? (user ? ROLE_LABEL[user.role] : "")}</span>
          </div>
        ) : (
          crumbs && (
            <nav aria-label="Ruta" className="hidden min-w-0 items-center gap-2 text-sm text-white/80 md:flex">
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.to && index < crumbs.length - 1 ? (
                    <Link to={crumb.to} className="truncate text-white/80 hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <strong className="truncate text-white">{crumb.label}</strong>
                  )}
                </span>
              ))}
            </nav>
          )
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {right}
        {admission.data && (
          <span className="hidden h-9 items-center gap-2 rounded-[9px] border border-oro-500/55 bg-white/5 px-3 text-[13px] font-semibold text-white sm:inline-flex">
            <span className="size-2 rounded-full bg-[#7BD3A4]" aria-hidden="true" />
            {admission.data.description || admission.data.name}
          </span>
        )}
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 text-white hover:bg-white/10"
      >
        <span className="flex size-9 items-center justify-center rounded-full border-2 border-white/40 bg-marino-900 text-[13px] font-bold">
          {initials(user)}
        </span>
        <FiChevronDown className={cn("hidden transition-transform sm:block", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-line bg-white text-ink-900 shadow-pop">
          <div className="flex flex-col gap-0.5 border-b border-line-soft px-4 py-3">
            <strong className="truncate text-sm">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</strong>
            <span className="truncate text-xs text-ink-500">{user.email}</span>
            <span className="mt-1 w-fit rounded-full bg-guinda-50 px-2 py-0.5 text-[11px] font-bold text-guinda-700">{ROLE_LABEL[user.role]}</span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-semibold text-guinda-700 hover:bg-guinda-50"
          >
            <FiLogOut aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
