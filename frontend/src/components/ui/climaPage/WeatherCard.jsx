// src/components/weather/CurrentWeatherCard.jsx

import React from 'react';

/**
 * Muestra el clima actual con ilustración grande.
 * @param {string} temp - Temperatura actual (ej: "22°C").
 * @param {string} description - Descripción del clima (ej: "Soleado").
 * @param {string} city - Ciudad (ej: "Buenos Aires, Argentina").
 * @param {string} imageUrl - URL de la imagen de fondo.
 */
function CurrentWeatherCard({ temp, description, city, imageUrl }) {
  return (
    <div className="p-4 @container bg-card-light dark:bg-card-dark rounded-lg shadow-sm">
      <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
        <div 
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex items-center justify-center" 
          style={{ backgroundImage: `url("${imageUrl}")` }}
          data-alt="Ilustración del clima actual"
        >
          {/* Contenido superpuesto */}
          <div className="text-white text-center bg-black/30 p-8 rounded-lg">
            <p className="text-6xl font-bold">{temp}</p>
            <p className="text-2xl">{description}</p>
            <p className="text-lg">{city}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentWeatherCard;