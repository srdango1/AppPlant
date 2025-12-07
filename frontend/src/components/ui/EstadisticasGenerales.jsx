import React from 'react';

/**
 * Tarjeta de Resumen de Cultivo Individual.
 * Muestra el estado de salud, métricas rápidas y alertas visuales de una cama específica.
 * Utilizada en el Dashboard de Estadísticas Generales.
 * * @param {string} name - Nombre identificador de la cama/cultivo.
 * @param {string} status - Estado textual (ej: "Óptimo", "Alerta").
 * @param {string} statusColor - Clases de utilidad Tailwind para colorear el estado (texto y fondo).
 * @param {string} details - Resumen de métricas (Temp, Humedad, Luz).
 * @param {string} icon - Nombre del icono de Material Symbols.
 */
const CropSummaryCard = ({ name, status, statusColor, details, icon }) => {
    // Extracción segura de la clase de color de texto para el punto o indicador
    const textColorClass = statusColor ? statusColor.split(' ')[0] : 'text-gray-600';

    return (
        <div className="flex flex-col justify-between bg-green-50 dark:bg-green-900/10 rounded-xl p-6 h-full border border-green-100 dark:border-green-800 transition-all hover:shadow-md">
            
            {/* Cabecera con Icono Grande */}
            <div className="flex flex-col items-center mb-4">
                <span className="material-symbols-outlined text-6xl text-green-600 dark:text-green-400 mb-2 drop-shadow-sm">
                    {icon}
                </span>
            </div>
            
            {/* Información de Estado */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 text-center">{name}</h3>
                <div className="text-sm font-bold mb-1 text-center bg-white dark:bg-black/20 p-2 rounded-lg">
                    <span className={`${textColorClass} block mb-1 uppercase tracking-wide text-xs`}>{status}</span> 
                    <span className="font-normal text-gray-600 dark:text-gray-300 block">{details}</span>
                </div>
            </div>
            
            {/* Botón de Acción */}
            <button className="w-full mt-4 py-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 font-bold text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                Ver Detalles
            </button>
        </div>
    );
};

export default CropSummaryCard;