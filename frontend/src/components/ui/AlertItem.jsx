//src/components/ui/AlertItem.jsx
import React from 'react';

/**
 * Componente de Alerta Visual reutilizable.
 * Altamente personalizable mediante clases de utilidad (Tailwind CSS) para indicar
 * diferentes niveles de severidad (Info, Warning, Critical).
 * * @param {string} message - El texto descriptivo de la alerta.
 * @param {string} bgColor - Clase Tailwind para el color de fondo (ej: "bg-red-100").
 * @param {string} textColor - Clase Tailwind para el color del texto (ej: "text-red-700").
 * @param {string} iconColor - Clase Tailwind para el color del icono (ej: "text-red-500").
 */
const AlertItem = ({ message, bgColor, textColor, iconColor }) => {
    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${bgColor}`}>
            
            {/* Ícono de Advertencia */}
            <span className={`material-symbols-outlined ${iconColor}`}>
                warning
            </span>
            
            {/* Mensaje de la Alerta */}
            <p className={`text-sm font-medium leading-normal ${textColor}`}>
                {message}
            </p>
        </div>
    );
};

export default AlertItem;