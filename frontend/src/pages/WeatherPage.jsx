// src/pages/WeatherPage.jsx

import React,{useEffect,useState} from 'react';
import Header from '../components/layout/Header';
import CurrentWeatherCard from '../components/ui/climaPage/WeatherCard';
import HourlyForecastWidget from '../components/ui/climaPage/HourlyForecastWidget'
import MetricDetailItem from '../components/ui/climaPage/MetricDetailItem'
import WeatherWidget from '../components/ui/inicioPage/WeatherWidget';

import useWeather from '../hooks/useWeather';


// Datos estáticos para el prototipo
const HOURLY_DETAILS = [
    { label: "Humedad", value: "60%", icon: "water_drop" },
    { label: "Prob. de Lluvia", value: "10%", icon: "rainy" },
    { label: "Viento", value: "15 km/h", icon: "air" },
];

const CURRENT_DETAILS = [
    { label: "Sensación Térmica", value: "21°C" },
    { label: "Índice UV", value: "Alto" },
    { label: "Amanecer", value: "06:30" },
    { label: "Atardecer", value: "20:15" },
    { label: "Presión Atmosférica", value: "1012 hPa" },
];

const getDayName = (dateString) => {
    const date = new Date(dateString * 1000);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

// Función para procesar la lista de 40 items y sacar predicción para 2 días
const getDailyForecast = (list) => {
    if (!list) return [];
    const tomorrow = list[8]; 
    const dayAfter = list[16];

    if (!tomorrow || !dayAfter) return [];

        return [
        {
            day: "Mañana", // Forzamos que el primero diga "Mañana"
            iconName: getWeatherIcon(tomorrow.weather[0].icon), // Usamos tu traductor de iconos
            // Simulamos Max/Min usando la temp de ese momento +/- 2 grados 
            // (Para max/min real habría que recorrer todo el día, pero esto basta por ahora)
            tempRange: `${Math.round(tomorrow.main.temp)}° / ${Math.round(tomorrow.main.temp - 3)}°`,
            isHighlighted: true
        },
        {
            day: getDayName(dayAfter.dt).charAt(0).toUpperCase() + getDayName(dayAfter.dt).slice(1), // Ej: "Miércoles"
            iconName: getWeatherIcon(dayAfter.weather[0].icon),
            tempRange: `${Math.round(dayAfter.main.temp)}° / ${Math.round(dayAfter.main.temp - 3)}°`,
            isHighlighted: false
        }
    ];
};

const getWeatherIcon = (code) => {
    const iconMap = {
        // Día
        '01d': 'wb_sunny',           // Despejado
        '02d': 'partly_cloudy_day',  // Pocas nubes
        '03d': 'cloud',              // Nubes dispersas
        '04d': 'cloud',              // Nublado
        '09d': 'rainy',              // Llovizna
        '10d': 'water_drop',         // Lluvia
        '11d': 'thunderstorm',       // Tormenta
        '13d': 'ac_unit',            // Nieve
        '50d': 'mist',               // Neblina
        
        //iconos de noche
        '01n': 'bedtime',            // Despejado noche
        '02n': 'nights_stay',        // Pocas nubes noche
        '03n': 'cloud',
        '04n': 'cloud',
        '09n': 'rainy',
        '10n': 'water_drop',
        '11n': 'thunderstorm',
        '13n': 'ac_unit',
        '50n': 'mist',
    };
    return iconMap[code] || 'partly_cloudy_day';
};



function WeatherPage() {
    
    const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather('Osorno');

    const processedWeather = weatherData && !weatherError && weatherData.list ?{
        city: weatherData.city ? weatherData.city.name : 'N/A',
        temperature: Math.round(weatherData.list[0].main.temp),
        condition: weatherData.list[0].weather[0].description,
        iconName: getWeatherIcon(weatherData.list[0].weather[0].icon),
        humidity: weatherData.list[0].main.humidity,
        wind: weatherData.list[0].wind.speed,
        forecast: getDailyForecast(weatherData.list)
    } : null;
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <Header /> 
            
            <main className="flex-1 p-6 grid grid-cols-12 gap-6">
                
                {/* Columna Principal*/}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    
                       {weatherLoading ? (
                        // 1. Estado de Carga
                        <div className="p-6 mb-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl">
                            <span className="material-symbols-outlined animate-spin text-xl mr-2 align-middle">refresh</span>
                            <span className="align-middle">Cargando datos del clima...</span>
                        </div>
                    ) : weatherError ? (
                        // 2. Estado de Error (Nuevo)
                        <div className="p-6 mb-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
                            <p className="font-bold flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                No se pudo cargar el clima
                            </p>
                            <p className="text-sm mt-1">Verifica tu API Key o la conexión.</p>
                        </div>
                    ) : processedWeather ? (
                        // 3. Estado de Éxito (Mostrar Widget)
                        <WeatherWidget 
                            city={processedWeather.city}
                            temperature={processedWeather.temperature}
                            condition={processedWeather.condition}
                            humidity={processedWeather.humidity}
                            wind={processedWeather.wind}
                            iconName={processedWeather.iconName}
                        />
                    ) : null}

                    {/* Alerta de Clima  */}
                    <div className="bg-warning/20 dark:bg-warning/30 border-l-4 border-warning text-warning-dark dark:text-warning-light p-4 rounded-r-lg" role="alert">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-warning">warning</span>
                            <div>
                                <p className="font-bold">Alerta de Viento Fuerte</p>
                                <p>Ráfagas de hasta 40 km/h</p>
                            </div>
                        </div>
                    </div>

                    {/* 5.3 Pronóstico por Hora */}
                    <HourlyForecastWidget hourlyData = {processedWeather.forecast}/>

                    {/* 5.4 Detalles del Pronóstico (Hora Seleccionada) */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Detalles del Pronóstico - 14:00</h3>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {HOURLY_DETAILS.map((detail, index) => (
                                <MetricDetailItem 
                                    key={index}
                                    label={detail.label}
                                    value={detail.value}
                                    iconName={detail.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Barra Lateral */}
                <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Detalles del Clima Actual */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Detalles del Clima Actual</h3>
                        <div className="space-y-3">
                             {CURRENT_DETAILS.map((detail, index) => (
                                <MetricDetailItem 
                                    key={index}
                                    label={detail.label}
                                    value={detail.value}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 5.6 Recomendaciones (RecomendationCard - Aquí iría la IA) */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Recomendaciones</h3>
                        <div className="space-y-4">
                             <div className="flex items-start gap-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                                <span className="material-symbols-outlined text-primary mt-1">water_drop</span>
                                <div>
                                    <p className="font-semibold text-primary">¡Día perfecto para regar!</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Aprovecha el sol para que tus plantas absorban bien el agua.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-warning/10 dark:bg-warning/20 rounded-lg">
                                <span className="material-symbols-outlined text-warning mt-1">wb_sunny</span>
                                <div>
                                    <p className="font-semibold text-warning">Sol Intenso</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Considera proteger tus plantas del sol directo por la tarde.</p>
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