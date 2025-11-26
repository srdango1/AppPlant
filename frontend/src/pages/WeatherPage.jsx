// src/pages/WeatherPage.jsx

import React,{useEffect,useState} from 'react';
import Header from '../components/layout/Header';
import CurrentWeatherCard from '../components/ui/climaPage/WeatherCard';
import HourlyForecastWidget from '../components/ui/climaPage/HourlyForecastWidget'
import MetricDetailItem from '../components/ui/climaPage/MetricDetailItem'
import weatherAPI from '../services/weatherAPI';


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



function WeatherPage() {
    // Estados de carga
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //estado y ubicacion
    const [location] = useState({
        lat: -40.57395,
        lon: -73.13348,
        name: 'Osorno, Chile'
    });
    // carga de datoss
    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Llamada a tu endpoint /api/weather/complete
                const data = await weatherAPI.getCompleteWeather(
                    location.lat,
                    location.lon,
                    location.name
                );

                // 'data' contendrá { current, forecast, location, etc. }
                setWeatherData(data);
            } catch (err) {
                console.error("Error al obtener el clima:", err);
                setError('No se pudo cargar el clima. Verifica el backend y la API Key.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [location.lat, location.lon, location.name]);

// condicional en caso de haber recuperado los datos
    if (loading) {
        return (
            <div className="relative flex min-h-screen w-full flex-col justify-center items-center">
                <p className="text-xl font-medium text-text-light dark:text-text-dark">
                    Cargando clima para {location.name}...
                </p>
            </div>
        );
    }
    // en caso de no encontrarlos
    if (error || !weatherData || !weatherData.current || !weatherData.forecast) {
        return (
            <div className="relative flex min-h-screen w-full flex-col justify-center items-center">
                <p className="text-lg font-bold text-danger dark:text-danger/70">
                    {error || "Error: Datos de clima incompletos o falló la conexión."}
                </p>
            </div>
        );
    }

    const current = weatherData.current;
    const forecast = weatherData.forecast;

    // --- Datos para CurrentWeatherCard ---
    const mainTemp = current.temperature + '°C';
    const description = current.conditions.charAt(0).toUpperCase() + current.conditions.slice(1);
    const cityDisplay = current.location || current.name; // Usar location del servicio

    // --- Datos para la barra lateral (Detalles) ---
    const sidebarDetails = [
        { label: "Sensación Térmica", value: current.feels_like + '°C' },
        { label: "Humedad", value: current.humidity + '%' },
        { label: "Presión Atmosférica", value: current.pressure + ' hPa' },
        { label: "Amanecer", value: current.sunrise },
        { label: "Atardecer", value: current.sunset },
    ];


    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <Header /> 
            
            <main className="flex-1 p-6 grid grid-cols-12 gap-6">
                
                {/* Columna Principal*/}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    
                    {/*  Tarjeta Principal de Clima */}
                    <CurrentWeatherCard 
                        temp={mainTemp}
                        description={description}
                        city={cityDisplay}
                        imageUrl={`https://source.unsplash.com/random/800x600?weather,${current.conditions_main}`}
                    />

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
                    <HourlyForecastWidget hourlyData = {weatherData.forecast}/>

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