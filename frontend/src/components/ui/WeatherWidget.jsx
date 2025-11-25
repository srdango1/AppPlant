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
function WeatherWidget({
  city = "Quito",
  temperature = "24°C",
  description = "Soleado con pocas nubes",
  details = "Humedad: 55%, Viento: 10 km/h",
  iconName = "partly_cloudy_day",
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA18b6H_X41hvnNJ9beoWXUEUcIP_QqhaJZSsLCVM80gcqUn5MCzwHPCWeThmPDWjspcCOE_g8zWKvSmi8_Po8fRnQOr9oTvfcXT9PqBSvV5U4bmovPIjZBQ5J0AraJXR2D2wDWfLUTlQm4KT1ivQF5pWXU2o206Z_nmyzgPJ31iyEmWfDErBuH5rDIMYaJ2ddknE89eg83X319PNMhuWVygePSvC1TWUbW4Q1a1MITOC_ae8zMH_BCN79YBWmx97lhX4YVRrTV1a9Q" // Reemplazar con URL real
}) {
  return (
    <div className="mb-6 @container">
      <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start shadow-sm bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
        
        {/* Imagen de Fondo */}
        <div 
          className="w-full @xl:w-1/3 bg-center bg-no-repeat aspect-video @xl:aspect-auto @xl:h-full bg-cover" 
          data-alt="Clima actual" 
          style={{ backgroundImage: `url("${imageUrl}")` }}
        ></div>
        
        {/* Contenido del Clima */}
        <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-6">
          <p className="text-lg font-bold tracking-[-0.015em]">Clima Actual - {city}</p>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent" style={{ fontSize: '48px' }}>{iconName}</span>
            <p className="text-4xl font-bold">{temperature}</p>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-base font-normal text-gray-600 dark:text-gray-400">{description}</p>
            <p className="text-base font-normal text-gray-600 dark:text-gray-400">{details}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;