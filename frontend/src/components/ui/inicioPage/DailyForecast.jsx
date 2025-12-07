//src/components/ui/climaPage/DailyForecast.jsx
import React from 'react';
/**
 * Componente de presentación para mostrar una fila de pronóstico diario simplificado.
 * Se utiliza generalmente en widgets laterales o resúmenes rápidos.
 * * @param {string} day - Nombre del día a mostrar (ej: "Mañana", "Lunes").
 * @param {string} iconName - Nombre del icono de Google Material Symbols (ej: "wb_sunny").
 * @param {string} tempRange - Cadena de texto con el rango de temperatura (ej: "25° / 12°").
 * @param {boolean} [isHighlighted=false] - (Opcional) Si es true, añade un fondo sutil para destacar el día importante (ej: el día siguiente inmediato).
 */

function DailyForecast({ day, iconName, tempRange, isHighlighted = false }) {
  // Clases base para la estructura Flexbox y espaciado
  const baseClasses = "flex items-center justify-between px-3 py-2 rounded-lg";
  // Lógica de estilos condicionales:
  // Si está destacado, usa un fondo visible. Si no, añade un efecto hover sutil para mejor UX
  const highlightClasses = isHighlighted ? "bg-gray-100 dark:bg-gray-700" : "";
  
  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
      <p className="text-sm font-medium">{day}</p>
        <span className="material-symbols-outlined text-accent text-3xl text-blue-500">
        {iconName} </span>      
      <p className="text-sm">{tempRange}</p>
    </div>
  );
}
export default DailyForecast;