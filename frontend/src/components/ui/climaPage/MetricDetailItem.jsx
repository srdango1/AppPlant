// src/components/ui/MetricDetailItem.jsx

import React from 'react';

/**
 * Componente de presentación para mostrar una métrica individual.
 * Es flexible y tiene dos variantes de visualización:
 * 1. Con Icono: Para listas destacadas (ej: detalles del día).
 * 2. Sin Icono: Para listas compactas o laterales.
 * * @param {string} label - Nombre de la métrica (ej: "Humedad").
 * @param {string|number} value - Valor a mostrar (ej: "60%").
 * @param {string} [iconName] - (Opcional) Nombre del icono de Material Symbols.
 */
function MetricDetailItem({ label, value, iconName }) {
    // Renderizado Condicional: Variación con Icono Grande
    if (iconName) {
        return (
            <div className="flex items-center gap-4 py-3">
                {/* Círculo contenedor del icono con colores primarios */}
                <div className="text-primary flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 shrink-0 size-10">
                    <span className="material-symbols-outlined">{iconName}</span>
                </div>
                <p className="text-base flex-1 truncate">{label}: {value}</p>
            </div>
        );
    } else {
        // Renderizado Condicional: Variación Compacta
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        );
    }
}

export default MetricDetailItem;