import React from 'react';

// Recibe las clases de Tailwind y el mensaje como props
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