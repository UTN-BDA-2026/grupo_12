import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  UserRound,
  Stethoscope,
} from "lucide-react";

export default function Profesionales() {
  const [medicos, setMedicos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Consumimos el endpoint tradicional que armaste con SQLAlchemy
    fetch("http://127.0.0.1:8000/medicos/")
      .then((res) => res.json())
      .then((data) => {
        setMedicos(data);
        setCargando(false);
      })
      .catch((err) => console.error("Error al cargar médicos:", err));
  }, []);

  // Lógica del buscador en tiempo real
  const medicosFiltrados = medicos.filter((medico) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${medico.nombre} ${medico.apellido}`.toLowerCase();
    const especialidad = medico.especialidad
      ? medico.especialidad.toLowerCase()
      : "";

    return nombreCompleto.includes(termino) || especialidad.includes(termino);
  });

  return (
    <div className="space-y-6">
      {/* Encabezado y Botón de Alta */}
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Nuevo Profesional
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o especialidad..."
          className="w-full outline-none text-gray-700 bg-transparent"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de Datos (DataGrid) */}
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
                  medicosFiltrados.map((medico) => (
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
                      <td className="p-4 text-gray-600">{medico.matricula}</td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
                          {medico.especialidad || "Médico General"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
    </div>
  );
}
