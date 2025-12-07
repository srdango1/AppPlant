// src/components/weather/CurrentWeatherCard.jsx

import React from 'react';
import { getWeatherBackgroundImage } from '../../../utils/utilsWeather'; 

/**
 * Tarjeta Principal de Clima Actual.
 * Muestra la información meteorológica más relevante sobre un fondo dinámico
 * que cambia según las condiciones (lluvia, sol, nubes).
 * * @param {string|number} temperature - Temperatura actual.
 * @param {string} description - Descripción textual del clima (usada para determinar el fondo).
 * @param {string} iconName - Icono visual del clima.
 * @param {string} city - Nombre de la ciudad.
 * @param {string|number} humidity - Porcentaje de humedad (pasado como prop aunque no se use visualmente en esta versión simplificada).
 * @param {string|number} wind - Velocidad del viento.
 */

function WeatherWidget({ temperature, description, iconName, city, humidity, wind }) {
  // Estado de carga defensivo
  if (!temperature) {
     return <div>Cargando...</div>;
  }
// Lógica de Negocio Visual: Obtener la imagen de fondo basada en la descripción
  const bgImage = getWeatherBackgroundImage(description);

  return (
    <div className="mb-6">
      
      <div 
        className="rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 relative bg-cover bg-center group"
        style={{ backgroundImage: `url(${bgImage})`, minHeight: '200px' }} 
      >
        {/* Capa de superposición (Overlay) oscura para mejorar la legibilidad del texto blanco */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-0"></div>

        {/* Contenido principal (z-index superior para estar sobre el overlay) */}  
        <div className="p-6 flex flex-col gap-3 relative z-10 text-white">
          
          <p className="text-lg font-bold tracking-[-0.015em] drop-shadow-md">
            Clima Actual - {city}
          </p>

          <div className="flex items-center gap-4">
            <span 
                className="material-symbols-outlined text-white drop-shadow-md" 
                style={{ fontSize: '64px' }}
            >
              {iconName}
            </span>
            
            <p className="text-6xl font-bold leading-none drop-shadow-md">
              {temperature}°C
            </p>
          </div>

          <div className='flex flex-col gap-1 mt-1'>
            <p className="text-base font-medium capitalize drop-shadow-md">
              {description}
            </p>
            
            
          </div>

        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;