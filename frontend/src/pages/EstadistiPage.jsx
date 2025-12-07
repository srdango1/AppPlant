import React from 'react';
import ChartCard from '../components/ui/GraficosCard';
import CropSummaryCard from '../components/ui/EstadisticasGenerales';
import GeneralSummaryBanner from '../components/ui/EstadisticaGeneralBanner';

// --- MOCKS DE DATOS ---
const CROP_STATUS_MOCK = [
    { 
        id: 1, 
        name: "Cama de Tomates Cherry", 
        status: "Óptimo", 
        statusColor: "text-green-600 bg-green-100", 
        details: "Temp: 24°C, Humedad: 65%, Luz: 800 Lux",
        icon: "potted_plant"
    },
    { 
        id: 2, 
        name: "Cama de lechugas", 
        status: "Alerta", 
        statusColor: "text-yellow-600 bg-yellow-100", 
        details: "Temp: 28°C, Humedad: 50%, Luz: 900 Lux",
        icon: "eco"
    },
    { 
        id: 3, 
        name: "Cama de hierbas", 
        status: "Óptimo", 
        statusColor: "text-green-600 bg-green-100", 
        details: "Temp: 22°C, Humedad: 70%, Luz: 750 Lux",
        icon: "grass"
    },
    { 
        id: 4, 
        name: "Cama de Pimientos", 
        status: "Peligro", 
        statusColor: "text-red-600 bg-red-100", 
        details: "Temp: 18°C, Humedad: 85%, Luz: 600 Lux",
        icon: "local_florist"
    },
];

const TEMP_CHART_DATA = {
    tittle: "Tendencia de Temperatura",
    value: "24°C",
    time: "Últimas 24h",
    summary: "+1.5%",
    colorClass: "text-[#078827]",
    charData: [
        { day: '00:00', value: 18 }, { day: '04:00', value: 17 }, { day: '08:00', value: 20 },
        { day: '12:00', value: 25 }, { day: '16:00', value: 24 }, { day: '20:00', value: 21 },
    ]
};

const HUMIDITY_CHART_DATA = {
    tittle: "Comparativa de Humedad",
    value: "65%",
    time: "Última semana",
    summary: "-2%",
    colorClass: "text-[#e72608]",
    charData: [
        { day: 'Lun', value: 60 }, { day: 'Mar', value: 65 }, { day: 'Mié', value: 62 },
        { day: 'Jue', value: 58 }, { day: 'Vie', value: 65 }, { day: 'Sáb', value: 70 },
    ]
};

const LIGHT_CHART_DATA = {
    tittle: "Niveles de Luz",
    value: "800 Lux",
    time: "Promedio camas",
    summary: "^+5%",
    colorClass: "text-[#078827]",
    charData: [
        { day: 'Cama 1', value: 750 }, { day: 'Cama 2', value: 850 }, 
        { day: 'Cama 3', value: 800 }, { day: 'Cama 4', value: 780 },
    ]
};

const WATER_CHART_DATA = {
    tittle: "Consumo de Agua",
    value: "15L",
    time: "Última semana",
    summary: "+1L",
    colorClass: "text-[#078827]",
    charData: [
        { day: 'Cama 1', value: 4 }, { day: 'Cama 2', value: 5 }, 
        { day: 'Cama 3', value: 3 }, { day: 'Cama 4', value: 3 },
    ]
};

/**
 * Página Principal de Estadísticas Generales.
 * Vista analítica consolidada que utiliza componentes modulares para mostrar
 * el estado de salud de todos los cultivos y gráficos de tendencias.
 */
function GeneralStatsPage() {
    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full bg-gray-50 dark:bg-[#121212]">
            
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-[-0.033em] text-gray-900 dark:text-white">
                    Estadísticas Generales
                </h1>
            </div>

            {/* 1. Tarjetas de Resumen por Cama */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {CROP_STATUS_MOCK.map(crop => (
                    <CropSummaryCard 
                        key={crop.id}
                        name={crop.name}
                        status={crop.status}
                        statusColor={crop.statusColor}
                        details={crop.details}
                        icon={crop.icon}
                    />
                ))}
            </div>

            {/* 2. Banner de Resumen General */}
            <GeneralSummaryBanner 
                tempAvg="23.5°C"
                humidityAvg="68%"
                waterConsumption="15L"
            />

            {/* 3. Gráficos de Tendencias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard {...TEMP_CHART_DATA} />
                <ChartCard {...HUMIDITY_CHART_DATA} />
                <ChartCard {...LIGHT_CHART_DATA} />
                <ChartCard {...WATER_CHART_DATA} />
            </div>

        </main>
    );
}

export default GeneralStatsPage;