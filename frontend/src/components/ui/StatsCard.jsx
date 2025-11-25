
import React from 'react';

/**
 * Componente para mostrar una estadística clave.
 * @param {string} title - El nombre de la métrica (ej: "Humedad promedio").
 * @param {string} value - El valor de la métrica (ej: "65%").
 * Por ahora muestra datos clave fijos que se rellenan
 */

function StatsCard({ title, value }) {
  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <p className="text-base font-medium">{title}</p>
      <p className="text-2xl font-bold tracking-light">{value}</p>
    </div>
  );
}

export default StatsCard;