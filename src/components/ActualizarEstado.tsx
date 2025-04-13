import { useState, useEffect } from "react";

export default function ActualizarEstado() {
  const [procesiones, setProcesiones] = useState<any[]>([]);
  const [selectedProcesion, setSelectedProcesion] = useState<string>("");
  const [estado, setEstado] = useState<string>("OK");
  const [alerta, setAlerta] = useState<string>("Sin incidencias");
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "success"; texto: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const API_BASE = "https://owntracks-api.semanasantatracker.workers.dev";

  useEffect(() => {
    const verificarSesion = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) return redirectToLogin();

      try {
        const res = await fetch(`${API_BASE}/verify-session`, {
          headers: { Authorization: sessionId },
        });

        const data = await res.json();
        if (!res.ok || !data.valid) throw new Error();
        setIsSessionValid(true);
      } catch {
        redirectToLogin();
      }
    };

    const redirectToLogin = () => {
      localStorage.removeItem("sessionId");
      window.location.href = "/admin";
    };

    verificarSesion();
  }, []);

  useEffect(() => {
    const cargarProcesiones = async () => {
      try {
        const res = await fetch(`${API_BASE}/procesiones`);
        if (!res.ok) throw new Error("Error al cargar las procesiones");

        const data = await res.json();
        setProcesiones(data);
        if (data.length > 0) {
          setSelectedProcesion(data[0].id);
          setEstado(data[0].estado);
          setAlerta(data[0].alerta || "Sin incidencias");
        }
      } catch {
        setMensaje({ tipo: "error", texto: "No se pudieron cargar las procesiones." });
      } finally {
        setIsLoading(false);
      }
    };

    if (isSessionValid) {
      cargarProcesiones();
    }
  }, [isSessionValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      setMensaje({ tipo: "error", texto: "Sesión no válida. Vuelve a iniciar sesión." });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/actualizar-estado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionId,
        },
        body: JSON.stringify({ id: selectedProcesion, estado, alerta }),
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || "Error al actualizar estado");
      }

      setMensaje({ tipo: "success", texto: "Estado actualizado correctamente" });
    } catch (err: any) {
      setMensaje({ tipo: "error", texto: err.message || "Error desconocido" });
    }
  };

  const formatNombre = (id: string) =>
    id
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  if (!isSessionValid || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 text-gray-900 dark:text-gray-100">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
        <h1 className="text-xl font-bold mb-4 text-center">Actualizar Estado de Procesión</h1>

        {mensaje && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              mensaje.tipo === "error"
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Procesión</label>
            <select
              value={selectedProcesion}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedProcesion(id);
                const p = procesiones.find((p) => p.id === id);
                if (p) {
                  setEstado(p.estado);
                  setAlerta(p.alerta || "Sin incidencias");
                }
              }}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded"
            >
              {procesiones.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatNombre(p.id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded"
            >
              <option value="OK">Correcto</option>
              <option value="Directo">En directo</option>
              <option value="Cancelada por lluvia">Cancelada por lluvia</option>
              <option value="Retrasada">Retrasada</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alerta</label>
            <select
              value={alerta}
              onChange={(e) => setAlerta(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded"
            >
              <option value="Sin incidencias">Sin incidencias</option>
              <option value="Incidencias leves">Incidencias leves</option>
              <option value="Incidencias graves">Incidencias graves</option>
              <option value="Emergencia">Emergencia</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Actualizar
          </button>
        </form>
      </div>
    </div>
  );
}
