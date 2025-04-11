import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://owntracks-api.semanasantatracker.workers.dev/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        localStorage.setItem('sessionId', sessionId);
        window.location.href = '/admin/actualizar-estado';
      } else {
        const message = await response.text();
        setError(message || 'Error al autenticar');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <div className="bg-black dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto ">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Acceso Admin</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
