import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { tokenStore } from "@/api/client";
import { AuthProvider } from "@/auth/AuthProvider";
import { router } from "@/app/router";

// Compatibilidad: algunos enlaces antiguos traen el token en la URL (?token=…)
const urlToken = new URLSearchParams(window.location.search).get("token");
if (urlToken) {
  tokenStore.set(urlToken);
  window.history.replaceState(null, "", window.location.pathname);
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
        <RouterProvider router={router} />
        <ToastContainer position="bottom-right" newestOnTop theme="colored" />
        <Analytics />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
