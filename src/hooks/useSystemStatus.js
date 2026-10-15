import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MAINTENANCE_MODE_EVENT } from "@/constants/systemEvents";
import { SystemServices } from "@/services/SystemServices";

export const useSystemStatus = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["systemStatus"],
    queryFn: SystemServices.getStatus,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: 2,
  });

  useEffect(() => {
    const handleMaintenanceMode = (event) => {
      queryClient.setQueryData(["systemStatus"], {
        maintenance: true,
        message: event.detail?.message,
        endsAt: event.detail?.endsAt ?? null,
      });
    };

    window.addEventListener(MAINTENANCE_MODE_EVENT, handleMaintenanceMode);
    return () =>
      window.removeEventListener(MAINTENANCE_MODE_EVENT, handleMaintenanceMode);
  }, [queryClient]);

  return query;
};
