import React, { useState, useEffect } from 'react';

// URL base de tu backend Python (Reemplazar con la URL de Render después del despliegue)
const API_BASE_URL = 'http://localhost:8000'; 

// Usamos Tailwind CSS para estilizar el componente en un solo archivo.
function App() {
  const [message, setMessage] = useState('Cargando mensaje del backend...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener datos del backend Python
    const fetchBackendData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Llama a la ruta /api/hello de tu futuro backend FastAPI
        const response = await fetch(`${API_BASE_URL}/api/hello`); 
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        // Asume que el backend devuelve { "message": "Hola desde Python" }
        setMessage(data.message);
      } catch (err) {
        console.error("Error al conectar con el backend:", err);
        setError("Error al conectar con el backend. Asegúrate de que el servidor Python esté corriendo en " + API_BASE_URL);
        setMessage("¡Falló la conexión!");
      } finally {
        setLoading(false);
      }
    };

    fetchBackendData();
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    // Contenedor principal con diseño responsivo
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-t-4 border-indigo-500">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          React Frontend (Vercel)
        </h1>
        
        <p className="text-sm text-indigo-600 mb-6">
          Conectado a Python Backend (Render)
        </p>

        <div className={`p-4 rounded-lg transition duration-300 ${loading ? 'bg-indigo-100' : (error ? 'bg-red-100' : 'bg-green-100')}`}>
          <h2 className="text-xl font-semibold mb-2">
            Mensaje del Servidor:
          </h2>
          {loading && <p className="text-gray-700 animate-pulse">Cargando...</p>}
          {error && <p className="text-red-700 font-medium">{error}</p>}
          {!loading && !error && (
            <p className="text-green-700 font-mono break-words">
              {message}
            </p>
          )}
        </div>
        
        <footer className="mt-8 text-xs text-gray-500">
          <p>Sigue la guía en `project_guide.md` para completar la configuración.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
