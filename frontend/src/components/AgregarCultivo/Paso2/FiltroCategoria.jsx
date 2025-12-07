//src/components/AgregarCultivo/Paso2/FiltroCategoria.jsx
import React from 'react';

/**
 * Botón de filtro tipo "Chip" o etiqueta.
 * Utilizado para filtrar listas de elementos por categoría.
 * * @param {string} name - Nombre de la categoría.
 * @param {boolean} isSelected - Estado activo.
 * @param {Function} onClick - Manejador de evento.
 */
const FilterButton = ({ name, isSelected, onClick }) => {
    const baseClasses = "flex h-12 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-lg px-4 transition-colors";
    
    // Estilos condicionales: Activo vs Inactivo
    const selectedClasses = "bg-primary/20 dark:bg-primary/30 text-primary font-medium";
    const unselectedClasses = "bg-card-light dark:bg-card-dark hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium";

    return (
        <div className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`} onClick={onClick}>
            <p>{name}</p>
        </div>
    );
};

export default FilterButton