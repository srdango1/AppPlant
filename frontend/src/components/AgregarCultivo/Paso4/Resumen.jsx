//src/components/AgregarCultivo/Paso4/Resumen.jsx
import React from 'react';

/**
 * Componente de presentación para ítems de resumen.
 * Muestra un par Etiqueta/Valor con estilos consistentes.
 * Utilizado en la pantalla de confirmación final.
 * * @param {string} label - El nombre del campo (ej: "Nombre del Cultivo").
 * @param {string|number} value - El valor ingresado por el usuario.
 */
function SummaryItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">{label}</p>
      <p className="text-[#333333] dark:text-white text-sm font-medium leading-normal">{value}</p>
    </div>
  );
}

export default SummaryItem;