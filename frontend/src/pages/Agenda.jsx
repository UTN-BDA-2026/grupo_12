import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Plus,
  X,
  User,
  Stethoscope,
  Clock,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
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
  showMore: (total) => `+ ${total} turnos más`,
};

const sumarDias = (fecha, dias) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
};

const generarHorarios = () => {
  const horarios = [];
  for (let i = 8; i <= 20; i++) {
    const hora = i.toString().padStart(2, "0");
    horarios.push(`${hora}:00`);
    if (i !== 20) horarios.push(`${hora}:30`);
  }
  return horarios;
};

const VistaAgendaPaginada = ({ events, onSelectEvent }) => {
  const [pagina, setPagina] = useState(1);
  const turnosPorPagina = 8;
  const turnosOrdenados = [...events].sort((a, b) => a.start - b.start);
  const totalPaginas = Math.ceil(turnosOrdenados.length / turnosPorPagina) || 1;
  const turnosPaginados = turnosOrdenados.slice(
    (pagina - 1) * turnosPorPagina,
    pagina * turnosPorPagina,
  );

  useEffect(() => {
    setPagina(1);
  }, [events]);

  return (
    <div className="flex flex-col h-full bg-white border-t border-slate-100">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-600 text-sm text-center border-r border-slate-100 w-32">
                Fecha
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm text-center border-r border-slate-100 w-32">
                Horario
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm border-r border-slate-100 w-64">
                Paciente
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm border-r border-slate-100 w-64">
                Profesional
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm">
                Motivo de Consulta
              </th>
            </tr>
          </thead>
          <tbody>
            {turnosPaginados.length > 0 ? (
              turnosPaginados.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => onSelectEvent && onSelectEvent(ev)}
                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 text-center font-semibold text-slate-700 border-r border-slate-100">
                    {format(ev.start, "dd/MM/yyyy")}
                  </td>
                  <td className="p-4 text-center font-bold text-blue-600 border-r border-slate-100">
                    {format(ev.start, "HH:mm")} hs
                  </td>
                  <td className="p-4 font-medium text-slate-800 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {ev.resource.paciente_nombre}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-600 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="text-slate-400" />
                      {ev.resource.medico_nombre}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 italic truncate max-w-xs">
                    {ev.title}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500">
                  No se encontraron turnos programados en este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {turnosOrdenados.length > turnosPorPagina && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-sm font-medium text-slate-500">
            Mostrando {(pagina - 1) * turnosPorPagina + 1} al{" "}
            {Math.min(pagina * turnosPorPagina, turnosOrdenados.length)} de{" "}
            {turnosOrdenados.length} turnos
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="px-3 text-sm font-bold text-slate-600">
              Pág. {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
VistaAgendaPaginada.range = (date) => ({
  start: new Date(date),
  end: sumarDias(date, 30),
});
VistaAgendaPaginada.navigate = (date, action) => {
  if (action === "PREV") return sumarDias(date, -30);
  if (action === "NEXT") return sumarDias(date, 30);
  return date;
};
VistaAgendaPaginada.title = (date, { localizer }) =>
  `${localizer.format(date, "dd/MM/yyyy")} — ${localizer.format(sumarDias(date, 30), "dd/MM/yyyy")}`;

export default function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState("week");
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [mostrarModalAlta, setMostrarModalAlta] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [busquedaPacienteModal, setBusquedaPacienteModal] = useState("");
  const [mostrarResultadosModal, setMostrarResultadosModal] = useState(false);
  const buscadorRef = useRef(null);

  // --- NUEVO ESTADO PARA EL MODAL DE DÍA ESPECÍFICO ---
  const [mostrarTurnosDelDia, setMostrarTurnosDelDia] = useState(null);

  const [formData, setFormData] = useState({
    medico_id: "",
    paciente_id: "",
    fecha_dia: "",
    hora_turno: "",
    motivo: "",
  });

  const cargarDatos = async () => {
    try {
      const [resPacientes, resMedicos, resTurnos] = await Promise.all([
        fetch("http://127.0.0.1:8000/pacientes/"),
        fetch("http://127.0.0.1:8000/medicos/"),
        fetch("http://127.0.0.1:8000/turnos/"),
      ]);
      const dataPacientes = resPacientes.ok ? await resPacientes.json() : [];
      const dataMedicos = resMedicos.ok ? await resMedicos.json() : [];
      const dataTurnos = resTurnos.ok ? await resTurnos.json() : [];
      setPacientes(dataPacientes);
      setMedicos(dataMedicos);
      const eventosFormateados = dataTurnos.map((turno) => {
        const p = dataPacientes.find((pac) => pac.id === turno.paciente_id);
        const m = dataMedicos.find((med) => med.id === turno.medico_id);
        const fechaInicio = new Date(turno.fecha);
        const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);
        return {
          id: turno.id,
          title: `${turno.motivo}`,
          start: fechaInicio,
          end: fechaFin,
          resource: {
            ...turno,
            paciente_nombre: p ? `${p.apellido}, ${p.nombre}` : "Desconocido",
            paciente_dni: p ? p.dni : "",
            medico_nombre: m ? `Dr/a. ${m.apellido}` : "Desconocido",
          },
        };
      });
      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar la agenda:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleClickFuera = (event) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target))
        setMostrarResultadosModal(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const guardarTurno = async (e) => {
    e.preventDefault();
    if (!formData.paciente_id) {
      alert("Por favor, buscá y seleccioná un paciente de la lista.");
      return;
    }
    const fechaFinalISO = `${formData.fecha_dia}T${formData.hora_turno}`;
    const payload = {
      motivo: formData.motivo,
      fecha: fechaFinalISO,
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
        setFormData({
          medico_id: "",
          paciente_id: "",
          fecha_dia: "",
          hora_turno: "",
          motivo: "",
        });
        setBusquedaPacienteModal("");
        setFechaActual(new Date(fechaFinalISO));
        cargarDatos();
      } else {
        const errorData = await response.json();
        alert(`Error: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cancelarTurno = async (id) => {
    if (!window.confirm("¿Confirmás la cancelación del turno?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/turnos/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTurnoSeleccionado(null);
        // Si estábamos viendo los turnos de un día, lo cerramos para que se actualice limpio
        if (mostrarTurnosDelDia) setMostrarTurnosDelDia(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const estiloDeEventos = (evento) => {
    // Si es nuestro evento agrupado de la vista Mes
    if (evento.isGroup) {
      return {
        style: {
          backgroundColor: "#eff6ff", // Fondo azul muy clarito
          color: "#2563eb", // Texto azul fuerte
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
          fontWeight: "bold",
          textAlign: "center",
          display: "block",
          padding: "4px 8px",
          fontSize: "0.85rem",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        },
      };
    }

    // El estilo original para los turnos individuales en vistas de Semana/Día
    return {
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
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
    };
  };

  const eventosFiltrados = eventos.filter((evento) => {
    if (!busquedaGlobal) return true;
    const nombreCompleto = evento.resource.paciente_nombre.toLowerCase();
    const nombreInvertido = nombreCompleto
      .split(", ")
      .reverse()
      .join(" ")
      .toLowerCase();
    const motivo = evento.title.toLowerCase();
    const termino = busquedaGlobal.toLowerCase().trim();
    return (
      nombreCompleto.includes(termino) ||
      nombreInvertido.includes(termino) ||
      motivo.includes(termino)
    );
  });

  // --- NUEVA LÓGICA: Agrupar eventos para Mes y superposiciones en Semana/Día ---
  const eventosParaCalendario =
    vistaActual === "month"
      ? Object.values(
          eventosFiltrados.reduce((acc, ev) => {
            // Lógica de Mes: agrupamos TODOS los turnos por día
            const fechaString = format(ev.start, "yyyy-MM-dd");
            if (!acc[fechaString]) {
              acc[fechaString] = {
                id: `grupo-mes-${fechaString}`,
                title: "1 turno",
                start: new Date(
                  ev.start.getFullYear(),
                  ev.start.getMonth(),
                  ev.start.getDate(),
                  12,
                  0,
                ),
                end: new Date(
                  ev.start.getFullYear(),
                  ev.start.getMonth(),
                  ev.start.getDate(),
                  13,
                  0,
                ),
                allDay: true,
                isGroup: true,
                cantidad: 1,
              };
            } else {
              acc[fechaString].cantidad += 1;
              acc[fechaString].title = `${acc[fechaString].cantidad} turnos`;
            }
            return acc;
          }, {}),
        )
      : vistaActual === "week" || vistaActual === "day"
        ? Object.values(
            eventosFiltrados.reduce((acc, ev) => {
              // Lógica Semana/Día: agrupamos SOLO si coinciden EXACTAMENTE en el mismo horario
              const timeKey = ev.start.getTime();
              if (!acc[timeKey]) {
                // Si es el único en este horario, se muestra normal
                acc[timeKey] = { ...ev, cantidad: 1 };
              } else {
                // Si hay 2 o más en el mismo horario, lo transformamos en etiqueta agrupada
                acc[timeKey].cantidad += 1;
                acc[timeKey].isGroup = true;
                acc[timeKey].title = `${acc[timeKey].cantidad} turnos`;
              }
              return acc;
            }, {}),
          )
        : eventosFiltrados; // La vista "Agenda" en formato lista queda intacta

  const pacientesFiltradosModal = pacientes
    .filter((p) => {
      const termino = busquedaPacienteModal.toLowerCase().trim();
      if (!termino) return true;
      const nombreNormal = `${p.nombre} ${p.apellido}`.toLowerCase();
      const nombreInvertido = `${p.apellido} ${p.nombre}`.toLowerCase();
      return (
        nombreNormal.includes(termino) ||
        nombreInvertido.includes(termino) ||
        p.dni.includes(termino)
      );
    })
    .slice(0, 8);

  const seleccionarPacienteModal = (paciente) => {
    setFormData({ ...formData, paciente_id: paciente.id });
    setBusquedaPacienteModal(
      `${paciente.apellido}, ${paciente.nombre} (DNI: ${paciente.dni})`,
    );
    setMostrarResultadosModal(false);
  };

  // --- LÓGICA PARA CAPTURAR EL CLIC EN UN DÍA Y MOSTRAR NUESTRO MODAL ---
  const manejarClicEnDia = (fecha) => {
    // Filtramos todos los eventos que coincidan exactamente con este día
    const turnosDelDia = eventosFiltrados.filter((ev) =>
      isSameDay(ev.start, fecha),
    );
    setMostrarTurnosDelDia({ fecha, turnos: turnosDelDia });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="text-blue-600" /> Agenda Médica
          </h2>
          <p className="text-gray-500 mt-1">
            Gestión centralizada de turnos y disponibilidad
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por paciente o motivo..."
              className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg outline-none focus:border-blue-500 shadow-sm bg-white"
              value={busquedaGlobal}
              onChange={(e) => setBusquedaGlobal(e.target.value)}
            />
            {busquedaGlobal && (
              <button
                onClick={() => setBusquedaGlobal("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setFormData({
                medico_id: "",
                paciente_id: "",
                fecha_dia: "",
                hora_turno: "",
                motivo: "",
              });
              setBusquedaPacienteModal("");
              setMostrarModalAlta(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} /> Otorgar Turno
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        {cargando ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-medium">
            Sincronizando agenda con PostgreSQL...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={eventosParaCalendario} // Usamos nuestra nueva lista agrupada
            startAccessor="start"
            endAccessor="end"
            messages={mensajesEnEspanol}
            culture="es"
            eventPropGetter={estiloDeEventos}
            dayLayoutAlgorithm="no-overlap"
            min={new Date(2026, 0, 1, 8, 0)}
            max={new Date(2026, 0, 1, 20, 0)}
            onSelectEvent={(evento) => {
              if (evento.isGroup) {
                // Si tocan el cartel de "X turnos", abrimos el modal del día
                manejarClicEnDia(evento.start);
              } else {
                // Si tocan un turno individual (en vista semana/día), abrimos el detalle
                setTurnoSeleccionado(evento.resource);
              }
            }}
            onDrillDown={manejarClicEnDia}
            date={fechaActual}
            onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)}
            view={vistaActual}
            onView={(nuevaVista) => setVistaActual(nuevaVista)}
            views={{
              month: true,
              week: true,
              day: true,
              agenda: VistaAgendaPaginada,
            }}
          />
        )}
      </div>

      {/* --- NUEVO MODAL FACHERO PARA LISTAR LOS TURNOS DE UN DÍA --- */}
      {mostrarTurnosDelDia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ListOrdered className="text-blue-600" />
                  Turnos del{" "}
                  {format(mostrarTurnosDelDia.fecha, "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Total programados: {mostrarTurnosDelDia.turnos.length}
                </p>
              </div>
              <button
                onClick={() => setMostrarTurnosDelDia(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {mostrarTurnosDelDia.turnos.length > 0 ? (
                <div className="space-y-3">
                  {/* Ordenamos los turnos de ese día por hora antes de renderizarlos */}
                  {mostrarTurnosDelDia.turnos
                    .sort((a, b) => a.start - b.start)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setTurnoSeleccionado(ev.resource)}
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                            {format(ev.start, "HH:mm")} hs
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {ev.resource.paciente_nombre}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <Stethoscope size={14} />{" "}
                              {ev.resource.medico_nombre}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Motivo
                          </span>
                          <span className="text-sm text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                            {ev.title}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10">
                  <CalendarDays
                    size={48}
                    className="mx-auto text-slate-300 mb-4"
                  />
                  <p>No hay turnos agendados para este día.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50 shrink-0 text-right">
              <button
                onClick={() => setMostrarTurnosDelDia(null)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cerrar Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PARA OTORGAR TURNO (IGUAL) --- */}
      {mostrarModalAlta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-visible">
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
              <div className="relative" ref={buscadorRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                  placeholder="Escribí DNI o apellido..."
                  value={busquedaPacienteModal}
                  onChange={(e) => {
                    setBusquedaPacienteModal(e.target.value);
                    setMostrarResultadosModal(true);
                    if (formData.paciente_id)
                      setFormData({ ...formData, paciente_id: "" });
                  }}
                  onFocus={() => {
                    if (busquedaPacienteModal) setMostrarResultadosModal(true);
                  }}
                />
                {mostrarResultadosModal && busquedaPacienteModal && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-300 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto">
                    {pacientesFiltradosModal.length > 0 ? (
                      pacientesFiltradosModal.map((p) => (
                        <li
                          key={p.id}
                          onClick={() => seleccionarPacienteModal(p)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                        >
                          <span className="font-semibold text-gray-800">
                            {p.apellido}, {p.nombre}
                          </span>
                          <span className="text-gray-500 ml-2 text-xs">
                            DNI: {p.dni}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-500 text-center">
                        No se encontraron pacientes.
                      </li>
                    )}
                  </ul>
                )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                    value={formData.fecha_dia}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_dia: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                    value={formData.hora_turno}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_turno: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Elegir hora...
                    </option>
                    {generarHorarios().map((hora) => (
                      <option key={hora} value={hora}>
                        {hora} hs
                      </option>
                    ))}
                  </select>
                </div>
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

      {/* --- MODAL DETALLE DEL TURNO (IGUAL) --- */}
      {turnoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                    {turnoSeleccionado.paciente_nombre}
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
                    {turnoSeleccionado.medico_nombre}
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
