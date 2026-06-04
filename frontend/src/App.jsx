import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Profesionales from "./pages/Profesionales";
import Agenda from "./pages/Agenda";
import Pacientes from "./pages/Pacientes";
import HistoriasClinicas from "./pages/Historiasclinicas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />

          <Route
            path="pacientes"
            element={
              <div className="p-6 text-gray-500">
                <Pacientes />
              </div>
            }
          />
          <Route path="medicos" element={<Profesionales />} />
          <Route path="historias-clinicas" element={<HistoriasClinicas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
