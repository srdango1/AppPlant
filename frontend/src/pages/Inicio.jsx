//src/pages/Inicio
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import StatsCard from "../components/ui/inicioPage/StatsCard";
import WeatherWidget from "../components/ui/inicioPage/WeatherWidget";
import CultivationCard from "../components/ui/inicioPage/CultivationCard";
import Sidebar from "../components/layout/InicioSideBar";

import useWeather from '../hooks/useWeather';
import { formatWeatherData } from "../utils/utilsWeather";
import { getCultivationImage } from '../../utils/utilsImg';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * Componente de la página principal | Dashboard
 * Actúa como controlador principal que :
 * 1. Consume  el hook de Clima useWeather
 * 2. Realiza peticiones HTTP para obtener los cultivos del usuario.
 * 3. Escucha eventos globales para recargar datos de forma dinamica
 * 4. Orquesta la visualización de widgets y estadísticas. 
 */

function Inicio() {
    // Estado para almacenar la lista de cultivos del usuario
    const [cultivos, setCultivos] = useState([]);
    // Estado para las estadísticas rápidas
    const [stats, setStats] = useState({
        humedad: "0%",
        temperatura: "0°C",
        agua: "0%",
        luz: "0%"
    });
    //Consumo del custom hook para obtener datos meteorologicos de Osorno
    const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather('Osorno');
    
    /**
     * Effect: carga inicial de datos de cultivos desde el backend
     * Se ejecuta una sola vez al montar el componente
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/cultivos`);
                if (response.ok) {
                    const data = await response.json();
                    setCultivos(data);
                    // Inicialización de stats con simulación de datos de sensores
                    if (data.length > 0) {
                        setStats({
                            humedad: "0%",
                            temperatura: "0°C",
                            agua: "0%",
                            luz: "0%"
                        });
                    }
                }
            } catch (error) {
                console.error("Error cargando inicio:", error);
            }
        };
        fetchData();
    }, []);

    /**
     * Effect: eventos globales
     * Escucha el evento personalizado 'cultivoActualizado' que es disparado por el chatbox o modales
     * para refrescar la lista de cultivos sin recargar la página.
     */
    useEffect(() => {
        const handleRecargar = () => {
             fetch(`${API_BASE_URL}/cultivos`)
                .then(res => res.json())
                .then(data => {
                    setCultivos(data);
                    //Actualización simulada de sensores al detectar cambios
                    if (data.length > 0) {
                        setStats({
                            humedad: "65%", temperatura: "24°C", agua: "80%", luz: "75%"
                        });
                    }
                })
                .catch(err => console.error(err));
        };

        window.addEventListener('cultivoActualizado', handleRecargar);
        //Cleanup: Es necesario quitar el listener al desmontar para evitar fugas de memoria
        return () => window.removeEventListener('cultivoActualizado', handleRecargar);
    }, []);

    //Prosamiento de datos crudos de la API de clima usando la utilidad centralizada
    const processedWeather = formatWeatherData(weatherData, weatherError);

    
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex flex-1">
                <main className="w-full lg:w-2/3 xl:w-3/4 p-6">
                    
                    {/* Tarjetas de Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatsCard title="Humedad promedio" value={stats.humedad} />
                        <StatsCard title="Temperatura promedio" value={stats.temperatura} />
                        <StatsCard title="Nivel de agua" value={stats.agua} />
                        <StatsCard title="Luz recibida" value={stats.luz} />
                    </div>
                    
                    {/* Widget del Clima con manejo de carga INTEGRADO */}
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
                        </div>
                    ) : processedWeather ? (
                        <WeatherWidget 
                            city={processedWeather.city}
                            temperature={processedWeather.temperature}
                            description={processedWeather.condition}
                            humidity={processedWeather.humidity}
                            wind={processedWeather.wind}
                            iconName={processedWeather.iconName}
                        />
                    ) : null}

                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mis Camas de Cultivo</h3>
                    
                    {/* Grid de Cultivos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {cultivos.length > 0 ? (
                            cultivos.map(cultivo => (
                                
                                <Link key={cultivo.id} to={`/cultivos/${cultivo.id}`}>
                                    <CultivationCard 
                                        name={cultivo.name} 
                                        status={cultivo.status} 
                                        statusColor={cultivo.statusColor} 
                                        imageUrl={ getCultivationImage(cultivo.plantas, cultivo.ubicacion|| cultivo.location)}
                                    />
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-2 text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                No tienes cultivos activos. ¡Añade uno nuevo usando el botón o el chat!
                            </p>
                        )}
                    </div>
                </main>
                <Sidebar currentWeatherData={processedWeather} />
            </div>
        </div>
    );
}

export default Inicio;