import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { LoginPanel } from "./pages/Login/LoginPanel";
import { AdminPanel } from "./pages/Admin/AdminPanel";
import { Importar } from "./pages/Admin/importar/Importar";
import { Gestionar } from "./pages/Admin/gestionar/Gestionar";
import { Generar } from "./pages/Admin/generar/Generar";
import { Home } from "./pages/Admin/Home";
import { DocentePanel } from "./pages/Docente/DocentePanel";
import { MonitorPanel } from "./pages/Monitor/MonitorPanel";
import { SupervisorPanel } from "./pages/Supervisor/SupervisorPanel";
import { HorarioMonitorPanel } from "./pages/Supervisor/HorarioMonitorPanel";
import { CoordinatorPanel } from "./pages/Coordinator/CoordinatorPanel";
import { NotFound } from "./pages/NotFound";
import { GoogleAuthHandler } from "./pages/Login/GoogleAuthHandler";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />, // Protege TODAS las rutas
    children: [
      { path: "/", element: <LoginPanel /> }, // Página de login
      { path: "/login", element: <GoogleAuthHandler /> }, // Callback de autenticación
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            path: "admin/",
            element: <AdminPanel />,
            children: [
              { index: true, element: <Home /> },
              { path: "importar", element: <Importar /> },
              { path: "gestionar", element: <Gestionar /> },              
              { path: "generar", element: <Generar /> },
            ],
          },
          { path: "docente", element: <DocentePanel /> },
          { path: "monitor", element: <MonitorPanel /> },
          { path: "supervisor", element: <SupervisorPanel /> },
          { path: "supervisor/horario", element: <HorarioMonitorPanel /> },
          { path: "coordinador", element: <CoordinatorPanel /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
  { path: "/", element: <LoginPanel /> },
]);
