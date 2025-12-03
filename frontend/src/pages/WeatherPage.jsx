// src/pages/WeatherPage.jsx

import React from 'react';
import Header from '../components/layout/Header';

import WeatherWidget from '../components/ui/climaPage/WeatherCard'; 
import HourlyForecastWidget from '../components/ui/climaPage/HourlyForecastWidget';
import MetricDetailItem from '../components/ui/climaPage/MetricDetailItem';


import useWeather from '../hooks/useWeather';
import { formatWeatherData } from '../utils/utilsWeather';
// Datos estáticos para el prototipo 
const CURRENT_DETAILS = [
    { label: "Sensación Térmica", value: "21°C", iconName: "thermostat" }, 
    { label: "Índice UV", value: "Alto", iconName: "wb_sunny" },
    { label: "Amanecer", value: "06:30", iconName: "wb_twilight" },
    { label: "Atardecer", value: "20:15", iconName: "wb_twilight" },
    { label: "Presión Atmosférica", value: "1012 hPa", iconName: "compress" },
];

// Datos estáticos para el detalle por hora (Si no usas los de la API)
const HOURLY_DETAILS_MOCK = [
    { label: "Humedad", value: "60%", icon: "water_drop" },
    { label: "Prob. de Lluvia", value: "10%", icon: "rainy" },
    { label: "Viento", value: "15 km/h", icon: "air" },
];

function WeatherPage() {
    
    // 1. Usar el Hook
    const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather('Osorno');
    
    // 2. Procesar los datos con tu utilidad
    const processedWeather = formatWeatherData(weatherData, weatherError);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            
            <main className="flex-1 p-6 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
                
                {/* Columna Principal (Izquierda/Centro) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    
                    {/* ESTADOS DE CARGA / ERROR / ÉXITO */}
                    {weatherLoading ? (
                        <div className="p-6 mb-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl">
                            <span className="material-symbols-outlined animate-spin text-xl mr-2 align-middle">refresh</span>
                            <span className="align-middle">Cargando datos del clima...</span>
                        </div>
                    ) : weatherError ? (
                        <div className="p-6 mb-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
                            <p className="font-bold flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                No se pudo cargar el clima
                            </p>
                            <p className="text-sm mt-1">Verifica tu conexión.</p>
                        </div>
                    ) : processedWeather ? (
                        <>
                            {/* 3. Tarjeta Principal del Clima Actual */}
                            <WeatherWidget 
                                city={processedWeather.city}
                                temperature={processedWeather.temperature}
                                description={processedWeather.condition}
                                humidity={processedWeather.humidity}
                                wind={processedWeather.wind}
                                iconName={processedWeather.iconName}
                            />

                            {/* Alerta de Clima (Ejemplo Estático por ahora) */}
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-yellow-600">warning</span>
                                    <div>
                                        <p className="font-bold">Alerta de Viento Fuerte</p>
                                        <p>Ráfagas de hasta 40 km/h pronosticadas para la tarde.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Widget de Pronóstico por Hora (Pasa el array 'forecast' procesado) */}
                            <HourlyForecastWidget hourlyData={weatherData?.list} />

                            {/* Detalles Adicionales (Estáticos o mezclados con dinámicos) */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Detalles del Pronóstico - Hoy</h3>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {processedWeather.todayDetails.map((detail, index) => (
                                        <MetricDetailItem 
                                            key={index}
                                            label={detail.label}
                                            value={detail.value}
                                            iconName={detail.icon}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Barra Lateral (Derecha) */}
                <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Detalles Adicionales del Clima (Current Details) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4">Condiciones Actuales</h3>
                        <div className="space-y-4">
                             {processedWeather ? (
                                processedWeather.currentDetails.map((detail, index) => (
                                    <MetricDetailItem 
                                        key={index}
                                        label={detail.label}
                                        value={detail.value}
                                        iconName={detail.iconName}
                                    />
                                ))
                             ) : (
                                // Estado de carga para el sidebar (opcional)
                                <p className="text-gray-400 text-sm">Cargando detalles...</p>
                             )}
                        </div>
                    </div>

                    {/* Recomendaciones (Estáticas) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4">Recomendaciones para tus Cultivos</h3>
                        <div className="space-y-4">
                             <div className="flex items-start gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                <span className="material-symbols-outlined text-green-600 mt-1">water_drop</span>
                                <div>
                                    <p className="font-semibold text-green-700 dark:text-green-300">¡Día perfecto para regar!</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Aprovecha la mañana para que tus plantas absorban bien el agua.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                                <span className="material-symbols-outlined text-yellow-600 mt-1">wb_sunny</span>
                                <div>
                                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">Sol Intenso</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Considera proteger tus plantas del sol directo por la tarde.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default WeatherPage;