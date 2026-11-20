import { Link } from "react-router-dom";
import { AdminOverview } from './AdminOverview';
import './admin-overview.css';
import { FiArrowRight, FiCalendar, FiDatabase, FiLink, FiShield, FiSliders, FiUpload, FiUserPlus, FiBarChart2, FiRepeat, FiFlag } from "react-icons/fi";
import type { ReactNode } from "react";
import background from "@/assets/cepr-background.jpg";
import { QueryFeedback } from '@/components/ui/QueryFeedback';
import {
  useClasses,
  useCoordinators,
  useCourses,
  useCurrentAdmission,
  useMonitors,
  useRuntimeConfig,
  useSupervisors,
  useTeachers,
} from "@/api/queries";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Spinner";
import { areaStyle } from "@/lib/areas";
import { daysUntil, formatDate, formatNumber } from "@/lib/format";
import { toHHMM } from "@/lib/schedule";
import { cn } from "@/lib/cn";

export function AdminHub() {
  const admission = useCurrentAdmission();
  const classes = useClasses();
  const teachers = useTeachers({ page: 1, limit: 1 });
  const monitors = useMonitors({ page: 1, limit: 1 });
  const supervisors = useSupervisors({ page: 1, limit: 1 });
  const coordinators = useCoordinators({ page: 1, limit: 1 });
  const courses = useCourses();
  const config = useRuntimeConfig();

  const list = classes.data ?? [];
  const complete = list.filter((c) => c.status === "COMPLETO").length;
  const missingTeachers = list.length - complete;
  const withoutLinks = list.filter((c) => !c.urlMeet || !c.urlClassroom).length;
  const shifts = [...new Map(list.map((c) => [c.shift.id, c.shift])).values()].sort((a, b) => a.id - b.id);
  const areas = [...new Map(list.map((c) => [c.area.id, c.area])).values()].sort((a, b) => a.id - b.id);
  const startsIn = admission.data ? daysUntil(admission.data.started) : null;

  return (
    <SimpleLayout greeting showNotice={false}>
      <section className="relative overflow-hidden bg-marino-900">
        <div className="absolute inset-0 bg-cover opacity-[0.18]" style={{ backgroundImage: `url(${background})`, backgroundPosition: "center 40%" }} />
        <div className="relative mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-5 pb-20 pt-7 sm:px-10">
          <div className="flex flex-col gap-2.5 text-white">
            <SectionLabel className="text-oro-500">Menú principal</SectionLabel>
            {admission.isLoading ? (
              <Skeleton className="h-9 w-72 bg-white/10" />
            ) : (
              <h1 className="font-display text-3xl font-extrabold sm:text-[34px]">{admission.data?.description ?? admission.data?.name}</h1>
            )}
            {admission.data && (
              <span className="text-[15px] text-white/80">
                {formatDate(admission.data.started)} – {formatDate(admission.data.finished)} · {shifts.length} turnos · {list.length} salones
              </span>
            )}
          </div>
          {startsIn !== null && <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white">{startsIn>0?`Inicia en ${startsIn} días`:startsIn===0?'Inicia hoy':'Proceso en curso'}</span>}
        </div>
      </section>

      <main className="relative mx-auto -mt-12 flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-10 sm:px-10">
        <QueryFeedback query={admission} label="proceso" />
        <QueryFeedback query={classes} label="salones" />
        <AdminOverview classCount={classes.isError?undefined:classes.data?.length} complete={classes.data&&!classes.isError?complete:undefined} teachers={teachers.isError?undefined:teachers.data?.total}>
          <details className="admin-process-details"><summary><span>Detalle del proceso</span><span>{classes.data&&!classes.isError?`${withoutLinks} salones sin enlaces · ${shifts.length} turnos`:'Consultar pendientes y distribución'}</span></summary>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <h2 className="pb-1 font-display text-lg font-bold text-marino-900">Pendientes del proceso</h2>
            {classes.isLoading ? (
              <div className="flex flex-col gap-3 pt-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : classes.isError ? <p role="alert" className="text-sm text-danger-700">No se pueden determinar los pendientes hasta recuperar los salones.</p> : (
              <ul className="flex flex-col">
                <Pending
                  show={missingTeachers > 0}
                  icon={<FiUserPlus />}
                  tone="danger"
                  title={`${formatNumber(missingTeachers)} salones con docentes faltantes`}
                  description="Al menos un curso del salón no tiene docente asignado."
                  to="/admin/gestionar/salones?estado=faltan"
                  action="Ver salones"
                />
                <Pending
                  show={withoutLinks > 0}
                  icon={<FiLink />}
                  tone="warn"
                  title={`${formatNumber(withoutLinks)} salones sin enlace de Meet o Classroom`}
                  description="Cada monitor puede registrarlos desde su panel."
                  to="/admin/gestionar/salones?estado=sin-enlaces"
                  action="Revisar"
                />
                <Pending
                  show={supervisors.data?.total === 0}
                  icon={<FiShield />}
                  tone="info"
                  title="No hay supervisores registrados"
                  description="Los monitores quedan sin seguimiento."
                  to="/admin/gestionar/supervisores"
                  action="Crear supervisor"
                />
                {missingTeachers === 0 && withoutLinks === 0 && supervisors.data?.total !== 0 && (
                  <li className="py-6 text-center text-sm text-ink-500">No hay pendientes. Todo listo para el proceso.</li>
                )}
              </ul>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-bold text-marino-900">Salones por turno</h2>
            {shifts.map((shift) => {
              const inShift = list.filter((c) => c.shift.id === shift.id);
              return (
                <div key={shift.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[13px]">
                    <strong>
                      {shift.name} · {toHHMM(shift.startTime)} – {toHHMM(shift.endTime)}
                    </strong>
                    <span className="tabular text-ink-500">{inShift.length}</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-line-soft">
                    {areas.map((area) => {
                      const count = inShift.filter((c) => c.area.id === area.id).length;
                      return <div key={area.id} style={{ width: `${(count / Math.max(list.length, 1)) * 100}%`, background: areaStyle(area.name).dot }} />;
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-4 text-xs text-ink-500">
              {areas.map((area) => (
                <span key={area.id} className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: areaStyle(area.name).dot }} />
                  {area.name} {list.filter((c) => c.area.id === area.id).length}
                </span>
              ))}
            </div>
          </Card>
        </section>
          </details>
        </AdminOverview>

        <section aria-label="Módulos" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ModuleTile to="/admin/partes" icon={<FiCalendar />} iconClass="bg-guinda-50 text-guinda-700" title="Partes diarios" description="Registro, seguimiento, reemplazos y reportes del proceso." footer={<TileLink to="/admin/partes">Administrar partes</TileLink>} />
          <ModuleTile
            to="/admin/generar"
            icon={<FiCalendar />}
            iconClass="bg-guinda-50 text-guinda-700"
            title="Generar proceso"
            description="Crea un proceso de admisión con turnos, salones y horarios automáticos."
            footer={<TileLink to="/admin/generar">Nuevo proceso</TileLink>}
          />
          <ModuleTile
            to="/admin/gestionar/docentes"
            icon={<FiDatabase />}
            iconClass="bg-marino-50 text-marino-900"
            title="Gestionar datos"
            description="Usuarios, salones y cursos del proceso actual."
            footer={
              <div className="flex flex-wrap gap-1.5">
                <Shortcut to="/admin/gestionar/docentes" label="Docentes" value={teachers.data?.total} />
                <Shortcut to="/admin/gestionar/monitores" label="Monitores" value={monitors.data?.total} />
                <Shortcut to="/admin/gestionar/salones" label="Salones" value={classes.data?.length} />
                <Shortcut to="/admin/gestionar/cursos" label="Cursos" value={courses.data?.length} />
                <Shortcut to="/admin/gestionar/supervisores" label="Supervisores" value={supervisors.data?.total} />
                <Shortcut to="/admin/gestionar/coordinadores" label="Coordinadores" value={coordinators.data?.total} />
              </div>
            }
          />
          <ModuleTile
            to="/admin/importar"
            icon={<FiUpload />}
            iconClass="bg-oro-100 text-oro-700"
            title="Importar archivos"
            description="Carga docentes, monitores o supervisores desde Excel, CSV o JSON."
            footer={<TileLink to="/admin/importar">Subir archivo</TileLink>}
          />
          <ModuleTile
            to="/admin/configuracion"
            icon={<FiSliders />}
            iconClass="bg-[#F1F2F5] text-ink-700"
            title="Configurar sistema"
            description="Modo mantenimiento y proceso visible para cada rol."
            footer={
              <span className="flex items-center gap-2 text-xs text-ink-500">
                <span className={cn("size-2 rounded-full", config.data?.maintenance.enabled ? "bg-danger-600" : "bg-ok-600")} />
                {config.data ? (config.data.maintenance.enabled ? "Mantenimiento activo" : "Mantenimiento inactivo") : "…"}
              </span>
            }
          />
          <ModuleTile to="/admin/solicitudes" icon={<FiRepeat />} iconClass="bg-oro-100 text-oro-700" title="Solicitudes y reemplazos" description="Revisa solicitudes, decide reemplazos y consulta sus documentos de respaldo." footer={<TileLink to="/admin/solicitudes">Administrar solicitudes</TileLink>} />
          <ModuleTile to="/admin/reportes" icon={<FiBarChart2 />} iconClass="bg-marino-50 text-marino-900" title="Reportes de seguimiento" description="Consulta y exporta el seguimiento del personal y las observaciones del proceso." footer={<TileLink to="/admin/reportes">Consultar reportes</TileLink>} />
          <ModuleTile to="/admin/incidencias" icon={<FiFlag />} iconClass="bg-guinda-50 text-guinda-700" title="Incidencias e historial" description="Registra incidencias y consulta los antecedentes del personal entre procesos." footer={<TileLink to="/admin/incidencias">Administrar incidencias</TileLink>} />
        </section>

      </main>
    </SimpleLayout>
  );
}

function ModuleTile({ to, icon, iconClass, title, description, footer }: {
  to: string;
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
  footer: ReactNode;
}) {
  return (
    <div
      className="admin-module-card group flex flex-col gap-3 rounded-xl border border-line bg-white p-4 text-ink-900 shadow-[0_1px_2px_rgba(26,28,43,0.04)] transition hover:border-guinda-700 hover:shadow-[0_14px_34px_rgba(102,17,36,0.12)] motion-reduce:transition-none"
    >
      <Link to={to} className="flex items-start gap-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-[18px]", iconClass)}>{icon}</span>
      <span className="flex flex-col gap-1.5">
        <strong className="font-display text-sm text-marino-900">{title}</strong>
        <span className="text-xs leading-5 text-ink-500">{description}</span>
      </span>
      </Link>
      <div className="mt-auto">{footer}</div>
    </div>
  );
}

function TileLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-xs font-bold text-guinda-700">
      {children}
      <FiArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function Shortcut({ to, label, value }: { to: string; label: string; value?: number }) {
  return (
    <Link
      to={to}
      onClick={(event) => event.stopPropagation()}
      className="inline-flex h-6 items-center gap-1.5 rounded-lg bg-app px-2.5 text-xs font-semibold text-marino-900 hover:bg-marino-50"
    >
      {label} <b className="tabular text-guinda-700">{value ?? "…"}</b>
    </Link>
  );
}

function Pending({ show, icon, tone, title, description, to, action }: {
  show: boolean;
  icon: ReactNode;
  tone: "danger" | "warn" | "info";
  title: string;
  description: string;
  to: string;
  action: string;
}) {
  if (!show) return null;
  const toneClass = tone === "danger" ? "bg-danger-50 text-danger-700" : tone === "warn" ? "bg-warn-50 text-warn-700" : "bg-marino-50 text-marino-700";
  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line-soft py-3.5 last:border-b-0">
      <span className={cn("flex size-10 items-center justify-center rounded-xl", toneClass)}>{icon}</span>
      <div className="flex flex-col gap-0.5">
        <strong className="text-sm">{title}</strong>
        <span className="text-[13px] text-ink-500">{description}</span>
      </div>
      <Link to={to} className="text-[13px] font-bold">
        {action}
      </Link>
    </li>
  );
}
