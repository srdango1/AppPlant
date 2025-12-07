//src/components/ui/MisCultivosCard.jsx

import React from 'react';
import Button from '../common/Button';

/**
 * Componente de tarjeta rica en información para visualizar un cultivo específico.
 * Muestra el estado general y métricas clave (Temperatura, Humedad, etc.) en un vistazo.
 * * @param {string|number} id - Identificador único del cultivo (para la navegación).
 * @param {string} name - Nombre del cultivo (ej: "Lechugas").
 * @param {string} location - Ubicación física (ej: "Cama 1").
 * @param {string} status - Texto del estado (ej: "Saludable").
 * @param {string} statusColor - Clase CSS para el color del indicador (ej: "bg-green-500").
 * @param {string} humidity - Valor de humedad actual.
 * @param {string} nutrients - Nivel de nutrientes/pH.
 * @param {string} waterLevel - Nivel de agua en el estanque.
 * @param {string} imageUrl - URL para la imagen de fondo.
 * @param {string} temp - Temperatura actual.
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
  
  //Clases utilitarias compartidas para mantener consistencia en los items de métricas
  const metricClasses = "flex items-center gap-3 text-gray-600 dark:text-gray-300";
  const Path = `/cultivos/${id}`;
  return (
    <div className="card-hover flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Imagen de cabecera */}
      <div 
        className="w-full bg-center bg-no-repeat aspect-video bg-cover" 
        style={{ backgroundImage: `url("${imageUrl}")` }} 
      />
      
      <div className="p-6 flex flex-col grow">
        
        {/* Encabezado: Nombre y Ubicación */}
        <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-2">
          {name}-{location}</h3>
        
        {/* Indicador de Estado */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
          <p className={`${statusColor} text-sm font-medium`}>{status}</p>
        </div>
        
        {/* Grid de Métricas */}
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
        
        {/* Botón de Acción Principal */}
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