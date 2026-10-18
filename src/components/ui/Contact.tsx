import type { ReactNode } from "react";
import { FiCopy } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { copyPhone, gmailComposeUrl } from "@/lib/contact";
import { formatPhone } from "@/lib/format";
import { IconButton } from "./Button";

/** Regla única de contacto (docs/ROLES.md): un correo abre la redacción de Gmail, un celular se copia */
export function EmailLink({ email, className, children }: { email: string; className?: string; children?: ReactNode }) {
  return (
    <a href={gmailComposeUrl(email)} target="_blank" rel="noopener noreferrer" title="Redactar en Gmail" className={cn("min-w-0 font-semibold", className)}>
      {children ?? <span className="break-all">{email}</span>}
    </a>
  );
}

export function PhoneCopy({ phone, className, icon }: { phone: string; className?: string; icon?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => copyPhone(phone)}
      title="Copiar número"
      className={cn("inline-flex cursor-pointer items-center gap-1.5 font-semibold hover:underline", className)}
    >
      {icon}
      {formatPhone(phone)}
      <FiCopy aria-hidden="true" className="text-ink-500" />
    </button>
  );
}

export function CopyPhoneIconButton({ phone, name }: { phone: string; name?: string }) {
  return (
    <IconButton label={name ? `Copiar número de ${name}` : "Copiar número"} onClick={() => copyPhone(phone)}>
      <FiCopy />
    </IconButton>
  );
}
