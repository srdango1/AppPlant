

import React from 'react';
import Button from '../common/Button';

/**
 * Tarjeta detallada de un cultivo individual para la vista "Mis Cultivos".
 * @param {object} props - Propiedades del cultivo.
 * @param {string} props.name - Nombre y ubicación (ej: "Lechugas - Cama 1").
 * @param {string} props.imageUrl - URL de la imagen.
 * @param {string} props.statusText - Estado (ej: "Saludable").
 * @param {string} props.statusDotColor - Clase Tailwind para el color del círculo (ej: "bg-green-500").
 * @param {string} props.statusTextColor - Clase Tailwind para el color del texto de estado (ej: "text-green-500").
 * @param {string} props.temperature - Temperatura actual.
 * @param {string} props.humidity - Humedad.
 * @param {string} props.waterLevel - Nivel de agua.
 * 
 * Todo se recibe desde MisCultivosPage
 */
function DetailedCultivationCard({ 
    id, 
    name, 
    location, 
    status, 
    statusColor, 
    humidity,
    nutrients, 
    waterLevel, 
    imageUrl,
    temp 
    
}) {
  
  // Clases compartidas por las métricas
  const metricClasses = "flex items-center gap-3 text-gray-600 dark:text-gray-300";
  const Path = `/cultivos/${id}`;
  return (
    <div className="card-hover flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Imagen */}
      <div 
        className="w-full bg-center bg-no-repeat aspect-video bg-cover" 
        style={{ backgroundImage: `url("${imageUrl}")` }} 
      />
      
      <div className="p-6 flex flex-col grow">
        
        {/* Nombre y Estado */}
        <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-2">{name}-{location}</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
          <p className={`${statusColor} text-sm font-medium`}>{status}</p>
        </div>
        
        {/* Métricas Detalladas */}
        <div className="space-y-3 mb-6">
          <div className={metricClasses}>
            <span className="material-symbols-outlined text-lg">device_thermostat</span>
            <p className="text-sm">Temperatura: {temp}</p>
          </div>
          
          <div className={metricClasses}>
            <span className="material-symbols-outlined text-lg">water_drop</span>
            <p className="text-sm">Humedad: {humidity}</p>
          </div>
          
          <div className={metricClasses}>
            <span className="material-symbols-outlined text-lg">water</span>
            <p className="text-sm">Nivel de Agua: {waterLevel}</p>
          </div>

          <div className={metricClasses}>
            <span className="material-symbols-outlined text-lg"></span>
            <p className="text-sm">Nivel de Nutrientes : {nutrients}</p>
          </div>
        </div>
        
        <Button
        to={Path}
        className="w-full mt-auto"
        variant='primary' >
          
          Ver Detalles
        </Button>
      </div>
    </div>
  );
}

export default DetailedCultivationCard;