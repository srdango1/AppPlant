// src/components/ui/inicioPage/CultivationCard.jsx
import React from 'react';

/**
 * Componente visual para mostrar una cama de cultivo individual.
 * Incluye imagen de fondo dinamica e indicador de estado por color
 * @param {string} name - Nombre identificador de la cama (ej: "Cama de Tomates").
 * @param {string} status - Texto del estado actual de la planta (ej: "Saludable").
 * @param {string} statusColor - Clase Tailwind para el color del indicador (ej: "bg-primary", "bg-yellow-400", "bg-red-500").
 * @param {string} imageUrl - URL de la imagen de fondo que representa el cultivo.
 * 
 * Es reutilizable por lo que obtiene la informacion desde main y la pone en los espacios para que aparezca todo
 */
function CultivationCard({ name, status, statusColor, imageUrl }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      
      {/* Imagen del Cultivo */}
      <div className="w-full h-40 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center rounded-t-xl overflow-hidden border-b border-gray-100 dark:border-gray-700">
    <img 
        src={imageUrl} 
        alt="Icono de cultivo"
        className="w-full h-full object-contain p-6 opacity-90 transition-transform duration-300 group-hover:scale-110" 
    />
</div>
      {/* Detalles del estado */}
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