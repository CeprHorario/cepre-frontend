import { createBrowserRouter, Navigate } from "react-router-dom";
import { FiBookOpen, FiHome, FiShield, FiStar, FiUser, FiUsers } from "react-icons/fi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import { useClasses, useCoordinators, useCourses, useMonitors, useSupervisors, useTeachers } from "@/api/queries";
import { RequireRole, SessionGate } from "@/auth/guards";
import { useAuth } from "@/auth/AuthProvider";
import { useCoordinatorCourseName } from "@/features/coordinador/useCoordinatorCourse";
import { ModuleLayout, type NavGroup } from "@/components/layout/ModuleLayout";
import { AdminHub } from "@/features/admin/AdminHub";
import { ConfiguracionPage } from "@/features/admin/configuracion/ConfiguracionPage";
import { CursosPage } from "@/features/admin/cursos/CursosPage";
import { AsignarSalonesPage } from "@/features/admin/docentes/AsignarSalonesPage";
import { DocentesPage } from "@/features/admin/docentes/DocentesPage";
import { HorarioDocentePage } from "@/features/admin/docentes/HorarioDocentePage";
import { GenerarProcesoPage } from "@/features/admin/generar/GenerarProcesoPage";
import { ImportarPage } from "@/features/admin/importar/ImportarPage";
import { CoordinadoresPage } from "@/features/admin/personas/CoordinadoresPage";
import { MonitoresPage } from "@/features/admin/personas/MonitoresPage";
import { SupervisoresPage } from "@/features/admin/personas/SupervisoresPage";
import { SupervisorMonitoresPage } from "@/features/admin/personas/SupervisorMonitoresPage";
import { SalonDetallePage } from "@/features/admin/salones/SalonDetallePage";
import { SalonesPage } from "@/features/admin/salones/SalonesPage";
import { DocentePanel } from "@/features/docente/DocentePanel";
import { MonitorPanel } from "@/features/monitor/MonitorPanel";
import { SupervisorPanel } from "@/features/supervisor/SupervisorPanel";
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

function CoordinadorDocentes() {
  const { user } = useAuth();
  const general = user?.coordinatorCourseId == null;
  const courseName = useCoordinatorCourseName(user?.coordinatorCourseId);
  return (
    <DocentesPage
      basePath="/coordinador/docentes"
      readOnly
      showCourseFilter={general}
      description={general ? "Consulta de todos los docentes y sus horarios" : `Docentes de ${courseName ?? "tu curso"}`}
    />
  );
}

function CoordinadorSalones() {
  const { user } = useAuth();
  return <SalonesPage basePath="/coordinador/salones" readOnly allowDetail={user?.coordinatorCourseId == null} />;
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
          { index: true, element: <AdminHub /> },
          { path: "generar", element: <GenerarProcesoPage /> },
          { path: "importar", element: <ImportarPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
          { path: "partes", element: <PartsPage /> },
          {
            path: "gestionar",
            element: <GestionarLayout />,
            children: [
              { index: true, element: <Navigate to="docentes" replace /> },
              { path: "docentes", element: <DocentesPage basePath={`${G}/docentes`} /> },
              { path: "docentes/:id/asignar", element: <AsignarSalonesPage basePath={`${G}/docentes`} /> },
              { path: "docentes/:id/horario", element: <HorarioDocentePage basePath={`${G}/docentes`} /> },
              { path: "monitores", element: <MonitoresPage /> },
              { path: "supervisores", element: <SupervisoresPage basePath={`${G}/supervisores`} /> },
              { path: "supervisores/:id/monitores", element: <SupervisorMonitoresPage basePath={`${G}/supervisores`} /> },
              { path: "coordinadores", element: <CoordinadoresPage /> },
              { path: "salones", element: <SalonesPage basePath={`${G}/salones`} /> },
              { path: "salones/:id", element: <SalonDetallePage basePath={`${G}/salones`} /> },
              { path: "cursos", element: <CursosPage /> },
            ],
          },
        ],
      },
      {
        path: "docente",
        element: <RequireRole roles={["profesor", "docente"]} />,
        children: [{ index: true, element: <DocentePanel /> }],
      },
      {
        path: "monitor",
        element: <RequireRole roles={["monitor"]} />,
        children: [{ index: true, element: <MonitorPanel /> }, { path: "partes", element: <PartsPage /> }],
      },
      {
        path: "supervisor",
        element: <RequireRole roles={["supervisor"]} />,
        children: [{ index: true, element: <SupervisorPanel /> }, { path: "partes", element: <PartsPage /> }],
      },
      {
        path: "coordinador",
        element: <RequireRole roles={["coordinador"]} />,
        children: [
          {
            element: <CoordinadorLayout />,
            children: [
              { index: true, element: <Navigate to="docentes" replace /> },
              { path: "docentes", element: <CoordinadorDocentes /> },
              { path: "docentes/:id/horario", element: <HorarioDocentePage basePath="/coordinador/docentes" readOnly /> },
              { path: "salones", element: <CoordinadorSalones /> },
              { path: "salones/:id", element: <SalonDetallePage basePath="/coordinador/salones" readOnly /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
