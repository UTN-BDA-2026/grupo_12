import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Profesionales from "./pages/Profesionales";

const AgendaPlaceholder = () => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold mb-4">Agenda Médica</h2>
    <p className="text-gray-500">
      Aquí desarrollaremos el calendario interactivo.
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<AgendaPlaceholder />} />
          <Route
            path="pacientes"
            element={
              <div className="p-6 text-gray-500">
                Módulo de Pacientes en construcción...
              </div>
            }
          />

          {/* ACÁ REEMPLAZAMOS EL PLACEHOLDER POR EL COMPONENTE REAL */}
          <Route path="medicos" element={<Profesionales />} />

          <Route
            path="historias-clinicas"
            element={
              <div className="p-6 text-gray-500">
                Módulo de Historias Clínicas (JSONB) en construcción...
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
