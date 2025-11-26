/**
 * Componente para mostrar prediccion del tiempo
 * @param {string} day - Dia del pronostico
 * @param {string} iconName - Icono que representa el clima
 * @param {string} tempRange - Variacion del clima, rango en el que se mantiene el clima
 * @param {string} isHighlighted - Puede o no estar, solo le da un leve color
 * Por ahora muestra datos clave fijos que se rellenan
 */

import React from 'react';

function DailyForecast({ day, iconName, tempRange, isHighlighted = false }) {
  const baseClasses = "flex items-center justify-between px-3 py-2 rounded-lg";
  const highlightClasses = isHighlighted ? "bg-gray-100 dark:bg-gray-700" : "";
  
  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
      <p className="text-sm font-medium">{day}</p>
      <span className="material-symbols-outlined text-accent">{iconName}</span>
      <p className="text-sm">{tempRange}</p>
    </div>
  );
}
export default DailyForecast;