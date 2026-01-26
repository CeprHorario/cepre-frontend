import React from 'react';

export const ConfiguracionTurnos = ({
  numeroTurnos,
  setNumeroTurnos,
  turnosConfig,
  setTurnosConfig,
  horasPedagogicas,
  calcularHoraFin,
}) => {

  const handleNumeroTurnosChange = (num) => {
    setNumeroTurnos(num);
    // Crear array con turnos vacíos
    const nuevosT = [];
    for (let i = 1; i <= num; i++) {
      nuevosT.push({
        nombre: `Turno ${String(i).padStart(2, '0')}`,
        horaInicio: ''
      });
    }
    setTurnosConfig(nuevosT);
  };

  const handleHoraInicioChange = (index, hora) => {
    const nuevos = [...turnosConfig];
    nuevos[index].horaInicio = hora;
    setTurnosConfig(nuevos);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
      <h2 className="text-xl font-semibold text-[#78211E] border-b border-gray-300 pb-2">
        🕐 Configuración de Turnos
      </h2>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>ℹ️ Información:</strong> {horasPedagogicas} horas pedagógicas por turno (40 min clase + 5 min descanso).
          Solo configure la hora de inicio de cada turno.
        </p>
      </div>

      {/* Selector de número de turnos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Cuántos turnos? *
        </label>
        <select 
          value={numeroTurnos} 
          onChange={(e) => handleNumeroTurnosChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
        >
          <option value="0">Selecciona número de turnos</option>
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {/* Formularios de turnos */}
      {numeroTurnos > 0 && (
        <div className="space-y-4">
          {turnosConfig.map((turno, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">{turno.nombre}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    value={turno.horaInicio}
                    onChange={(e) => handleHoraInicioChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Fin (calculada)
                  </label>
                  <input
                    type="text"
                    value={turno.horaInicio ? calcularHoraFin(turno.horaInicio, horasPedagogicas) : ''}
                    disabled
                    className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
