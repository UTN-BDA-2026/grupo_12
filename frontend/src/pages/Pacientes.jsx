import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    obra_social_id: "",
    numero_credencial: "",
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const pacientesPorPagina = 5;

  const cargarDatos = () => {
    Promise.all([
      fetch("http://127.0.0.1:8000/pacientes/").then((res) => res.json()),
      fetch("http://127.0.0.1:8000/obras-sociales/").then((res) => res.json()),
    ])
      .then(([dataPacientes, dataObrasSociales]) => {
        setPacientes(dataPacientes);
        setObrasSociales(dataObrasSociales);
        setCargando(false);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setFormData({
      id: null,
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      obra_social_id: "",
      numero_credencial: "",
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (paciente) => {
    setFormData({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      email: paciente.email || "",
      telefono: paciente.telefono || "",
      obra_social_id: paciente.obra_social_id || "",
      numero_credencial: paciente.numero_credencial || "",
    });
    setMostrarModal(true);
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    const esEdicion = formData.id !== null;
    const url = esEdicion
      ? `http://127.0.0.1:8000/pacientes/${formData.id}`
      : "http://127.0.0.1:8000/pacientes/";
    const metodo = esEdicion ? "PUT" : "POST";

    // Parseamos el ID de la obra social a número (o nulo si está vacío)
    const datosAEnviar = {
      ...formData,
      obra_social_id: formData.obra_social_id
        ? parseInt(formData.obra_social_id)
        : null,
    };
    delete datosAEnviar.id;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAEnviar),
      });

      if (response.ok) {
        setMostrarModal(false);
        cargarDatos();
      } else {
        const errorData = await response.json();
        alert(`Error: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const eliminarPaciente = async (id, nombre, apellido) => {
    if (
      !window.confirm(
        `¿Estás seguro que deseás eliminar a ${nombre} ${apellido}?`,
      )
    )
      return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/pacientes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        cargarDatos();
        if (pacientesActuales.length === 1 && paginaActual > 1) {
          setPaginaActual(paginaActual - 1);
        }
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const termino = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(termino) ||
      p.apellido.toLowerCase().includes(termino) ||
      p.dni.includes(termino)
    );
  });

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const indiceUltimoPaciente = paginaActual * pacientesPorPagina;
  const indicePrimerPaciente = indiceUltimoPaciente - pacientesPorPagina;
  const pacientesActuales = pacientesFiltrados.slice(
    indicePrimerPaciente,
    indiceUltimoPaciente,
  );
  const totalPaginas = Math.ceil(
    pacientesFiltrados.length / pacientesPorPagina,
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Padrón de Pacientes
          </h2>
          <p className="text-gray-500 mt-1">
            Gestión de historiales y datos de contacto
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          className="w-full outline-none text-gray-700 bg-transparent"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">
            Cargando registros desde PostgreSQL...
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">
                      Paciente
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">
                      DNI
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">
                      Contacto
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">
                      Cobertura
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesActuales.length > 0 ? (
                    pacientesActuales.map((paciente) => {
                      const obraSocial = obrasSociales.find(
                        (os) => os.id === paciente.obra_social_id,
                      );
                      return (
                        <tr
                          key={paciente.id}
                          className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                {paciente.nombre.charAt(0)}
                                {paciente.apellido.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {paciente.nombre} {paciente.apellido}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID Interno: {paciente.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{paciente.dni}</td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={14} className="text-gray-400" />
                                {paciente.email || "Sin email"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} className="text-gray-400" />
                                {paciente.telefono || "Sin teléfono"}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CreditCard size={16} className="text-blue-400" />
                              <span className="font-medium text-slate-700">
                                {obraSocial ? obraSocial.nombre : "Particular"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => abrirModalEditar(paciente)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  eliminarPaciente(
                                    paciente.id,
                                    paciente.nombre,
                                    paciente.apellido,
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No se encontraron pacientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pacientesFiltrados.length > pacientesPorPagina && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-500">
                  Mostrando del {indicePrimerPaciente + 1} al{" "}
                  {Math.min(indiceUltimoPaciente, pacientesFiltrados.length)} de{" "}
                  {pacientesFiltrados.length} resultados
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaActual === 1}
                    className={`p-2 rounded-lg border ${paginaActual === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-2">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(prev + 1, totalPaginas),
                      )
                    }
                    disabled={paginaActual === totalPaginas}
                    className={`p-2 rounded-lg border ${paginaActual === totalPaginas ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {formData.id ? "Editar Paciente" : "Agregar Paciente"}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarPaciente} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* NUEVOS CAMPOS: OBRA SOCIAL Y CREDENCIAL */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Obra Social / Prepaga
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                    value={formData.obra_social_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        obra_social_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Particular (Sin Obra Social)</option>
                    {obrasSociales.map((os) => (
                      <option key={os.id} value={os.id}>
                        {os.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° de Credencial
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional..."
                    disabled={!formData.obra_social_id}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={formData.numero_credencial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numero_credencial: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {formData.id ? "Guardar Cambios" : "Guardar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
