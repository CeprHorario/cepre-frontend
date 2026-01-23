import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AdmissionsServices } from '@/services/AdmissionsServices';
import SedesService from '@/services/sedesServices';
import { toast } from 'react-toastify';
import { InformacionBasica } from './components/InformacionBasica';
import { ConfiguracionTurnos } from './components/ConfiguracionTurnos';
import { ConfiguracionSalones } from './components/ConfiguracionSalones';
import { calcularHoraFin, validarHorario, sumarMinutos } from './utils/horarioUtils';

export const Generar = () => {
  const [procesoSeleccionado, setProcesoSeleccionado] = useState('');
  const [anio, setAnio] = useState(2025);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [sedes, setSedes] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('');
  const [generarHorarios, setGenerarHorarios] = useState(true);
  const [numeroTurnos, setNumeroTurnos] = useState(0);
  const [turnosConfig, setTurnosConfig] = useState([]);
  const [salonesPorTurno, setSalonesPorTurno] = useState({});

  const navigate = useNavigate();

  // Detectar tipo de proceso y horas pedagógicas
  const esExtraordinario = procesoSeleccionado === 'Extraordinario';
  const horasPedagogicas = esExtraordinario ? 6 : 7;

  // Cargar sedes desde el backend
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const data = await SedesService.getSedes();
        console.log('Sedes cargadas:', data);
        if (Array.isArray(data) && data.length > 0) {
          setSedes(data);
          if (!sedeSeleccionada) {
            setSedeSeleccionada(data[0].name);
          }
        }
      } catch (error) {
        console.error('Error cargando sedes:', error);
      }
    };
    cargarSedes();
  }, []);

  const handleSalonesChange = (turno, area, cantidad) => {
    setSalonesPorTurno((prev) => ({
      ...prev,
      [turno]: {
        ...prev[turno],
        [area]: Math.max(0, parseInt(cantidad) || 0)
      }
    }));
  };

  const handleSubmit = async () => {
    if (!procesoSeleccionado) {
      toast.error('Por favor selecciona un proceso.');
      return;
    }

    if (!sedeSeleccionada) {
      toast.error('Por favor selecciona una sede.');
      return;
    }

    if (!dominioSeleccionado) {
      toast.error('Por favor selecciona un dominio.');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor ingresa las fechas de inicio y fin.');
      return;
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    if (numeroTurnos === 0) {
      toast.error('Debe configurar al menos un turno.');
      return;
    }

    // Validar que todos los turnos tengan hora de inicio
    const turnosSinHora = turnosConfig.filter(t => !t.horaInicio);
    if (turnosSinHora.length > 0) {
      toast.error('Todos los turnos deben tener hora de inicio.');
      return;
    }

    const areas = esExtraordinario ? ['Extraordinario'] : ['Biomédicas', 'Ingenierías', 'Sociales'];

    const objeto = {
      name: procesoSeleccionado,
      year: anio,
      sede: sedeSeleccionada,
      started: fechaInicio,
      finished: fechaFin,
      configuration: {
        emailDomain: dominioSeleccionado,
        createSchedules: generarHorarios,
        shifts: turnosConfig.map((turno) => ({
          name: turno.nombre,
          startTime: turno.horaInicio,
          endTime: calcularHoraFin(turno.horaInicio, horasPedagogicas),
          classesToAreas: areas.map(area => ({
            area,
            quantityClasses: salonesPorTurno[turno.nombre]?.[area] || 0
          }))
        }))
      }
    };

    console.log('Datos a enviar:', objeto);
    try {
      const response = await AdmissionsServices.crearAdmission(objeto)
      console.log('Respuesta del servidor:', response);
      toast.success('Proceso de admisión creado exitosamente.');
      navigate('..');
    } catch (error) {
      console.error('Error al crear el proceso de admisión:', error);
      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach(msg => toast.error(msg));
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Error al crear el proceso de admisión. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-[#78211E] px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Crear Proceso de Admisión
            </h1>
            <p className="text-red-100 text-center mt-2">
              Configure los detalles del nuevo proceso académico
            </p>
          </div>

          <div className="p-8 space-y-6">
            <InformacionBasica
              procesoSeleccionado={procesoSeleccionado}
              setProcesoSeleccionado={setProcesoSeleccionado}
              anio={anio}
              setAnio={setAnio}
              sedeSeleccionada={sedeSeleccionada}
              setSedeSeleccionada={setSedeSeleccionada}
              sedes={sedes}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              dominioSeleccionado={dominioSeleccionado}
              setDominioSeleccionado={setDominioSeleccionado}
              generarHorarios={generarHorarios}
              setGenerarHorarios={setGenerarHorarios}
            />

            <ConfiguracionTurnos
              numeroTurnos={numeroTurnos}
              setNumeroTurnos={setNumeroTurnos}
              turnosConfig={turnosConfig}
              setTurnosConfig={setTurnosConfig}
              horasPedagogicas={horasPedagogicas}
              calcularHoraFin={calcularHoraFin}
            />

            <ConfiguracionSalones
              turnosSeleccionados={turnosConfig}
              salonesPorTurno={salonesPorTurno}
              handleSalonesChange={handleSalonesChange}
              esExtraordinario={esExtraordinario}
            />

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#78211E] hover:bg-[#5a1916] text-white font-bold py-4 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
              >
                🚀 Registrar Proceso
              </button>
              <Button 
                onClick={() => navigate("..")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg"
              >
                ⬅️ Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};