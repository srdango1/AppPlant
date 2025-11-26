import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import StatsCard from "../components/ui/inicioPage/StatsCard"
import WeatherWidget from "../components/ui/inicioPage/WeatherWidget";
import CultivationCard from "../components/ui/inicioPage/CultivationCard";
import Sidebar from "../components/layout/InicioSideBar";

import useWeather from '../hooks/useWeather'
const MOCK_STATS = {
    humedad: "68%",
    temperatura: "23°C",
    agua: "85%",
    luz: "750 lux"
};

function Inicio (){
    const [cultivos, setCultivos] = useState([]);
    const [stats, setStats] = useState(MOCK_STATS);
    return(
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex flex-1">
                <main className="w-full lg:w-2/3 xl:w-3/4 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatsCard title="Humedad promedio" value={stats.humedad} />
                        <StatsCard title="Temperatura promedio" value={stats.temperatura} />
                        <StatsCard title="Nivel de agua" value={stats.agua} />
                        <StatsCard title="Luz recibida" value={stats.luz} />
                    </div>
                    <WeatherWidget/>

                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mis Camas de Cultivo</h3>
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
                                No tienes cultivos activos.
                            </p>
                        )}
                    </div>
                </main>
                <Sidebar/>
            </div>
        </div>
    );
}

export default Inicio;