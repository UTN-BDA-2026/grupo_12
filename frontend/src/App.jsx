import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

function App() {
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [venta, setVenta] = useState({ id_p: "", cant: 1 });
  const [nuevoP, setNuevoP] = useState({
    nombre: "",
    id_cat: 1,
    id_mar: 1,
    precio: 0,
    stock: 0,
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // --- NUEVO ESTADO PARA LAS PESTAÑAS ---
  // Puede ser: 'inventario', 'operaciones', o 'historial'
  const [vistaActiva, setVistaActiva] = useState("inventario");

  const cargarTodo = () => {
    fetch("http://localhost:8000/productos")
      .then((r) => r.json())
      .then(setProductos);
    fetch("http://localhost:8000/historial")
      .then((r) => r.json())
      .then(setHistorial);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleVenta = async (e) => {
    e.preventDefault();
    if (!venta.id_p || venta.cant <= 0) {
      toast.error("Seleccioná un producto y una cantidad válida.");
      return;
    }
    const p = productos.find((x) => x.id_producto === parseInt(venta.id_p));
    try {
      await fetch("http://localhost:8000/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: p.id_producto,
          cantidad: venta.cant,
          precio_unitario: p.precio_actual,
        }),
      });
      setVenta({ id_p: "", cant: 1 });
      cargarTodo();
      toast.success(`¡Venta registrada! ${venta.cant}x ${p.nombre}`);
      // Opcional: Volver a la pestaña de inventario para ver el stock bajar
      setVistaActiva("inventario");
    } catch (error) {
      toast.error("Error al procesar la venta.");
    }
  };

  const handleNuevoP = async (e) => {
    e.preventDefault();
    if (!nuevoP.nombre || nuevoP.precio <= 0) {
      toast.warning("Completá el nombre y un precio válido.");
      return;
    }
    try {
      await fetch("http://localhost:8000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoP.nombre,
          id_categoria: nuevoP.id_cat,
          id_marca: nuevoP.id_mar,
          precio_actual: nuevoP.precio,
          stock_actual: nuevoP.stock,
        }),
      });
      setNuevoP({ nombre: "", id_cat: 1, id_mar: 1, precio: 0, stock: 0 });
      cargarTodo();
      toast.success("¡Componente guardado en la base de datos!");
      setVistaActiva("inventario");
    } catch (error) {
      toast.error("Error al guardar el producto.");
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      filtroCategoria === "" || p.categoria === filtroCategoria;
    return coincideTexto && coincideCategoria;
  });

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all shadow-sm";

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800">
      <Toaster richColors position="top-right" />

      {/* --- ENCABEZADO CON COLOR FUERTE Y PESTAÑAS --- */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 pt-8 pb-4 shadow-md">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span className="p-2 bg-indigo-600 rounded-lg text-xl">⚡</span>
                SysHardware
              </h1>
              <p className="text-indigo-200 text-sm mt-1">
                Gestión de Inventario y Ventas
              </p>
            </div>

            {/* Pequeño widget de stats en el header */}
            <div className="hidden md:flex gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <p className="text-indigo-200 text-xs font-semibold uppercase">
                  Total Productos
                </p>
                <p className="text-white font-bold text-lg">
                  {productos.length}
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <p className="text-indigo-200 text-xs font-semibold uppercase">
                  Ventas Reg.
                </p>
                <p className="text-white font-bold text-lg">
                  {historial.length}
                </p>
              </div>
            </div>
          </div>

          {/* Menú de Pestañas */}
          <div className="flex space-x-1 border-b border-indigo-800">
            <button
              onClick={() => setVistaActiva("inventario")}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${vistaActiva === "inventario" ? "border-indigo-400 text-white" : "border-transparent text-indigo-300 hover:text-white hover:bg-white/5"}`}
            >
              📦 Inventario
            </button>
            <button
              onClick={() => setVistaActiva("operaciones")}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${vistaActiva === "operaciones" ? "border-indigo-400 text-white" : "border-transparent text-indigo-300 hover:text-white hover:bg-white/5"}`}
            >
              ⚙️ Carga y Ventas
            </button>
            <button
              onClick={() => setVistaActiva("historial")}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${vistaActiva === "historial" ? "border-indigo-400 text-white" : "border-transparent text-indigo-300 hover:text-white hover:bg-white/5"}`}
            >
              📜 Historial
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO DINÁMICO (Cambia según la pestaña) --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* VISTA 1: INVENTARIO */}
        {vistaActiva === "inventario" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar componente..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block pl-10 p-2.5 outline-none transition-all"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                  <select
                    className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2.5 outline-none transition-all"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Procesadores">Procesadores</option>
                    <option value="Placas de Video">Placas de Video</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Gabinetes">Gabinetes</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Producto</th>
                      <th className="px-6 py-4 font-semibold">Categoría</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Precio
                      </th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((p) => (
                        <tr
                          key={p.id_producto}
                          className="hover:bg-indigo-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                            {p.id_producto}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {p.nombre}
                            </div>
                            <div className="text-xs text-indigo-600 font-medium">
                              {p.marca}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {p.categoria}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">
                            ${p.precio_actual}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${p.stock_actual <= 5 ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
                            >
                              {p.stock_actual}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No se encontraron productos. Intentá otra búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VISTA 2: OPERACIONES (VENTA Y CARGA) */}
        {vistaActiva === "operaciones" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                  Registrar Venta
                </h2>
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  🛒
                </span>
              </div>
              <form onSubmit={handleVenta} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Producto a vender
                  </label>
                  <select
                    className={inputClass}
                    value={venta.id_p}
                    onChange={(e) =>
                      setVenta({ ...venta, id_p: e.target.value })
                    }
                  >
                    <option value="">-- Seleccionar producto --</option>
                    {productos.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre} (Stock: {p.stock_actual})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={venta.cant}
                    onChange={(e) =>
                      setVenta({ ...venta, cant: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors shadow-md shadow-indigo-200 active:scale-[0.98]"
                >
                  Procesar Venta
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                  Ingreso de Stock
                </h2>
                <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  📦
                </span>
              </div>
              <form onSubmit={handleNuevoP} className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Nombre del Componente
                  </label>
                  <input
                    placeholder="Ej: Memoria RAM Corsair 16GB"
                    className={inputClass}
                    value={nuevoP.nombre}
                    onChange={(e) =>
                      setNuevoP({ ...nuevoP, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={nuevoP.precio}
                    onChange={(e) =>
                      setNuevoP({ ...nuevoP, precio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={nuevoP.stock}
                    onChange={(e) =>
                      setNuevoP({ ...nuevoP, stock: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    className={inputClass}
                    value={nuevoP.id_cat}
                    onChange={(e) =>
                      setNuevoP({ ...nuevoP, id_cat: e.target.value })
                    }
                  >
                    <option value="1">Procesadores</option>
                    <option value="2">Placas de Video</option>
                    <option value="3">Periféricos</option>
                    <option value="4">Gabinetes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Marca
                  </label>
                  <select
                    className={inputClass}
                    value={nuevoP.id_mar}
                    onChange={(e) =>
                      setNuevoP({ ...nuevoP, id_mar: e.target.value })
                    }
                  >
                    <option value="1">AMD</option>
                    <option value="2">Nvidia</option>
                    <option value="3">Redragon</option>
                    <option value="4">Lian Li</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="col-span-2 mt-4 bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-700 text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
                >
                  Guardar Nuevo Producto
                </button>
              </form>
            </section>
          </div>
        )}

        {/* VISTA 3: HISTORIAL */}
        {vistaActiva === "historial" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Registro de Movimientos
                  </h3>
                  <p className="text-sm text-slate-500">
                    Todas las ventas procesadas por la base de datos.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                      <th className="px-6 py-4 font-semibold">
                        Producto Vendido
                      </th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Cant.
                      </th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historial.length > 0 ? (
                      historial.map((h) => (
                        <tr
                          key={h.id_venta}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(h.fecha_venta).toLocaleDateString()}{" "}
                            <span className="text-xs ml-2 opacity-70">
                              {new Date(h.fecha_venta).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {h.producto}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600 font-medium">
                            {h.cantidad}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-indigo-600">
                            ${h.subtotal}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Aún no hay ventas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
