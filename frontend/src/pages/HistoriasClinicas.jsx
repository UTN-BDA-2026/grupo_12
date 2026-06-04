import { useState, useEffect } from 'react';
import { FileText, Plus, Search, User, Stethoscope, Activity, Calendar, ArrowRight, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistoriasClinicas() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState('');
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estados para el formulario de nueva consulta
  const [medicoId, setMedicoId] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Carga inicial de datos maestros (Pacientes y Médicos)
  useEffect(() => {
    fetch('http://127.0.0.1:8000/pacientes/')
      .then(res => res.json())
      .then(data => setPacientes(data))
      .catch(err => console.error("Error al cargar pacientes:", err));

    fetch('http://127.0.0.1:8000/medicos/')
      .then(res => res.json())
      .then(data => setMedicos(data))
      .catch(err => console.error("Error al cargar médicos:", err));
  }, []);

  // Cada vez que el usuario elije un paciente distinto, disparamos la búsqueda de su historial
  useEffect(() => {
    if (!pacienteSeleccionadoId) {
      setHistorial([]);
      return;
    }

    setCargandoHistorial(true);
    fetch(`http://127.0.0.1:8000/historias-clinicas/paciente/${pacienteSeleccionadoId}`)
      .then(res => res.json())
      .then(data => {
        setHistorial(data);
        setCargandoHistorial(false);
      })
      .catch(err => {
        console.error("Error al cargar historial:", err);
        setCargandoHistorial(false);
      });
  }, [pacienteSeleccionadoId]);

  // Enviar la nueva evolución médica a FastAPI
  const agregarEvolucion = async (e) => {
    e.preventDefault();
    if (!pacienteSeleccionadoId || !medicoId) return;

    setGuardando(true);

    // Estructuramos el payload respetando el formato JSON dinámico (JSONB) que pide el backend
    const payload = {
      paciente_id: parseInt(pacienteSeleccionadoId),
      medico_id: parseInt(medicoId),
      datos_medicos: {
        sintomas: sintomas,
        diagnostico: diagnostico,
        tratamiento: tratamiento
      }
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/historias-clinicas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Limpiamos los campos del formulario
        setMedicoId('');
        setSintomas('');
        setDiagnostico('');
        setTratamiento('');
        
        // Volvemos a hacer el fetch del historial para que aparezca la nueva entrada arriba de todo
        const resActualizado = await fetch(`http://127.0.0.1:8000/historias-clinicas/paciente/${pacienteSeleccionadoId}`);
        setHistorial(await resActualizado.json());
      } else {
        alert("Error al guardar en la historia clínica");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setGuardando(false);
    }
  };

  const obtenerNombreMedico = (id) => {
    const m = medicos.find(medico => medico.id === id);
    return m ? `Dr/a. ${m.apellido}, ${m.nombre}` : `Médico Interno (ID: ${id})`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col relative">
      
      {/* Encabezado del Módulo */}
      <div className="shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> 
          Módulo de Historias Clínicas
        </h2>
        <p className="text-gray-500 mt-1">Evoluciones médicas y registros estructurados en formato dinámico (JSONB)</p>
      </div>

      {/* Selector de Paciente principal */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 shrink-0">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expediente del Paciente</label>
          <select 
            className="w-full bg-transparent text-gray-800 font-medium outline-none border-b border-gray-200 py-1 focus:border-blue-500 transition-colors"
            value={pacienteSeleccionadoId}
            onChange={(e) => setPacienteSeleccionadoId(e.target.value)}
          >
            <option value="">Seleccioná un paciente para abrir su expediente...</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} (DNI: {p.dni})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor Bifurcado: Formulario a la izquierda, Timeline a la derecha */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* COLUMNA IZQUIERDA: Nueva Evolución */}
        <div className="w-5/12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 shrink-0">
            <Plus className="text-emerald-600" size={20} />
            Nueva Entrada Médica
          </h3>

          {!pacienteSeleccionadoId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-4 border-2 border-dashed border-gray-100 rounded-xl">
              <ClipboardList size={40} className="mb-2 text-gray-300" />
              <p className="text-sm">Por favor, seleccioná un paciente arriba para poder habilitar el formulario de consulta.</p>
            </div>
          ) : (
            <form onSubmit={agregarEvolucion} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médico que Atiende</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                  value={medicoId}
                  onChange={(e) => setMedicoId(e.target.value)}
                >
                  <option value="" disabled>Seleccionar profesional...</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>Dr/a. {m.apellido}, {m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anamnesis / Síntomas</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Ej: Paciente refiere cefalea intensa de 48 hs de evolución y picos febriles..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Clínico</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Ej: Migraña con aura / Cuadro gripal en desarrollo..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                />
              </div>

              <div className="flex-1 min-h-[80px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan / Tratamiento / Indicaciones</label>
                <textarea 
                  required
                  className="w-full h-[calc(100%-1.75rem)] border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
                  placeholder="Ej: Paracetamol 1g cada 8 hs, reposo por 24 hs y control evolutivo..."
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={guardando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm mt-2 flex items-center justify-center gap-2 shrink-0"
              >
                {guardando ? 'Guardando en PostgreSQL...' : 'Registrar Evolución Médica'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        {/* COLUMNA DERECHA: Línea de tiempo cronológica */}
        <div className="w-7/12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 shrink-0">
            <Activity className="text-blue-600" size={20} />
            Historial Clínico (Línea de Tiempo)
          </h3>

          <div className="flex-1 overflow-y-auto pr-2">
            {cargandoHistorial ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                Abriendo bóveda de datos relacionales...
              </div>
            ) : !pacienteSeleccionadoId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ClipboardList size={40} className="mb-2 text-gray-200" />
                <p className="text-sm">Ningún expediente abierto en este momento.</p>
              </div>
            ) : historial.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                <p className="font-semibold text-gray-600 mb-1">Historial Limpio</p>
                <p className="text-sm max-w-xs">Este paciente no registra consultas previas en el sistema. Utilizá el formulario de la izquierda para abrir su historial médico.</p>
              </div>
            ) : (
              /* --- DISEÑO DE LÍNEA DE TIEMPO (TIMELINE) --- */
              <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
                {historial.map((reg) => (
                  <div key={reg.id} className="relative">
                    {/* El circulito azul de la línea de tiempo */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                    
                    {/* Tarjeta del registro */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-3">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                          <Stethoscope size={16} className="text-blue-600" />
                          {obtenerNombreMedico(reg.medico_id)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Calendar size={14} />
                          {format(new Date(reg.fecha), "dd MMM yyyy HH:mm", { locale: es })} hs
                        </div>
                      </div>

                      {/* Renderizado de los datos embebidos en el JSONB */}
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600"><strong className="text-gray-800 font-medium">Motivo / Síntomas:</strong> {reg.datos_medicos?.sintomas || 'No especificado'}</p>
                        <p className="text-gray-600"><strong className="text-gray-800 font-medium">Diagnóstico:</strong> {reg.datos_medicos?.diagnostico || 'No especificado'}</p>
                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 mt-1">
                          <p className="text-blue-900 text-xs font-semibold mb-1 uppercase tracking-wider">Indicaciones / Receta</p>
                          <p className="text-blue-800 italic">"{reg.datos_medicos?.tratamiento || 'Sin indicaciones'}"</p>
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