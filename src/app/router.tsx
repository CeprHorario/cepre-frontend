import { createBrowserRouter, Navigate } from "react-router-dom";
import { FiBookOpen, FiHome, FiShield, FiStar, FiUser, FiUsers } from "react-icons/fi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import { useClasses, useCoordinators, useCourses, useMonitors, useSupervisors, useTeachers } from "@/api/queries";
import { RequireRole, SessionGate } from "@/auth/guards";
import { useAuth } from "@/auth/AuthProvider";
import { useCoordinatorCourseName } from "@/features/coordinador/useCoordinatorCourse";
import { ModuleLayout, type NavGroup } from "@/components/layout/ModuleLayout";
import { PartsPage } from "@/features/partes/PartsPage";
import { NotFoundPage } from "./NotFoundPage";
import { RouteError } from "./RouteError";

const G = "/admin/gestionar";

function GestionarLayout() {
  const teachers = useTeachers({ page: 1, limit: 1 });
  const monitors = useMonitors({ page: 1, limit: 1 });
  const supervisors = useSupervisors({ page: 1, limit: 1 });
  const coordinators = useCoordinators({ page: 1, limit: 1 });
  const classes = useClasses();
  const courses = useCourses();
  const groups: NavGroup[] = [
    { id: "home", items: [{ to: "/admin", label: "Menú principal", icon: <FiHome />, end: true }] },
    {
      id: "usuarios",
      label: "Usuarios",
      items: [
        { to: `${G}/docentes`, label: "Docentes", icon: <FiUsers />, count: teachers.data?.total },
        { to: `${G}/monitores`, label: "Monitores", icon: <FiUser />, count: monitors.data?.total },
        { to: `${G}/supervisores`, label: "Supervisores", icon: <FiShield />, count: supervisors.data?.total },
        { to: `${G}/coordinadores`, label: "Coordinadores", icon: <FiStar />, count: coordinators.data?.total },
      ],
    },
    {
      id: "academico",
      label: "Académico",
      items: [
        { to: `${G}/salones`, label: "Salones", icon: <MdOutlineMeetingRoom />, count: classes.data?.length },
        { to: `${G}/cursos`, label: "Cursos", icon: <FiBookOpen />, count: courses.data?.length },
      ],
    },
  ];
  return <ModuleLayout title="Gestionar datos" groups={groups} baseCrumbs={[{ label: "Menú principal", to: "/admin" }]} />;
}

function CoordinadorLayout() {
  const { user } = useAuth();
  const courseName = useCoordinatorCourseName(user?.coordinatorCourseId);
  const groups: NavGroup[] = [
    {
      id: "consulta",
      items: [
        { to: "/coordinador/docentes", label: "Docentes", icon: <FiUsers /> },
        { to: "/coordinador/salones", label: "Salones", icon: <MdOutlineMeetingRoom /> },
      ],
    },
  ];
  return <ModuleLayout title={courseName ? `Coordinación · ${courseName}` : "Coordinación general"} groups={groups} />;
}

function CoordinadorDocentes({ Page }: { Page: typeof import('@/features/admin/docentes/DocentesPage').DocentesPage }) {
  const { user } = useAuth();
  const general = user?.coordinatorCourseId == null;
  const courseName = useCoordinatorCourseName(user?.coordinatorCourseId);
  return (
    <Page
      basePath="/coordinador/docentes"
      readOnly
      showCourseFilter={general}
      description={general ? "Consulta de todos los docentes y sus horarios" : `Docentes de ${courseName ?? "tu curso"}`}
    />
  );
}

function CoordinadorSalones({ Page }: { Page: typeof import('@/features/admin/salones/SalonesPage').SalonesPage }) {
  const { user } = useAuth();
  return <Page basePath="/coordinador/salones" readOnly allowDetail={user?.coordinatorCourseId == null} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SessionGate />,
    errorElement: <RouteError />,
    children: [
      {
        path: "admin",
        element: <RequireRole roles={["administrador"]} />,
        children: [
          { index: true, lazy: async () => ({ Component: (await import('@/features/admin/AdminHub')).AdminHub }) },
          { path: "generar", lazy: async () => ({ Component: (await import('@/features/admin/generar/GenerarProcesoPage')).GenerarProcesoPage }) },
          { path: "importar", lazy: async () => ({ Component: (await import('@/features/admin/importar/ImportarPage')).ImportarPage }) },
          { path: "configuracion", lazy: async () => ({ Component: (await import('@/features/admin/configuracion/ConfiguracionPage')).ConfiguracionPage }) },
          { path: "solicitudes", lazy: async()=>({Component:(await import('@/features/operations/RequestsPage')).RequestsPage}) }, { path: "partes", element: <PartsPage /> },
          { path: "reportes", lazy: async()=>({Component:(await import('@/features/operations/ReportsPage')).ReportsPage}) }, { path: "incidencias", lazy: async () => ({ Component: (await import('@/features/incidencias/IncidencesPage')).IncidencesPage }) },
          {
            path: "gestionar",
            element: <GestionarLayout />,
            children: [
              { index: true, element: <Navigate to="docentes" replace /> },
              { path: "docentes", lazy: async () => { const { DocentesPage } = await import('@/features/admin/docentes/DocentesPage'); return { Component: () => <DocentesPage basePath={`${G}/docentes`} /> }; } },
              { path: "docentes/:id/asignar", lazy: async () => { const { AsignarSalonesPage } = await import('@/features/admin/docentes/AsignarSalonesPage'); return { Component: () => <AsignarSalonesPage basePath={`${G}/docentes`} /> }; } },
              { path: "docentes/:id/horario", lazy: async () => { const { HorarioDocentePage } = await import('@/features/admin/docentes/HorarioDocentePage'); return { Component: () => <HorarioDocentePage basePath={`${G}/docentes`} /> }; } },
              { path: "monitores", lazy: async () => ({ Component: (await import('@/features/admin/personas/MonitoresPage')).MonitoresPage }) },
              { path: "supervisores", lazy: async () => { const { SupervisoresPage } = await import('@/features/admin/personas/SupervisoresPage'); return { Component: () => <SupervisoresPage basePath={`${G}/supervisores`} /> }; } },
              { path: "supervisores/:id/monitores", lazy: async () => { const { SupervisorMonitoresPage } = await import('@/features/admin/personas/SupervisorMonitoresPage'); return { Component: () => <SupervisorMonitoresPage basePath={`${G}/supervisores`} /> }; } },
              { path: "coordinadores", lazy: async () => ({ Component: (await import('@/features/admin/personas/CoordinadoresPage')).CoordinadoresPage }) },
              { path: "salones", lazy: async () => { const { SalonesPage } = await import('@/features/admin/salones/SalonesPage'); return { Component: () => <SalonesPage basePath={`${G}/salones`} /> }; } },
              { path: "salones/:id", lazy: async () => { const { SalonDetallePage } = await import('@/features/admin/salones/SalonDetallePage'); return { Component: () => <SalonDetallePage basePath={`${G}/salones`} /> }; } },
              { path: "cursos", lazy: async () => ({ Component: (await import('@/features/admin/cursos/CursosPage')).CursosPage }) },
            ],
          },
        ],
      },
      {
        path: "docente",
        element: <RequireRole roles={["profesor", "docente"]} />,
        children: [{ index: true, lazy: async () => ({ Component: (await import('@/features/docente/DocentePanel')).DocentePanel }) }, { path: "solicitudes", lazy: async()=>({Component:(await import('@/features/operations/RequestsPage')).RequestsPage}) }],
      },
      {
        path: "monitor",
        element: <RequireRole roles={["monitor"]} />,
        children: [{ index: true, lazy: async () => ({ Component: (await import('@/features/monitor/MonitorPanel')).MonitorPanel }) }, { path: "solicitudes", lazy: async()=>({Component:(await import('@/features/operations/RequestsPage')).RequestsPage}) }, { path: "partes", element: <PartsPage /> }],
      },
      {
        path: "supervisor",
        element: <RequireRole roles={["supervisor"]} />,
        children: [{ index: true, lazy: async () => ({ Component: (await import('@/features/supervisor/SupervisorPanel')).SupervisorPanel }) }, { path: "solicitudes", lazy: async()=>({Component:(await import('@/features/operations/RequestsPage')).RequestsPage}) }, { path: "partes", element: <PartsPage /> }, { path: "incidencias", lazy: async () => ({ Component: (await import('@/features/incidencias/IncidencesPage')).IncidencesPage }) }],
      },
      {
        path: "coordinador",
        element: <RequireRole roles={["coordinador"]} />,
        children: [
          {
            element: <CoordinadorLayout />,
            children: [
              { index: true, element: <Navigate to="docentes" replace /> },
              { path: "docentes", lazy: async () => { const { DocentesPage } = await import('@/features/admin/docentes/DocentesPage'); return { Component: () => <CoordinadorDocentes Page={DocentesPage} /> }; } },
              { path: "docentes/:id/horario", lazy: async () => { const { HorarioDocentePage } = await import('@/features/admin/docentes/HorarioDocentePage'); return { Component: () => <HorarioDocentePage basePath="/coordinador/docentes" readOnly /> }; } },
              { path: "salones", lazy: async () => { const { SalonesPage } = await import('@/features/admin/salones/SalonesPage'); return { Component: () => <CoordinadorSalones Page={SalonesPage} /> }; } },
              { path: "salones/:id", lazy: async () => { const { SalonDetallePage } = await import('@/features/admin/salones/SalonDetallePage'); return { Component: () => <SalonDetallePage basePath="/coordinador/salones" readOnly /> }; } },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
