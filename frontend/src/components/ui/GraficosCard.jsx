import React from "react";
import LineChart from "../common/graficos";

function ChartCard({ tittle, value, time, summary, colorClass,charData }) {
    // se consiguen los datos para eje X
    const labels = charData ? charData.map(dataPoint => dataPoint.day ) : []
    return(
        // Contenedor principal de la tarjeta de gráfico 
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-background-dark shadow-sm">
            
            {/* Título */}
            <p className="text-base font-medium leading-normal text-[#111713] dark:text-gray-300">
                {tittle}
            </p>

            {/* Valor Actual */}
            <p className="tracking-light text-[32px] font-bold leading-tight truncate text-[#111713] dark:text-white">
                {value}
            </p>
            
            {/* Contenedor del Resumen de Tiempo (Últimos 7 días) */}
            <div className="flex gap-1">
                {/* Texto: Últimos 7 días */}
                <p className="text-base font-normal leading-normal text-[#64876b] dark:text-gray-400">
                    {time} 
                </p>
                {/* Cambio/Resumen: Usando la prop 'color' para el estado (ej: +1.2°C) */}
                <p className={`text-base font-medium leading-normal ${colorClass}`}>
                    {summary}
                </p>
            </div>

            {/* CONTENEDOR DEL GRÁFICO  */}
            <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                <LineChart
                data={charData}
                labels={labels}
                color={colorClass}
                />
                
            </div>
        </div>
    );
}

export default ChartCard;