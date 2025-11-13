import React from 'react';

// Recibe el nombre del icono (icon), la etiqueta (label) y la acción (onClick)
const ActionButton = ({ icon, label, onClick }) => {
    return (
        <button 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClick} 
        >
            {/* Ícono (usando la prop 'icon' para el nombre del símbolo) */}
            <span className="material-symbols-outlined text-[#111713] dark:text-gray-300">
                {icon} {/* Ej: water_drop */}
            </span>
            
            {/* Texto de la acción */}
            <p className="text-sm font-medium leading-normal text-[#111713] dark:text-gray-300">
                {label} {/* Ej: Regar */}
            </p>
        </button>
    );
};

export default ActionButton;