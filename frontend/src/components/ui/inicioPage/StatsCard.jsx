// src/components/ui/inicioPage/StatsCard.jsx
import React from 'react';

/**
 * Componente tipo terjeta para mostrar métricas clave del sistema.
 * Utiliza un diseño responsivo que se adapta a grids
 * @param {string} title - El nombre de la métrica (ej: "Humedad promedio").
 * @param {string} value - El valor numerico o porcentual de la métrica (ej: "65%").
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