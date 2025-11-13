import React from 'react';

// Recibe el título y el contenido anidado (children)
const SidebarSection = ({ title, children }) => {
    return (
        // Contenedor externo (flex flex-col gap-4)
        <div className="flex flex-col gap-4">
            
            {/* Título de la sección */}
            <h3 className="text-lg font-bold">{title}</h3>
            
            {/* Contenedor interno del contenido (flex flex-col gap-2) */}
            <div className="flex flex-col gap-2">
                {children} {/* ⬅️ Aquí se renderizan los ítems */}
            </div>
        </div>
    );
};

export default SidebarSection;