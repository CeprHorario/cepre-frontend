import classroomIcon from "@/assets/classroom.png";
import meetIcon from "@/assets/meet.png";
import { cn } from "@/lib/cn";
import { linkState } from "@/lib/validators";

/** Accesos a Meet y Classroom con el logo; atenuados si falta o es inválido */
export function LinkButtons({ meet, classroom, size = "md" }: { meet?: string | null; classroom?: string | null; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-1.5">
      <LinkIcon url={meet} host="meet.google.com" icon={meetIcon} label="Google Meet" size={size} />
      <LinkIcon url={classroom} host="classroom.google.com" icon={classroomIcon} label="Google Classroom" size={size} />
    </div>
  );
}

function LinkIcon({ url, host, icon, label, size }: {
  url?: string | null;
  host: "meet.google.com" | "classroom.google.com";
  icon: string;
  label: string;
  size: "sm" | "md";
}) {
  const state = linkState(url, host);
  const box = cn(
    "inline-flex items-center justify-center rounded-lg border bg-white",
    size === "sm" ? "h-8 px-2" : "h-10 px-3",
  );
  const img = <img src={icon} alt="" className={cn("w-auto", size === "sm" ? "h-4" : "h-5", state !== "ok" && "opacity-35 grayscale")} />;
  if (state === "ok") {
    return (
      <a href={url!} target="_blank" rel="noreferrer" className={cn(box, "border-line hover:border-marino-300")} aria-label={`Abrir ${label}`} title={`Abrir ${label}`}>
        {img}
      </a>
    );
  }
  return (
    <span className={cn(box, "border-dashed border-[#B9BCCB]")} title={state === "missing" ? `${label}: sin enlace` : `${label}: enlace inválido`}>
      {img}
      <span className="sr-only">{state === "missing" ? `${label} sin enlace` : `${label} con enlace inválido`}</span>
    </span>
  );
}
