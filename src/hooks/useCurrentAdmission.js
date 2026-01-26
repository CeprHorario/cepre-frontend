import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AdmissionsServices } from '@/services/AdmissionsServices';
import { HourSessionsServices } from '@/services/HourSessionsServices';

export const useCurrentAdmission = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentAdmission'],
    queryFn: AdmissionsServices.getCurrentAdmission,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
  });

  // Obtener los shifts únicos desde hour_sessions
  const { data: hourSessions } = useQuery({
    queryKey: ['hourSessions'],
    queryFn: HourSessionsServices.getHourSessions,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  // Extraer shifts únicos de las hour_sessions (con useMemo para evitar re-renders)
  const shifts = useMemo(() => {
    if (!hourSessions) return [];
    return [...new Map(
      hourSessions.map(session => [session.shift.id, { id: session.shift.id, name: session.shift.name }])
    ).values()];
  }, [hourSessions]);

  return {
    admission: data || null,
    shifts,
    loading: isLoading,
    error,
    refetch,
  };
};
