import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  UserRound,
  Stethoscope,
  X,
} from "lucide-react";

export default function Profesionales() {
  const [medicos, setMedicos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [especialidades, setEspecialidades] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);

  // Agregamos "id" al estado. Si id es null, estamos creando. Si tiene un número, estamos editando.
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    apellido: "",
    matricula: "",
    especialidad_id: "",
  });

  const cargarDatos = () => {
    fetch("http://127.0.0.1:8000/medicos/")
      .then((res) => res.json())
      .then((data) => {
        setMedicos(data);
        setCargando(false);
      })
      .catch((err) => console.error("Error al cargar médicos:", err));

    fetch("http://127.0.0.1:8000/especialidades/")
      .then((res) => res.json())
      .then((data) => setEspecialidades(data))
      .catch((err) => console.error("Error al cargar especialidades:", err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- NUEVO: FUNCIÓN PARA ABRIR MODAL DE ALTA ---
  const abrirModalNuevo = () => {
    setFormData({
      id: null,
      nombre: "",
      apellido: "",
      matricula: "",
      especialidad_id: "",
    });
    setMostrarModal(true);
  };

  // --- NUEVO: FUNCIÓN PARA ABRIR MODAL DE EDICIÓN ---
  const abrirModalEditar = (medico) => {
    setFormData({
      id: medico.id,
      nombre: medico.nombre,
      apellido: medico.apellido,
      matricula: medico.matricula,
      especialidad_id: medico.especialidad_id || "",
    });
    setMostrarModal(true);
  };

  // --- MODIFICADO: POST y PUT DINÁMICO ---
  const guardarMedico = async (e) => {
    e.preventDefault();

    // Determinamos si es una edición o una creación
    const esEdicion = formData.id !== null;
    const url = esEdicion
      ? `http://127.0.0.1:8000/medicos/${formData.id}`
      : "http://127.0.0.1:8000/medicos/";
    const metodo = esEdicion ? "PUT" : "POST";

    // Separamos el ID del resto de los datos porque a FastAPI no le gusta recibir el ID en el body del POST/PUT
    const { id, ...datosAEnviar } = formData;

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
        alert(`Error del servidor: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  // --- NUEVO: FUNCIÓN PARA ELIMINAR (DELETE) ---
  const eliminarMedico = async (id, nombre, apellido) => {
    // Alerta nativa de confirmación
    if (
      !window.confirm(
        `¿Estás seguro que deseás eliminar al Dr/a. ${nombre} ${apellido}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/medicos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        cargarDatos(); // Recargamos la tabla para que desaparezca
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const medicosFiltrados = medicos.filter((medico) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${medico.nombre} ${medico.apellido}`.toLowerCase();
    return nombreCompleto.includes(termino);
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="text-blue-600" />
            Staff Médico
          </h2>
          <p className="text-gray-500 mt-1">
            Gestión de profesionales y especialidades de la clínica
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Profesional
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Profesional
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Matrícula
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Especialidad
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicosFiltrados.length > 0 ? (
                  medicosFiltrados.map((medico) => {
                    const especialidadEncontrada = especialidades.find(
                      (esp) => esp.id === medico.especialidad_id,
                    );
                    const nombreEspecialidad = especialidadEncontrada
                      ? especialidadEncontrada.nombre
                      : "Médico General";

                    return (
                      <tr
                        key={medico.id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <UserRound size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {medico.nombre} {medico.apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID Interno: {medico.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          {medico.matricula}
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
                            {nombreEspecialidad}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* --- BOTÓN EDITAR CONECTADO --- */}
                            <button
                              onClick={() => abrirModalEditar(medico)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            {/* --- BOTÓN ELIMINAR CONECTADO --- */}
                            <button
                              onClick={() =>
                                eliminarMedico(
                                  medico.id,
                                  medico.nombre,
                                  medico.apellido,
                                )
                              }
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
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
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No se encontraron profesionales con ese criterio de
                      búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              {/* El título cambia dinámicamente */}
              <h3 className="text-xl font-bold text-gray-800">
                {formData.id
                  ? "Editar Profesional"
                  : "Agregar Nuevo Profesional"}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarMedico} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula Provincial/Nacional
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.matricula}
                  onChange={(e) =>
                    setFormData({ ...formData, matricula: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.especialidad_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      especialidad_id: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="" disabled>
                    Seleccioná una especialidad...
                  </option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {/* El botón también cambia dinámicamente */}
                  {formData.id ? "Guardar Cambios" : "Guardar Profesional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
