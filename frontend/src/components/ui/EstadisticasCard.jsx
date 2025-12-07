//src/components/ui/EstadisticasCard.jsx
import React from "react";

/**
 * Componente simple para mostrar una estadística individual (KPI).
 * Utilizado en dashboards para vistas rápidas de estado.
 * * @param {string} tittle - Nombre del indicador (ej: "Temperatura").
 * @param {string} value - Valor actual (ej: "24°C").
 * @param {string} statusText - Texto descriptivo del estado (ej: "Óptima").
 * @param {string} statusColor - Clase CSS para el color del texto de estado (ej: "text-green-600").
 */
function EstadisticasCard({tittle , value , statusText,statusColor}){
    const containerClasses ="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shadow-sm";
    return(
    <div className={containerClasses}>
        {/*Titulo*/}
        <p className="text-base font-medium leading-normal text-[#111713] dark:text-gray-300">
            {tittle}
        </p>
        {/*Valor*/}
        <p className="tracking-light text-2xl font-bold leading-tight text-[#111713] dark:text-white">
            {value}
        </p>
        {/*Estado*/}
        <p className={`text-base font-medium leading-normal ${statusColor}`}>
            {statusText}
        </p>
    </div>
)
}
export default EstadisticasCard;