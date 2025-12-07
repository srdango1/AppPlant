//src/components/common/SideBarSection.jsx
import React from 'react';

/**
 * Contenedor de Sección para Barras Laterales.
 * Agrupa elementos relacionados (alertas, acciones, notas) bajo un título común,
 * manteniendo la consistencia de espaciado y tipografía.
 * * * @param {string} title - El encabezado de la sección (ej: "Alertas").
 * @param {ReactNode} children - Los elementos a renderizar dentro de la sección.
 */
const SidebarSection = ({ title, children }) => {
    return (
        // Contenedor de la sección con espaciado vertical
        <div className="flex flex-col gap-4">
            
            {/* Título de la sección */}
            <h3 className="text-lg font-bold">{title}</h3>
            
            {/* Contenedor interno del contenido (flex flex-col gap-2) */}
            <div className="flex flex-col gap-2">
                {children} {/*se renderizan los ítems */}
            </div>
        </div>
    );
};

export default SidebarSection;