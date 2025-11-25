import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 
import EstadisticasCard from "../../components/ui/EstadisticasCard";
import ChartCard from "../../components/ui/GraficosCard";
import DetailsSidebar from "../../components/layout/CultivosSideBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Datos simulados (Mock Data) para los gráficos
const TEMPERATURA_HISTORIAL = {
    title: "Temperatura", value: "24°C", time: "Últimos 7 días", summary: "+1.5°C", colorClass: "text-[#078827]", 
    chartData: [{ day: 'Lun', value: 22.5 }, { day: 'Mar', value: 24.1 }, { day: 'Mié', value: 23.0 }, { day: 'Jue', value: 25.5 }, { day: 'Vie', value: 24.0 }, { day: 'Sáb', value: 23.8 }, { day: 'Dom', value: 24.0 }]
};
const HUMEDAD_HISTORIAL = {
    title: "Humedad", value: "40%", time: "Últimos 7 días", summary: "-10%", colorClass: "text-[#e72608]", 
    chartData: [{ day: 'Lun', value: 65 }, { day: 'Mar', value: 60 }, { day: 'Mié', value: 55 }, { day: 'Jue', value: 48 }, { day: 'Vie', value: 45 }, { day: 'Sáb', value: 42 }, { day: 'Dom', value: 40 }]
};
const LUZ_HISTORIAL = {
    title: "Luz", value: "850 lux", time: "Últimos 7 días", summary: "+50 lux", colorClass: "text-[#078827]", 
    chartData: [{ day: 'Lun', value: 800 }, { day: 'Mar', value: 810 }, { day: 'Mié', value: 825 }, { day: 'Jue', value: 850 }, { day: 'Vie', value: 840 }, { day: 'Sáb', value: 860 }, { day: 'Dom', value: 850 }]
};
const NUTRIENTES_HISTORIAL = {
    title: "Nutrientes (pH)", value: "5.8 pH", time: "Últimos 7 días", summary: "+0.3 pH", colorClass: "text-[#078827]", 
    chartData: [{ day: 'Lun', value: 5.5 }, { day: 'Mar', value: 5.6 }, { day: 'Mié', value: 5.7 }, { day: 'Jue', value: 5.8 }, { day: 'Vie', value: 5.8 }, { day: 'Sáb', value: 5.8 }, { day: 'Dom', value: 5.8 }]
};

const All_chart_Data = [NUTRIENTES_HISTORIAL, HUMEDAD_HISTORIAL, LUZ_HISTORIAL, TEMPERATURA_HISTORIAL];

function CultivosDetalle() {
    const { id } = useParams(); 
    const [cultivoInfo, setCultivoInfo] = useState(null);

    useEffect(() => {
        const fetchCultivo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/cultivos`);
                if (response.ok) {
                    const data = await response.json();
                    // Buscamos el cultivo por ID
                    const encontrado = data.find(c => c.id === id);
                    setCultivoInfo(encontrado);
                }
            } catch (error) {
                console.error("Error buscando cultivo:", error);
            }
        };
        fetchCultivo();
    }, [id]);

    const SENSOR_STATS = [
        { title: "Estado", value: cultivoInfo ? cultivoInfo.status : "Cargando...", statusText: "General", statusColor: "text-blue-500" },
        { title: "Ubicación", value: cultivoInfo ? cultivoInfo.location : "...", statusText: "Zona", statusColor: "text-gray-500" },
        { title: "Plantas", value: cultivoInfo ? cultivoInfo.plantas.length : 0, statusText: "Total", statusColor: "text-[#078827]" },
        { title: "Dispositivo", value: (cultivoInfo && cultivoInfo.deviceId) ? "Conectado" : "Sin sensor", statusText: "Hardware", statusColor: (cultivoInfo && cultivoInfo.deviceId) ? "text-[#078827]" : "text-red-500" },
    ];

    return (
        <div className="flex flex-1 flex-col lg:flex-row">
            <main className="flex-1 p-6 lg:p-8">
                
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                    {cultivoInfo ? cultivoInfo.name : "Detalles del Cultivo"}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {SENSOR_STATS.map((stat, index) => (
                        <EstadisticasCard
                            key={index}
                            tittle={stat.title} 
                            value={stat.value}
                            statusText={stat.statusText}
                            statusColor={stat.statusColor}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {All_chart_Data.map((chartData, index) => (
                        <ChartCard
                            key={index}
                            title={chartData.title} 
                            value={chartData.value}
                            time={chartData.time}
                            summary={chartData.summary}
                            colorClass={chartData.colorClass}
                            chartData={chartData.chartData}
                        />
                    ))}
                </div>
            </main>
            
            <DetailsSidebar />
        </div>
    );
}

export default CultivosDetalle;