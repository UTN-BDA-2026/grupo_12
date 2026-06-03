import { Outlet, Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Stethoscope,
  FileText,
  LayoutDashboard,
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();

  const menuItems = [
    { path: "/", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    {
      path: "/agenda",
      name: "Agenda de Turnos",
      icon: <CalendarDays size={20} />,
    },
    { path: "/pacientes", name: "Pacientes", icon: <Users size={20} /> },
    {
      path: "/medicos",
      name: "Profesionales",
      icon: <Stethoscope size={20} />,
    },
    {
      path: "/historias-clinicas",
      name: "Historias Clínicas",
      icon: <FileText size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Profesional */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">MediSys Pro</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestión Clínica Avanzada
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              MC
            </div>
            <div>
              <p className="text-sm font-medium">Matias Calvente</p>
              <p className="text-xs text-slate-400">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal (Acá renderizan las pantallas) */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Panel de Control
          </h2>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
            Sistema Online
          </span>
        </header>

        <div className="p-8">
          {/* El Outlet inyecta la página en la que estemos parados */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
