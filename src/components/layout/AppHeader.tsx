import { NotificationBell } from '@/features/operations/NotificationBell';
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";
import logo from "@/assets/logo-light.png";
import { useCurrentAdmission } from "@/api/queries";
import { ROLE_LABEL, useAuth } from "@/auth/AuthProvider";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";
import './app-header.css';

export interface Crumb {
  label: string;
  to?: string;
}

interface AppHeaderProps {
  appearance?: 'default' | 'parts';
  crumbs?: Crumb[];
  /** Saludo grande (menú principal y paneles de rol) */
  greeting?: boolean;
  subtitle?: string;
  onOpenMenu?: () => void;
  right?: ReactNode;
}

export function AppHeader({ crumbs, greeting, subtitle, onOpenMenu, right, appearance = 'default' }: AppHeaderProps) {
  const { user } = useAuth();
  const admission = useCurrentAdmission(user?.role === "administrador");

  return (
    <header className={cn("app-header cepr-global-header sticky top-0 z-40 flex h-16 items-center justify-between gap-3 pr-3 sm:pr-5", appearance === 'parts' && 'parts-header')}>
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
            <nav aria-label="Ruta" className="header-crumbs flex min-w-0 items-center gap-2 text-sm text-white/80">
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
          <span className="header-process hidden h-9 min-w-0 max-w-[30vw] items-center gap-2 rounded-[9px] border border-oro-500/55 bg-white/5 px-3 text-[13px] font-semibold text-white lg:inline-flex" title={admission.data.description || admission.data.name}>
            <span className="size-2 rounded-full bg-[#7BD3A4]" aria-hidden="true" />
            <span className="truncate">{admission.data.description || admission.data.name}</span>
          </span>
        )}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = () => { setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("mousedown", outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <button
        type="button"
        ref={trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Cuenta de ${[user.firstName,user.lastName].filter(Boolean).join(' ') || user.email}`}
        aria-controls={panelId}
        aria-expanded={open}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 text-white hover:bg-white/10"
      >
        <span className="flex size-9 items-center justify-center rounded-full border-2 border-white/40 bg-marino-900 text-[13px] font-bold">
          {initials(user)}
        </span>
        <FiChevronDown className={cn("hidden transition-transform sm:block motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <section id={panelId} role="region" aria-label="Cuenta de usuario" className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-line bg-white text-ink-900 shadow-pop">
          <div className="flex flex-col gap-0.5 border-b border-line-soft px-4 py-3">
            <strong className="break-words text-sm">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</strong>
            <span className="break-all text-xs text-ink-500">{user.email}</span>
            <span className="mt-1 w-fit rounded-full bg-guinda-50 px-2 py-0.5 text-[11px] font-bold text-guinda-700">{ROLE_LABEL[user.role]}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-semibold text-guinda-700 hover:bg-guinda-50"
          >
            <FiLogOut aria-hidden="true" />
            Cerrar sesión
          </button>
          <button type="button" className="w-full border-t border-line-soft px-4 py-3 text-left text-sm text-ink-700 hover:bg-surface-2" onClick={close}>Cerrar cuenta</button>
        </section>
      )}
    </div>
  );
}
