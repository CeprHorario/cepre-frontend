import { useQuery } from '@tanstack/react-query';
import { HourSessionsServices } from '@/services/HourSessionsServices';
import { formatTimeToHHMM } from '@/utils/formatTime';

export const useHourSessions = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hourSessions'],
    queryFn: HourSessionsServices.getHourSessions,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  // Formatear las horas a HH:mm
  const formattedData = data ? data.map(session => ({
    ...session,
    startTime: formatTimeToHHMM(session.startTime),
    endTime: formatTimeToHHMM(session.endTime),
  })) : [];

  // Generar arrays únicos de horas inicio y fin
  const horasIni = formattedData ? [...new Set(formattedData.map(h => h.startTime))].sort() : [];
  const horasFin = formattedData ? [...new Set(formattedData.map(h => h.endTime))].sort() : [];

  // Agrupar por shift
  const hoursByShift = formattedData ? formattedData.reduce((acc, session) => {
    const shiftName = session.shift?.name || 'Sin turno';
    if (!acc[shiftName]) acc[shiftName] = [];
    acc[shiftName].push(session);
    return acc;
  }, {}) : {};

  return {
    hourSessions: formattedData || [],
    horasIni,
    horasFin,
    hoursByShift,
    loading: isLoading,
    error,
    refetch,
  };
};
