import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Plus,
  X,
  User,
  Stethoscope,
  Clock,
  Trash2,
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const mensajesEnEspanol = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Turno",
  noEventsInRange: "No hay turnos programados en este rango de fechas.",
};

export default function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- NUEVO ESTADO PARA NAVEGACIÓN DEL CALENDARIO ---
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState("week");

  // Estados para datos maestros
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  // Estados para Modales
  const [mostrarModalAlta, setMostrarModalAlta] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    medico_id: "",
    paciente_id: "",
    fecha: "",
    motivo: "",
  });

  const cargarDatos = async () => {
    try {
      const resTurnos = await fetch("http://127.0.0.1:8000/turnos/");
      if (resTurnos.ok) {
        const dataTurnos = await resTurnos.json();
        const eventosFormateados = dataTurnos.map((turno) => {
          const fechaInicio = new Date(turno.fecha);
          const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);
          return {
            id: turno.id,
            title: `${turno.motivo}`,
            start: fechaInicio,
            end: fechaFin,
            resource: turno,
          };
        });
        setEventos(eventosFormateados);
      }

      const resMedicos = await fetch("http://127.0.0.1:8000/medicos/");
      if (resMedicos.ok) setMedicos(await resMedicos.json());

      const resPacientes = await fetch("http://127.0.0.1:8000/pacientes/");
      if (resPacientes.ok) setPacientes(await resPacientes.json());
    } catch (error) {
      console.error("Error al cargar la agenda:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarTurno = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      medico_id: parseInt(formData.medico_id),
      paciente_id: parseInt(formData.paciente_id),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/turnos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMostrarModalAlta(false);
        setFormData({ medico_id: "", paciente_id: "", fecha: "", motivo: "" });

        // Un pequeño truco: al guardar, movemos el calendario a la fecha del nuevo turno
        setFechaActual(new Date(payload.fecha));

        cargarDatos();
      } else {
        const errorData = await response.json();
        alert(`Error: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const cancelarTurno = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseás cancelar este turno? El horario quedará liberado.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/turnos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTurnoSeleccionado(null);
        cargarDatos();
      } else {
        const errorData = await response.json();
        alert(`Error al cancelar: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const estiloDeEventos = (event) => ({
    style: {
      backgroundColor: "#2563eb",
      borderRadius: "6px",
      opacity: 0.9,
      color: "white",
      border: "none",
      display: "block",
      padding: "4px 8px",
      marginBottom: "4px",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
  });

  const obtenerNombrePaciente = (id) => {
    const p = pacientes.find((paciente) => paciente.id === id);
    return p
      ? `${p.apellido}, ${p.nombre} (DNI: ${p.dni})`
      : `Paciente Desconocido (ID: ${id})`;
  };

  const obtenerNombreMedico = (id) => {
    const m = medicos.find((medico) => medico.id === id);
    return m
      ? `Dr/a. ${m.apellido}, ${m.nombre}`
      : `Médico Desconocido (ID: ${id})`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="text-blue-600" />
            Agenda Médica
          </h2>
          <p className="text-gray-500 mt-1">
            Gestión centralizada de turnos y disponibilidad
          </p>
        </div>
        <button
          onClick={() => setMostrarModalAlta(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Otorgar Turno
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        {cargando ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-medium">
            Sincronizando agenda con PostgreSQL...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            messages={mensajesEnEspanol}
            culture="es"
            eventPropGetter={estiloDeEventos}
            min={new Date(2026, 0, 1, 8, 0)}
            max={new Date(2026, 0, 1, 20, 0)}
            onSelectEvent={(evento) => setTurnoSeleccionado(evento.resource)}
            // --- ACÁ CONECTAMOS LOS ESTADOS A LOS BOTONES DEL CALENDARIO ---
            date={fechaActual} // Le decimos en qué fecha pararse
            onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)} // Funciona cuando tocan Hoy, Anterior, Siguiente
            view={vistaActual} // Le decimos qué vista mostrar (Mes, Semana, Día)
            onView={(nuevaVista) => setVistaActual(nuevaVista)} // Funciona cuando tocan los botones de vistas
          />
        )}
      </div>

      {/* --- MODALES (Quedan exactamente igual) --- */}
      {mostrarModalAlta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                Agendar Nuevo Turno
              </h3>
              <button
                onClick={() => setMostrarModalAlta(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarTurno} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                  value={formData.paciente_id}
                  onChange={(e) =>
                    setFormData({ ...formData, paciente_id: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Seleccionar paciente...
                  </option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellido}, {p.nombre} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico Profesional
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                  value={formData.medico_id}
                  onChange={(e) =>
                    setFormData({ ...formData, medico_id: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Seleccionar médico...
                  </option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr/a. {m.apellido}, {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de la consulta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Control de rutina..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalAlta(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Confirmar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {turnoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
              <h3 className="text-xl font-bold text-gray-800">
                Detalle del Turno
              </h3>
              <button
                onClick={() => setTurnoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Paciente</p>
                  <p className="font-semibold text-gray-800">
                    {obtenerNombrePaciente(turnoSeleccionado.paciente_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Profesional Asignado
                  </p>
                  <p className="font-semibold text-gray-800">
                    {obtenerNombreMedico(turnoSeleccionado.medico_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Horario y Motivo
                  </p>
                  <p className="font-semibold text-gray-800">
                    {format(
                      new Date(turnoSeleccionado.fecha),
                      "dd/MM/yyyy HH:mm",
                      { locale: es },
                    )}{" "}
                    hs
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {turnoSeleccionado.motivo}
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setTurnoSeleccionado(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => cancelarTurno(turnoSeleccionado.id)}
                  className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Cancelar Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
