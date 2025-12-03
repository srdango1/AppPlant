// src/components/weather/CurrentWeatherCard.jsx

import React from 'react';

/**
 * Muestra el clima actual con ilustración grande.
 * @param {string} temp - Temperatura actual (ej: "22°C").
 * @param {string} description - Descripción del clima (ej: "Soleado").
 * @param {string} city - Ciudad (ej: "Buenos Aires, Argentina").
 * @param {string} imageUrl - URL de la imagen de fondo.
 */
import { getWeatherBackgroundImage } from '../../../utils/utilsWeather'; 

function WeatherWidget({ temperature, description, iconName, city, humidity, wind }) {
  
  if (!temperature) {
     return <div>Cargando...</div>;
  }

  const bgImage = getWeatherBackgroundImage(description);

  return (
    <div className="mb-6">
      
      <div 
        className="rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 relative bg-cover bg-center group"
        style={{ backgroundImage: `url(${bgImage})`, minHeight: '200px' }} 
      >
        
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-0"></div>

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