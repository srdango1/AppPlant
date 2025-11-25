import React from 'react';

/**
 * Componente para mostrar una cama de cultivo individual.
 * @param {string} name - Nombre de la cama (ej: "Cama de Tomates").
 * @param {string} status - Estado de la planta (ej: "Saludable").
 * @param {string} statusColor - Clase Tailwind para el color del círculo (ej: "bg-primary", "bg-yellow-400", "bg-red-500").
 * @param {string} imageUrl - URL de la imagen del cultivo.
 * 
 * Es reutilizable por lo que obtiene la informacion desde main y la pone en los espacios para que aparezca todo
 */
function CultivationCard({ name, status, statusColor, imageUrl }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      
      {/* Imagen del Cultivo */}
      <div 
        className="w-full bg-center bg-no-repeat aspect-video bg-cover" 
        data-alt={`Imagen de ${name}`} 
        style={{ backgroundImage: `url("${imageUrl}")` }}
      ></div>
      
      {/* Detalles */}
      <div className="p-4">
        <p className="text-base font-medium">{name}</p>
        <div className="flex items-center gap-2">
          {/* Círculo de Estado */}
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span> 
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">Estado: {status}</p>
        </div>
      </div>
    </div>
  );
}

export default CultivationCard;