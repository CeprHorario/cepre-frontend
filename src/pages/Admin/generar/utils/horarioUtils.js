// Función para sumar minutos a una hora
export const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(':').map(Number);
  const totalMin = h * 60 + m + minutos;
  const horas = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Función para calcular hora fin basada en horas pedagógicas
export const calcularHoraFin = (horaInicio, horasPedagogicas) => {
  if (!horaInicio || !horasPedagogicas || horasPedagogicas < 1) {
    return '';
  }
  
  // Cada hora pedagógica = 45 minutos, excepto la última que no tiene descanso
  const totalMinutos = (horasPedagogicas * 45) - 5;
  return sumarMinutos(horaInicio, totalMinutos);
};

// Función para validar horario según hour_sessions
export const validarHorario = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) {
    return { valido: false, error: 'Debe ingresar ambas horas' };
  }

  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const minInicio = h1 * 60 + m1;
  const minFin = h2 * 60 + m2;
  const diffMinutos = minFin - minInicio;

  if (diffMinutos <= 0) {
    return {
      valido: false,
      error: 'La hora de fin debe ser posterior a la hora de inicio',
    };
  }

  // Validar múltiplo de 45 minutos (40 clase + 5 descanso, excepto último bloque)
  const ajustado = diffMinutos + 5;
  const esValido = ajustado % 45 === 0;

  if (esValido) {
    const bloques = ajustado / 45;
    return {
      valido: true,
      bloques,
      mensaje: `✅ Horario válido: ${bloques} hora${bloques > 1 ? 's' : ''} pedagógica${bloques > 1 ? 's' : ''}`,
    };
  }

  // Calcular sugerencias
  const bloquesAbajo = Math.floor(ajustado / 45);
  const bloquesArriba = Math.ceil(ajustado / 45);
  
  const minutosAbajo = (bloquesAbajo * 45) - 5;
  const minutosArriba = (bloquesArriba * 45) - 5;
  
  const horaFinAbajo = sumarMinutos(horaInicio, minutosAbajo);
  const horaFinArriba = sumarMinutos(horaInicio, minutosArriba);

  return {
    valido: false,
    error: `El horario ${horaInicio}-${horaFin} no cumple con bloques de 45 minutos`,
    sugerencias: [
      { bloques: bloquesAbajo, inicio: horaInicio, fin: horaFinAbajo },
      { bloques: bloquesArriba, inicio: horaInicio, fin: horaFinArriba },
    ],
  };
};
