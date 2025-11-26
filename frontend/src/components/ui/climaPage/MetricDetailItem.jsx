// src/components/ui/MetricDetailItem.jsx

import React from 'react';

/**
 * Muestra una métrica con icono opcional. Usada en pronósticos y detalles.
 * @param {string} label - Etiqueta de la métrica (ej: "Humedad").
 * @param {string} value - Valor (ej: "60%").
 * @param {string} iconName - Nombre del icono de Material Symbols (opcional).
 */
function MetricDetailItem({ label, value, iconName }) {
    if (iconName) {
        // Estilo usado en "Detalles del Pronóstico" (columna principal)
        return (
            <div className="flex items-center gap-4 py-3">
                <div className="text-primary flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 shrink-0 size-10">
                    <span className="material-symbols-outlined">{iconName}</span>
                </div>
                <p className="text-base flex-1 truncate">{label}: {value}</p>
            </div>
        );
    } else {
        // Estilo usado en "Detalles del Clima Actual" (barra lateral)
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        );
    }
}

export default MetricDetailItem;