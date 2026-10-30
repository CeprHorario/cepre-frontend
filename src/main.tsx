import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { AuthProvider } from "@/auth/AuthProvider";
import { router } from "@/app/router";
import { PartsSessionProtection } from "@/features/partes/PartsSessionProtection";

// Retira credenciales antiguas; la sesión actual vive en una cookie HttpOnly.
try { localStorage.removeItem('token'); } catch { /* La sesión por cookie no depende de Web Storage. */ }
const cleanUrl = new URL(window.location.href);
if (cleanUrl.searchParams.has('token')) {
  cleanUrl.searchParams.delete('token');
  window.history.replaceState(null, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PartsSessionProtection />
        <RouterProvider router={router} />
        <ToastContainer position="bottom-right" newestOnTop theme="colored" />
        <Analytics />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
