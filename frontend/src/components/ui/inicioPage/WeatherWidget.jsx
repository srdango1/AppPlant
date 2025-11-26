import React from 'react';

/**
 * Componente para mostrar la tarjeta de clima actual.
 * @param {string} city - La ciudad del clima (ej: "Quito").
 * @param {string} temperature - La temperatura actual (ej: "24°C").
 * @param {string} description - Descripción del clima (ej: "Soleado con pocas nubes").
 * @param {string} details - Detalles adicionales (ej: "Humedad: 55%, Viento: 10 km/h").
 * @param {string} iconName - Nombre del icono de Material Symbols (ej: "partly_cloudy_day").
 * @param {string} imageUrl - URL de la imagen de fondo.
 * 
 * La informacion mostrada se encuentra al comienzo del function y de nuevo son datos fijos. pero se supone que lo deberia de recibir
 * desde inicio.jsx si se revisa ahi estan fijos :D
 */
function WeatherWidget({ temperature, condition, iconName, city }) {
  if (!temperature){
    return(
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                <span className="material-symbols-outlined text-gray-500">sync</span>
                <p className="text-sm text-gray-500">Clima no disponible</p>
            </div>
    )
  }
  return (
        <div className="flex flex-col gap-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-100">Clima en {city}</h4>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                
                {/* Ícono */}
                <span className="material-symbols-outlined text-accent text-3xl text-blue-500">
                    {iconName} 
                </span>
                
                <div className="flex flex-col">
                    {/* Temperatura */}
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{temperature}°C</p>
                    
                    {/* Condición */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{condition}</p>
                </div>
            </div>
        </div>
    );
}

export default WeatherWidget;