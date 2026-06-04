import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Search,
  User,
  Stethoscope,
  Activity,
  Calendar,
  ArrowRight,
  ClipboardList,
  X,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HistoriasClinicas() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscadorRef = useRef(null);

  const [medicoId, setMedicoId] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/pacientes/")
      .then((res) => res.json())
      .then((data) => setPacientes(data))
      .catch((err) => console.error("Error al cargar pacientes:", err));

    fetch("http://127.0.0.1:8000/medicos/")
      .then((res) => res.json())
      .then((data) => setMedicos(data))
      .catch((err) => console.error("Error al cargar médicos:", err));
  }, []);

  useEffect(() => {
    if (!pacienteSeleccionadoId) {
      setHistorial([]);
      return;
    }
    setCargandoHistorial(true);
    fetch(
      `http://127.0.0.1:8000/historias-clinicas/paciente/${pacienteSeleccionadoId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setHistorial(data);
        setCargandoHistorial(false);
      })
      .catch((err) => {
        console.error("Error al cargar historial:", err);
        setCargandoHistorial(false);
      });
  }, [pacienteSeleccionadoId]);

  useEffect(() => {
    const handleClickFuera = (event) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const agregarEvolucion = async (e) => {
    e.preventDefault();
    if (!pacienteSeleccionadoId || !medicoId) return;
    setGuardando(true);
    const payload = {
      paciente_id: parseInt(pacienteSeleccionadoId),
      medico_id: parseInt(medicoId),
      datos_medicos: { sintomas, diagnostico, tratamiento },
    };
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/historias-clinicas/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        setMedicoId("");
        setSintomas("");
        setDiagnostico("");
        setTratamiento("");
        const resActualizado = await fetch(
          `http://127.0.0.1:8000/historias-clinicas/paciente/${pacienteSeleccionadoId}`,
        );
        setHistorial(await resActualizado.json());
      } else {
        alert("Error al guardar en la historia clínica");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGuardando(false);
    }
  };

  const obtenerNombreMedico = (id) => {
    const m = medicos.find((medico) => medico.id === id);
    return m
      ? `Dr/a. ${m.apellido}, ${m.nombre}`
      : `Médico Interno (ID: ${id})`;
  };

  const pacientesFiltrados = pacientes
    .filter((p) => {
      const termino = busquedaPaciente.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(termino) ||
        p.apellido.toLowerCase().includes(termino) ||
        p.dni.includes(termino)
      );
    })
    .slice(0, 8);

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionadoId(paciente.id);
    setBusquedaPaciente(
      `${paciente.apellido}, ${paciente.nombre} (DNI: ${paciente.dni})`,
    );
    setMostrarResultados(false);
  };

  // --- NUEVA FUNCIÓN DE IMPRESIÓN ---
  const imprimirReceta = (reg) => {
    const paciente = pacientes.find(
      (p) => p.id === parseInt(pacienteSeleccionadoId),
    );
    const medicoNombre = obtenerNombreMedico(reg.medico_id);
    const fechaFormateada = format(new Date(reg.fecha), "dd/MM/yyyy HH:mm");

    // Abrimos una ventana oculta nueva para inyectar el diseño de la receta
    const ventanaImpresion = window.open("", "", "width=800,height=600");

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Receta Médica - ${paciente.apellido}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 25px; }
            .info-box { background: #f8fafc; padding: 15px 20px; border-radius: 8px; width: 45%; border: 1px solid #e2e8f0; }
            
            /* --- NUEVO ESTILO PARA EL DIAGNÓSTICO --- */
            .diagnosis-box { margin-bottom: 25px; padding: 15px 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; }
            
            .rx-section { min-height: 250px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; position: relative; }
            .rx-title { font-size: 24px; font-weight: bold; color: #2563eb; margin-top: 0; margin-bottom: 20px; font-style: italic; }
            .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; }
            .signature { margin-top: 60px; text-align: right; padding-right: 20px; }
            .signature-line { border-top: 1px solid #333; width: 250px; display: inline-block; padding-top: 8px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo">MediSys Pro</h1>
            <p class="subtitle">Gestión Clínica Avanzada</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <div style="color: #64748b; font-size: 12px; margin-bottom: 5px; font-weight: bold;">DATOS DEL PACIENTE</div>
              <strong>${paciente.apellido}, ${paciente.nombre}</strong><br>
              <div style="margin-top: 5px; font-size: 14px;">DNI: ${paciente.dni}</div>
            </div>
            <div class="info-box">
              <div style="color: #64748b; font-size: 12px; margin-bottom: 5px; font-weight: bold;">DETALLES DE LA CONSULTA</div>
              <strong>${medicoNombre}</strong><br>
              <div style="margin-top: 5px; font-size: 14px;">Fecha: ${fechaFormateada} hs</div>
            </div>
          </div>

          <div class="diagnosis-box">
            <div style="color: #1e40af; font-size: 12px; margin-bottom: 5px; font-weight: bold; text-transform: uppercase;">Diagnóstico Clínico</div>
            <div style="font-size: 15px; color: #1e293b;">
              ${reg.datos_medicos?.diagnostico || "No especificado"}
            </div>
          </div>

          <div class="rx-section">
            <h2 class="rx-title">Rp.</h2>
            <div style="white-space: pre-line; font-size: 16px; line-height: 1.6; color: #1e293b;">
              ${reg.datos_medicos?.tratamiento || "Sin indicaciones específicas."}
            </div>
            
            <div class="signature">
              <div class="signature-line">
                Firma y Sello del Profesional
              </div>
            </div>
          </div>

          <div class="footer">
            Documento generado electrónicamente por MediSys Pro (ID de Registro: #${reg.id})
          </div>
        </body>
      </html>
    `);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();

    // Pequeño retardo para asegurar que el HTML se dibuje antes de abrir el diálogo de imprimir
    setTimeout(() => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 250);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Módulo de Historias Clínicas
        </h2>
        <p className="text-gray-500 mt-1">
          Evoluciones médicas y registros estructurados en formato dinámico
          (JSONB)
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 shrink-0 overflow-visible">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <User size={20} />
        </div>
        <div className="flex-1 relative" ref={buscadorRef}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Buscar Expediente por DNI o Apellido
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-transparent text-gray-800 font-medium outline-none border-b border-gray-200 py-1 focus:border-blue-500 transition-colors pr-8"
              placeholder="Ej: 34567890 o Pérez..."
              value={busquedaPaciente}
              onChange={(e) => {
                setBusquedaPaciente(e.target.value);
                setMostrarResultados(true);
                if (pacienteSeleccionadoId) setPacienteSeleccionadoId("");
              }}
              onFocus={() => {
                if (busquedaPaciente) setMostrarResultados(true);
              }}
            />
            {busquedaPaciente && (
              <button
                onClick={() => {
                  setBusquedaPaciente("");
                  setPacienteSeleccionadoId("");
                  setMostrarResultados(false);
                }}
                className="absolute right-0 top-1.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {mostrarResultados && busquedaPaciente && (
            <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-1 max-h-60 overflow-y-auto">
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => seleccionarPaciente(p)}
                    className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex justify-between items-center"
                  >
                    <span className="font-semibold text-gray-800">
                      {p.apellido}, {p.nombre}
                    </span>
                    <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      DNI: {p.dni}
                    </span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                  <Search size={16} /> No se encontraron coincidencias en la
                  base de datos.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        <div className="w-5/12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 shrink-0">
            <Plus className="text-emerald-600" size={20} /> Nueva Entrada Médica
          </h3>
          {!pacienteSeleccionadoId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-4 border-2 border-dashed border-gray-100 rounded-xl">
              <ClipboardList size={40} className="mb-2 text-gray-300" />
              <p className="text-sm">
                Por favor, buscá y seleccioná un paciente arriba para habilitar
                el formulario.
              </p>
            </div>
          ) : (
            <form
              onSubmit={agregarEvolucion}
              className="space-y-4 flex-1 flex flex-col"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico que Atiende
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                  value={medicoId}
                  onChange={(e) => setMedicoId(e.target.value)}
                >
                  <option value="" disabled>
                    Seleccionar profesional...
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
                  Anamnesis / Síntomas
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico Clínico
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                />
              </div>
              <div className="flex-1 min-h-[80px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan / Tratamiento / Indicaciones
                </label>
                <textarea
                  required
                  className="w-full h-[calc(100%-1.75rem)] border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm mt-2 flex items-center justify-center gap-2 shrink-0"
              >
                {guardando
                  ? "Guardando en PostgreSQL..."
                  : "Registrar Evolución Médica"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        <div className="w-7/12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 shrink-0">
            <Activity className="text-blue-600" size={20} /> Historial Clínico
            (Línea de Tiempo)
          </h3>

          <div className="flex-1 overflow-y-auto pr-2">
            {cargandoHistorial ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                Abriendo bóveda de datos relacionales...
              </div>
            ) : !pacienteSeleccionadoId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ClipboardList size={40} className="mb-2 text-gray-200" />
                <p className="text-sm">
                  Ningún expediente abierto en este momento.
                </p>
              </div>
            ) : historial.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                <p className="font-semibold text-gray-600 mb-1">
                  Historial Limpio
                </p>
                <p className="text-sm max-w-xs">
                  Este paciente no registra consultas previas en el sistema.
                  Utilizá el formulario de la izquierda para abrir su historial
                  médico.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
                {historial.map((reg) => (
                  <div key={reg.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-3">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                          <Stethoscope size={16} className="text-blue-600" />
                          {obtenerNombreMedico(reg.medico_id)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Calendar size={14} />
                            {format(new Date(reg.fecha), "dd MMM yyyy HH:mm", {
                              locale: es,
                            })}{" "}
                            hs
                          </div>
                          {/* --- BOTÓN DE IMPRIMIR RECETA AGREGADO ACÁ --- */}
                          <button
                            onClick={() => imprimirReceta(reg)}
                            title="Imprimir Receta Médica"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center shadow-sm border border-blue-200 bg-white"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <strong className="text-gray-800 font-medium">
                            Motivo / Síntomas:
                          </strong>{" "}
                          {reg.datos_medicos?.sintomas || "No especificado"}
                        </p>
                        <p className="text-gray-600">
                          <strong className="text-gray-800 font-medium">
                            Diagnóstico:
                          </strong>{" "}
                          {reg.datos_medicos?.diagnostico || "No especificado"}
                        </p>
                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 mt-1">
                          <p className="text-blue-900 text-xs font-semibold mb-1 uppercase tracking-wider">
                            Indicaciones / Receta
                          </p>
                          <p className="text-blue-800 italic">
                            "
                            {reg.datos_medicos?.tratamiento ||
                              "Sin indicaciones"}
                            "
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
