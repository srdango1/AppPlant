import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import StatsCard from "../components/ui/inicioPage/StatsCard";
import WeatherWidget from "../components/ui/inicioPage/WeatherWidget";
import CultivationCard from "../components/ui/climaPage/CultivationCard";
import Sidebar from "../components/layout/InicioSideBar";

import useWeather from '../hooks/useWeather';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función para asignar imágenes visuales basadas en la planta
const getVisualImageUrl = (plantas) => {
    if (!plantas || plantas.length === 0) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3'; 
    }
    const firstPlant = plantas[0];
    const plantImageMap = {
        'tomato': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
        'lettuce': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3',
        'basil': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
        'mint': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
        'strawberry': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
        'pepper': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    };
    return plantImageMap[firstPlant] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3';
};

function Inicio() {
    const [cultivos, setCultivos] = useState([]);
    
    // --- AQUÍ ESTABA EL ERROR: Nos aseguramos de declarar 'stats' ---
    const [stats, setStats] = useState({
        humedad: "0%",
        temperatura: "0°C",
        agua: "0%",
        luz: "0%"
    });
    // ---------------------------------------------------------------
    const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather('Osorno');
    

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/cultivos`);
                if (response.ok) {
                    const data = await response.json();
                    setCultivos(data);

                    // Si hay cultivos, mostramos datos "vivos" (simulados)
                    if (data.length > 0) {
                        setStats({
                            humedad: "65%",
                            temperatura: "24°C",
                            agua: "80%",
                            luz: "75%"
                        });
                    }
                }
            } catch (error) {
                console.error("Error cargando inicio:", error);
            }
        };
        fetchData();
    }, []);

    // --- ESCUCHAR EVENTO PARA RECARGAR ---
    // Esto hace que si el Chatbot crea un cultivo, el inicio se actualice solo
    useEffect(() => {
        const handleRecargar = () => {
             // Reutilizamos la lógica de fetch (copiando para simplificar o extraer a función)
             fetch(`${API_BASE_URL}/cultivos`)
                .then(res => res.json())
                .then(data => {
                    setCultivos(data);
                    if (data.length > 0) {
                        setStats({
                            humedad: "65%", temperatura: "24°C", agua: "80%", luz: "75%"
                        });
                    }
                })
                .catch(err => console.error(err));
        };

        window.addEventListener('cultivoActualizado', handleRecargar);
        return () => window.removeEventListener('cultivoActualizado', handleRecargar);
    }, []);

    const processedWeather = weatherData && !weatherError ? {
        city: weatherData.city ? weatherData.city.name : 'N/A',
        temperature: weatherData.current ? Math.round(weatherData.current.temp) : 'N/A',
        condition: weatherData.current ? weatherData.current.weather[0].description : 'N/A',
        iconName: weatherData.current ? weatherData.current.weather[0].icon : 'sync',
        humidity: weatherData.current ? weatherData.current.main.humidity : 'N/A',
        wind: weatherData.current ? weatherData.current.wind.speed : 'N/A',
    } : null;
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex flex-1">
                <main className="w-full lg:w-2/3 xl:w-3/4 p-6">
                    
                    {/* Tarjetas de Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Aquí es donde fallaba si 'stats' no estaba definido */}
                        <StatsCard title="Humedad promedio" value={stats.humedad} />
                        <StatsCard title="Temperatura promedio" value={stats.temperatura} />
                        <StatsCard title="Nivel de agua" value={stats.agua} />
                        <StatsCard title="Luz recibida" value={stats.luz} />
                    </div>
                    
                  {weatherLoading ? (
                        <div className="p-6 mb-6 text-center text-gray-500 border border-dashed rounded-xl">
                            <span className="material-symbols-outlined animate-spin text-xl mr-2">refresh</span>
                            Cargando datos del clima...
                        </div>
                    ) : (
                        processedWeather && (
                            <WeatherWidget 
                                city={processedWeather.city}
                                temperature={processedWeather.temperature}
                                description={processedWeather.condition}
                                humidity={processedWeather.humidity}
                                wind={processedWeather.wind}
                                iconName={processedWeather.iconName}
                            />
                        )
                    )}

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
                                        imageUrl={getVisualImageUrl(cultivo.plantas)} 
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