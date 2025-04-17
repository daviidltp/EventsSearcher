import { useState, useEffect } from "react";

export default function ActualizarEstado() {
  const [procesiones, setProcesiones] = useState<any[]>([]);
  const [selectedProcesion, setSelectedProcesion] = useState<string>("");
  const [estado, setEstado] = useState<string>("OK");
  const [alerta, setAlerta] = useState<string>("");
  const [gps, setGps] = useState<string>("gps-1");
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "success"; texto: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch("https://owntracks-api.semanasantatracker.workers.dev/verify-session", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok || !data.valid) {
          throw new Error("Sesión no válida");
        }

        setIsSessionValid(true);
      } catch {
        window.location.href = "/admin";
      }
    };

    verificarSesion();
  }, []);

  useEffect(() => {
    const cargarProcesiones = async () => {
      try {
        const res = await fetch("https://owntracks-api.semanasantatracker.workers.dev/procesiones");
        if (!res.ok) throw new Error("Error al cargar las procesiones");

        const data = await res.json();
        setProcesiones(data);
        if (data.length > 0) {
          setSelectedProcesion(data[0].id);
          setEstado(data[0].estado);
          setAlerta(data[0].alerta || "");
          setGps(data[0].gps || "");
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

    try {
      const res = await fetch("https://owntracks-api.semanasantatracker.workers.dev/actualizar-estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: selectedProcesion, estado, alerta, gps }),
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
                  if (p) {
                    setEstado(p.estado);
                    setAlerta(p.alerta || "");
                    setGps(p.gps || ""); // Usa "" si no tiene gps
                  }                  
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
              <option value="OK">Mostrar recorrido</option>
              <option value="Directo">En trayecto de ida</option>
              <option value="Finalizada">En trayecto de vuelta</option>
              <option value="Cancelada por lluvia">Cancelada por lluvia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensaje informativo</label>
            <textarea
              value={alerta}
              onChange={(e) => setAlerta(e.target.value)}
              rows={3}
              placeholder="Ej. Cambios en el recorrido, hora estimada, etc."
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GPS</label>
            <select
              value={gps}
              onChange={(e) => setGps(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded"
            >
              <option value="gps-1">gps-1</option>
              <option value="gps-2">gps-2</option>
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
