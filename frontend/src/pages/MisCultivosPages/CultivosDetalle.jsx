import React from "react";
import EstadisticasCard from "../../components/ui/EstadisticasCard";
import ChartCard from "../../components/ui/GraficosCard";
import DetailsSidebar from "../../components/layout/CultivosSideBar";

// Array de datos simulados para ver si funciona

const TEMPERATURA_HISTORIAL = {
    // Datos de la cabecera del ChartCard
    title: "Temperatura",
    value: "24°C",
    time: "Últimos 7 días",
    summary: "+1.5°C",
    colorClass: "text-[#078827]", 
    
    // Array de datos históricos para el LineChart
    chartData: [
        { day: 'Lun', value: 22.5 },
        { day: 'Mar', value: 24.1 },
        { day: 'Mié', value: 23.0 },
        { day: 'Jue', value: 25.5 },
        { day: 'Vie', value: 24.0 },
        { day: 'Sáb', value: 23.8 },
        { day: 'Dom', value: 24.0 },
    ]
};
const HUMEDAD_HISTORIAL = {
    title: "Humedad",
    value: "40%", // Valor bajo
    time: "Últimos 7 días",
    summary: "-10%", // Simula una caída significativa (Alerta)
    colorClass: "text-[#e72608]", // Clase de texto rojo/alerta
    
    chartData: [
        { day: 'Lun', value: 65 },
        { day: 'Mar', value: 60 },
        { day: 'Mié', value: 55 },
        { day: 'Jue', value: 48 },
        { day: 'Vie', value: 45 },
        { day: 'Sáb', value: 42 },
        { day: 'Dom', value: 40 }, // Muestra la tendencia a la baja
    ]
};

const LUZ_HISTORIAL = {
    title: "Luz",
    value: "850 lux",
    time: "Últimos 7 días",
    summary: "+50 lux", // Simula un aumento (Óptimo)
    colorClass: "text-[#078827]", // Clase de texto verde
    
    chartData: [
        { day: 'Lun', value: 800 },
        { day: 'Mar', value: 810 },
        { day: 'Mié', value: 825 },
        { day: 'Jue', value: 850 },
        { day: 'Vie', value: 840 },
        { day: 'Sáb', value: 860 },
        { day: 'Dom', value: 850 },
    ]
};

const NUTRIENTES_HISTORIAL = {
    title: "Nutrientes (pH)",
    value: "5.8 pH",
    time: "Últimos 7 días",
    summary: "+0.3 pH", // Simula una estabilidad (Óptimo)
    colorClass: "text-[#078827]", // Clase de texto verde
    
    chartData: [
        { day: 'Lun', value: 5.5 },
        { day: 'Mar', value: 5.6 },
        { day: 'Mié', value: 5.7 },
        { day: 'Jue', value: 5.8 },
        { day: 'Vie', value: 5.8 },
        { day: 'Sáb', value: 5.8 },
        { day: 'Dom', value: 5.8 },
    ]
};
const All_chart_Data=[NUTRIENTES_HISTORIAL,
                HUMEDAD_HISTORIAL,
                LUZ_HISTORIAL,
                TEMPERATURA_HISTORIAL
]
const SENSOR_STATS = [
    { 
        title: "Temperatura", 
        value: "24°C", 
        statusText: "Óptima", 
        statusColor: "text-[#078827]" 
    },
    { 
        title: "Humedad", 
        value: "55%", 
        statusText: "Nivel bajo", 
        statusColor: "text-[#e72608]" // Color de peligro/advertencia
    },
    { 
        title: "Luz", 
        value: "850 lux", 
        statusText: "Óptima", 
        statusColor: "text-[#078827]" 
    },
    { 
        title: "Nutrientes", 
        value: "5.8 pH", 
        statusText: "Óptimo", 
        statusColor: "text-[#078827]" 
    },
];

function CultivosDetalle(){
    return(
        <div className="flex flex-1">
            <main className="flex-1 p-8">
        <div className="flex flex-wrap gap-4 p-4">
            {SENSOR_STATS.map((stat,index) =>(
                <EstadisticasCard
                key = {index}
                title = {stat.title}
                value = {stat.value}
                statusText = {stat.statusText}
                statusColor = {stat.statusColor}
                />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {All_chart_Data.map((chartData, index) => (
                <ChartCard
                key={index}
                {...chartData}
                />
            ))}
        </div>
        </main>
           <DetailsSidebar/> 
        </div>

    )
}
export default CultivosDetalle;