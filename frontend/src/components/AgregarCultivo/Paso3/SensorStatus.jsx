//src/components/AgregarCultivo/Paso3/SensorStatus.jsx
import React from 'react';

/**
 * Componente de fila para mostrar el estado de conexión de un sensor IoT.
 * Mapea estados de texto a iconos y colores semánticos.
 * * @param {string} name - Nombre del sensor (ej: "Humedad").
 * @param {string} status - Estado actual ("Conectando...", "Conectado", "Error").
 * @param {string} detail - Mensaje de error opcional.
 */
function SensorStatusItem({ name, status, detail }) {
  
  // Lógica de visualización condicional
  let icon = '';
  let colorClass = '';
  let animate = '';

  switch (status) {
    case 'Conectado':
      icon = 'check_circle';
      colorClass = 'text-green-500';
      break;
    case 'Conectando...':
      icon = 'autorenew';
      colorClass = 'text-orange-500';
      animate = 'animate-spin';
      break;
    case 'Error':
      icon = 'cancel';
      colorClass = 'text-red-500';
      break;
    default:
      icon = 'help_center';
      colorClass = 'text-gray-500';
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-background-light dark:bg-background-dark">
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${colorClass} ${animate}`}>{icon}</span>
        <p className="font-medium">{name}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm ${colorClass}`}>{status}</p>
        {status === 'Error' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  );
}

export default SensorStatusItem;