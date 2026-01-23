import React from 'react';

export const InformacionBasica = ({
  procesoSeleccionado,
  setProcesoSeleccionado,
  anio,
  setAnio,
  sedeSeleccionada,
  setSedeSeleccionada,
  sedes,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  dominioSeleccionado,
  setDominioSeleccionado,
  generarHorarios,
  setGenerarHorarios,
}) => {
  const procesos = ['Ordinario I Fase', 'Ciclo Quintos', 'Ordinario II Fase', 'Extraordinario'];
  const dominios = ['@unsa.edu.pe', '@cepr.unsa.pe'];

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
      <h2 className="text-xl font-semibold text-[#78211E] border-b border-gray-300 pb-2">
        📋 Información Básica
      </h2>
      
      {/* Proceso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Proceso *
        </label>
        <select 
          value={procesoSeleccionado} 
          onChange={(e) => setProcesoSeleccionado(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent transition"
        >
          <option value="">Selecciona un proceso</option>
          {procesos.map((proceso) => (
            <option key={proceso} value={proceso}>{proceso}</option>
          ))}
        </select>
        {procesoSeleccionado === 'Nuevo proceso' && (
          <input
            type="text"
            placeholder="Ingrese el nombre del nuevo proceso"
            className="w-full mt-2 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
            value={nuevoProceso}
            onChange={(e) => setNuevoProceso(e.target.value)}
          />
        )}
      </div>

      {/* Año y Sede */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año *
          </label>
          <select
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sede *
          </label>
          <select 
            value={sedeSeleccionada} 
            onChange={(e) => setSedeSeleccionada(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent bg-gray-50"
          >
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.name}>{sede.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Por defecto: Sede Virtual</p>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio *
          </label>
          <input 
            type="date" 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Fin *
          </label>
          <input 
            type="date" 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
          />
        </div>
      </div>

      {/* Dominio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dominio de Correo *
        </label>
        <select 
          value={dominioSeleccionado} 
          onChange={(e) => setDominioSeleccionado(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#78211E] focus:border-transparent"
        >
          <option value="">Selecciona un dominio</option>
          {dominios.map((dominio) => (
            <option key={dominio} value={dominio}>{dominio}</option>
          ))}
        </select>
      </div>

      {/* Generar horarios */}
      <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
        <input 
          type="checkbox" 
          checked={generarHorarios} 
          onChange={(e) => setGenerarHorarios(e.target.checked)} 
          className="mr-3 w-5 h-5 text-[#78211E] focus:ring-2 focus:ring-[#78211E] rounded"
          id="generar-horarios"
        />
        <label htmlFor="generar-horarios" className="cursor-pointer">
          <span className="font-medium text-gray-800">¿Generar Horarios Automáticamente?</span>
          <p className="text-sm text-gray-600">Se recomienda activar esta opción</p>
        </label>
      </div>
    </div>
  );
};
