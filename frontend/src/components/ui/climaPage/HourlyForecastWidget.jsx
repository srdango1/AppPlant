// src/components/weather/HourlyForecastWidget.jsx

import React, { useState } from 'react';
import HourlyForecastItem from './HourlyForecastItem'; 
import { getWeatherEmoji } from '../../services/weatherAPI';



function HourlyForecastWidget({forecastData}) {
    const [selectedHourId, setSelectedHourId] = useState(1);
    
    const processedHours = forecastData ? forecastData.list.slice(0,8).map((item,index)=>{
        const time = new Date(item.dt * 1000).toLocaleTimeString('es-ES',{
            hour: '2-digit',
            minute : '2-digit'
        });
        return{
            id:index,
            time: time,
            iconName :getWeatherEmoji(item.weather[0].main),
            temperature: Math.round(item.main.temp) + '°C'
        }
    }) : [];
    return (
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Pronóstico por Hora</h3>
            
            {/* Contenedor del Scroll Horizontal */}
            <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                
                {/* Contenedor Flex para las Tarjetas */}
                <div className="flex items-stretch p-2 gap-4">
                    {processedHours.map(hour => (
                        <HourlyForecastItem 
                            key={hour.id}
                            time={hour.time}
                            iconName={hour.iconName}
                            temperature={hour.temperature}
                            isSelected={hour.id === selectedHourId}
                            onClick={() => setSelectedHourId(hour.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HourlyForecastWidget;