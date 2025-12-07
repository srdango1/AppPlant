//src/components/ui/NotesItem.jsx
import React from 'react';

/**
 * Componente de presentación para un ítem individual de nota.
 * Se utiliza en listas de resumen (ej: en el Sidebar) para mostrar una vista previa.
 * * @param {string} text - Contenido o título de la nota.
 * @param {string} date - Fecha formateada de la nota (ej: "24/05/2024").
 */
const NoteItem = ({ text, date }) => {
    return (
        <div className="flex items-start gap-3 px-3 py-2">
            
            {/* Ícono de Nota */}
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 mt-1">
                description
            </span>
            
            <div className="flex flex-col">
                {/* Texto de la Nota */}
                <p className="text-sm font-medium leading-normal text-[#111713] dark:text-gray-300">
                    {text}
                </p>
                {/* Fecha */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {date}
                </p>
            </div>
        </div>
    );
};

export default NoteItem;