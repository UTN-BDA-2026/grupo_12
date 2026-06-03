import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, CalendarCheck, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [datosEstadisticos, setDatosEstadisticos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Le pegamos al endpoint de Raw SQL que hiciste en el backend
    fetch("http://127.0.0.1:8000/estadisticas/turnos-por-medico")
      .then((res) => res.json())
      .then((response) => {
        // Formateamos los datos para que el gráfico los entienda fácil
        const datosFormateados = response.data.map((med) => ({
          nombre: `Dr/a. ${med.apellido}`,
          turnos: med.cantidad_turnos,
        }));
        setDatosEstadisticos(datosFormateados);
        setCargando(false);
      })
      .catch((error) => console.error("Error al cargar estadísticas:", error));
  }, []);

  // Calculamos totales rápidos para las tarjetas superiores
  const totalTurnos = datosEstadisticos.reduce(
    (acc, curr) => acc + curr.turnos,
    0,
  );
  const totalMedicos = datosEstadisticos.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Resumen Operativo</h2>
        <p className="text-gray-500">
          Métricas en tiempo real procesadas vía Raw SQL
        </p>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Turnos Asignados
            </p>
            <p className="text-2xl font-bold text-gray-800">{totalTurnos}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Médicos en Nómina
            </p>
            <p className="text-2xl font-bold text-gray-800">{totalMedicos}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Rendimiento Motor
            </p>
            <p className="text-xl font-bold text-gray-800">
              Óptimo (Bypass ORM)
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Analítico */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Volumen de Atención por Profesional
        </h3>
        {cargando ? (
          <div className="h-72 flex items-center justify-center text-gray-400">
            Cargando motor analítico...
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosEstadisticos}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="nombre"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="turnos"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
