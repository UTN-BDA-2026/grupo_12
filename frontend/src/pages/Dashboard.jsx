import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar as CalendarIcon,
  Activity,
  Stethoscope,
  Clock,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BriefcaseMedical,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, isToday, subDays, isAfter } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState({
    totalPacientes: 0,
    totalMedicos: 0,
    turnosHoy: 0,
    turnosSemana: 0,
  });

  const [datosGraficoBarras, setDatosGraficoBarras] = useState([]);
  const [datosGraficoTorta, setDatosGraficoTorta] = useState([]);
  const [proximosTurnos, setProximosTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [paginaTurnos, setPaginaTurnos] = useState(1);
  const turnosPorPagina = 5;

  // Paleta de colores ejecutiva (5 colores para el Top 5, y el gris para "Otros")
  const COLORES_TORTA = ["#2563eb", "#0d9488", "#d97706", "#4f46e5", "#be185d"];
  const COLOR_OTROS = "#94a3b8"; // Gris elegante para agrupar

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [resPacientes, resMedicos, resTurnos] = await Promise.all([
          fetch("http://127.0.0.1:8000/pacientes/"),
          fetch("http://127.0.0.1:8000/medicos/"),
          fetch("http://127.0.0.1:8000/turnos/"),
        ]);

        const pacientes = resPacientes.ok ? await resPacientes.json() : [];
        const medicos = resMedicos.ok ? await resMedicos.json() : [];
        const turnos = resTurnos.ok ? await resTurnos.json() : [];

        // 1. Cálculos de KPIs Ejecutivos
        const turnosDeHoy = turnos.filter((t) => isToday(new Date(t.fecha)));
        const fechaLimite = subDays(new Date(), 7);
        const volumenSemanal = turnos.filter((t) =>
          isAfter(new Date(t.fecha), fechaLimite),
        ).length;

        setMetricas({
          totalPacientes: pacientes.length,
          totalMedicos: medicos.length,
          turnosHoy: turnosDeHoy.length,
          turnosSemana: volumenSemanal,
        });

        // 2. Gráfico de Barras
        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i);
          return {
            fecha: format(d, "yyyy-MM-dd"),
            nombre: format(d, "EEE dd", { locale: es }).toUpperCase(),
            turnos: turnos.filter(
              (t) =>
                format(new Date(t.fecha), "yyyy-MM-dd") ===
                format(d, "yyyy-MM-dd"),
            ).length,
          };
        });
        setDatosGraficoBarras(ultimos7Dias);

        // 3. Gráfico de Torta: LÓGICA DE "TOP 5 + OTROS"
        const cargaMedicos = medicos
          .map((med) => {
            const cantidad = turnos.filter(
              (t) => t.medico_id === med.id,
            ).length;
            return { name: `Dr/a. ${med.apellido}`, value: cantidad };
          })
          .filter((m) => m.value > 0)
          .sort((a, b) => b.value - a.value); // Ordenamos de mayor a menor

        let datosTortaFinal = cargaMedicos;

        // Si hay más de 5 médicos con turnos, agrupamos los restantes
        if (cargaMedicos.length > 5) {
          const top5 = cargaMedicos.slice(0, 5);
          const otrosValor = cargaMedicos
            .slice(5)
            .reduce((sum, current) => sum + current.value, 0);
          datosTortaFinal = [
            ...top5,
            { name: "Otros Profesionales", value: otrosValor, isOtros: true },
          ];
        }

        setDatosGraficoTorta(datosTortaFinal);

        // 4. Próximos Turnos
        const ahora = new Date();
        const turnosFuturos = turnos
          .filter(
            (t) =>
              isAfter(new Date(t.fecha), ahora) && isToday(new Date(t.fecha)),
          )
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .map((t) => {
            const p = pacientes.find((pac) => pac.id === t.paciente_id);
            const m = medicos.find((med) => med.id === t.medico_id);
            return {
              ...t,
              paciente_nombre: p ? `${p.apellido}, ${p.nombre}` : "Desconocido",
              medico_nombre: m ? `Dr. ${m.apellido}` : "",
            };
          });
        setProximosTurnos(turnosFuturos);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const totalPaginas = Math.ceil(proximosTurnos.length / turnosPorPagina) || 1;
  const turnosMostrados = proximosTurnos.slice(
    (paginaTurnos - 1) * turnosPorPagina,
    paginaTurnos * turnosPorPagina,
  );

  if (cargando) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-slate-500 font-medium flex items-center gap-3">
          <Activity className="animate-spin text-blue-600" /> Compilando
          métricas ejecutivas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <TrendingUp className="text-blue-600" size={28} /> Resumen Ejecutivo
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Indicadores clave de rendimiento (KPIs) de la clínica
          </p>
        </div>
        <div className="text-sm font-bold text-slate-600 bg-white px-5 py-2.5 rounded-lg border border-slate-200 shadow-sm uppercase tracking-wide">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Users size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Base de Pacientes
            </p>
          </div>
          <h3 className="text-3xl font-black text-slate-800 relative z-10 mt-1">
            {metricas.totalPacientes}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CalendarIcon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Atenciones Hoy
            </p>
          </div>
          <h3 className="text-3xl font-black text-slate-800 relative z-10 mt-1">
            {metricas.turnosHoy}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <BriefcaseMedical size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Staff Médico
            </p>
          </div>
          <h3 className="text-3xl font-black text-slate-800 relative z-10 mt-1">
            {metricas.totalMedicos}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <Activity size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Volumen Semanal
            </p>
          </div>
          <h3 className="text-3xl font-black text-slate-800 relative z-10 mt-1">
            {metricas.turnosSemana}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wide flex items-center gap-2">
              Evolución de Tráfico{" "}
              <span className="text-xs font-normal text-slate-400 normal-case">
                (Últimos 7 días)
              </span>
            </h3>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosGraficoBarras}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="nombre"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="turnos"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col shrink-0">
            <h3 className="text-base font-bold text-slate-800 mb-4 uppercase tracking-wide">
              Top 5 Profesionales con más Turnos
            </h3>
            <div className="flex-1 flex items-center overflow-hidden">
              <div className="w-1/2 h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosGraficoTorta}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {datosGraficoTorta.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.isOtros
                              ? COLOR_OTROS
                              : COLORES_TORTA[index % COLORES_TORTA.length]
                          }
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 pl-6 flex flex-col justify-center gap-3">
                {datosGraficoTorta.length > 0 ? (
                  datosGraficoTorta.map((med, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 text-sm shrink-0 bg-slate-50 p-2.5 rounded-lg border ${med.isOtros ? "border-dashed border-slate-300 bg-white" : "border-slate-100"}`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{
                          backgroundColor: med.isOtros
                            ? COLOR_OTROS
                            : COLORES_TORTA[index % COLORES_TORTA.length],
                        }}
                      />
                      <span
                        className={`font-medium truncate ${med.isOtros ? "text-slate-500 italic" : "text-slate-700"}`}
                      >
                        {med.name}
                      </span>
                      <span
                        className={`font-black ml-auto bg-white px-2 py-0.5 rounded shadow-sm ${med.isOtros ? "text-slate-500" : "text-slate-800"}`}
                      >
                        {med.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 italic">
                    Datos insuficientes para el análisis
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> Turnos pendientes
              hoy
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {proximosTurnos.length} Total
            </span>
          </div>

          <div className="flex-1 flex flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4">
              {turnosMostrados.length > 0 ? (
                <div className="space-y-3">
                  {turnosMostrados.map((turno) => (
                    <div
                      key={turno.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-800 text-sm truncate pr-2">
                          {turno.paciente_nombre}
                        </p>
                        <span className="text-xs font-black text-white bg-slate-800 px-2 py-1 rounded shrink-0 shadow-sm">
                          {format(new Date(turno.fecha), "HH:mm")} hs
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Stethoscope size={14} className="text-blue-500" />{" "}
                          {turno.medico_nombre}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {turno.motivo.substring(0, 15)}
                          {turno.motivo.length > 15 ? "..." : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <CalendarIcon size={40} className="mb-3 text-slate-300" />
                  <p className="text-sm font-medium">
                    Agenda completada por hoy.
                  </p>
                </div>
              )}
            </div>

            {proximosTurnos.length > turnosPorPagina && (
              <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pág {paginaTurnos} / {totalPaginas}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPaginaTurnos((p) => Math.max(1, p - 1))}
                    disabled={paginaTurnos === 1}
                    className="p-1.5 rounded bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setPaginaTurnos((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaTurnos === totalPaginas}
                    className="p-1.5 rounded bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <button
              onClick={() => navigate("/agenda")}
              className="w-full py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Gestionar Agenda <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
