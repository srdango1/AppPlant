// src/components/weather/HourlyForecastItem.jsx

import React from 'react';

/**
 * Tarjeta individual para el carrusel de pronóstico por hora.
 * Muestra el estado del clima en un momento específico del día.
 * * @param {string} time - Hora formateada (ej: "14:00").
 * @param {string} iconName - Nombre del icono de Material Symbols (ej: "sunny").
 * @param {string} temperature - Temperatura formateada (ej: "23°C").
 * @param {boolean} isSelected - Estado booleano que determina si este ítem está activo/seleccionado.
 * @param {Function} onClick - Manejador de evento al hacer clic en la tarjeta.
 */
function HourlyForecastItem({ time, iconName, temperature, isSelected, onClick }) {
  // Definición de clases base y estados condicionales para Tailwind CSS
  const baseClasses = "flex h-full flex-1 flex-col items-center gap-2 rounded-lg min-w-24 p-4 cursor-pointer transition-colors";
  
  // Estilos para el estado "Seleccionado" (Borde y fondo coloreado)
  const selectedClasses = "bg-primary/10 dark:bg-primary/20 ring-2 ring-primary";
  
  // Estilos para el estado "Normal" (Fondo neutro)
  const unselectedClasses = "bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700";
  
  const iconColor = isSelected ? "text-primary" : "text-text-light dark:text-text-dark";

  return (
    <div 
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      onClick={onClick}
    >
      <p className="text-text-light dark:text-text-dark text-base font-medium">{time}</p>
      <span className={`material-symbols-outlined text-4xl ${iconColor}`}>{iconName}</span>
      <p className="text-text-light dark:text-text-dark text-lg font-bold">{temperature}</p>
    </div>
  );
}

export default HourlyForecastItem;