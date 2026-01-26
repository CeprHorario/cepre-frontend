import React from 'react';

export const ConfiguracionSalones = ({ turnosSeleccionados, salonesPorTurno, handleSalonesChange, esExtraordinario }) => {
  if (turnosSeleccionados.length === 0) return null;

  return (
    <>
      {turnosSeleccionados.map((turno) => (
        <div 
          key={turno.nombre} 
          className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h3 className="font-bold text-lg text-[#78211E] mb-4 border-b border-gray-300 pb-2">
            🏫 Configuración de Salones - {turno.nombre}
          </h3>
          {esExtraordinario ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Cantidad de salones para Extraordinario:</p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extraordinario
                </label>
                <input
                  type="number"
                  min={0}
                  value={salonesPorTurno[turno.nombre]?.['Extraordinario'] || ''}
                  onChange={(e) => handleSalonesChange(turno.nombre, 'Extraordinario', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Cantidad de salones por área:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Biomédicas', 'Sociales', 'Ingenierías'].map((area) => (
                  <div key={area} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {area}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={salonesPorTurno[turno.nombre]?.[area] || ''}
                      onChange={(e) => handleSalonesChange(turno.nombre, area, parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
};
