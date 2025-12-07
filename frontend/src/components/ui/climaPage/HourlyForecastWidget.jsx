//src/components/ui/climaPage/HourlyForecastWidget.jsx
import React, { useState } from 'react';
import HourlyForecastItem from './HourlyForecastItem'; 
import { getWeatherIcon } from '../../../utils/utilsWeather'; 

/**
 * Widget contenedor para el pronóstico del clima por hora.
 * Responsabilidades:
 * 1. Recibir la data cruda de la API (lista de 40 elementos).
 * 2. Filtrar y transformar los datos para mostrar solo las próximas 24 horas.
 * 3. Gestionar el estado de selección de una hora específica.
 * * @param {Array} hourlyData - Array de objetos con datos meteorológicos crudos ("list" de OpenWeatherMap).
 */
function HourlyForecastWidget({ hourlyData }) { 
    // Estado para controlar qué tarjeta de hora está activa visualmente
    const [selectedHourId, setSelectedHourId] = useState(0);
    
    // Validación de seguridad: Retorna null si no hay datos para evitar errores de renderizado
    if (!hourlyData || !Array.isArray(hourlyData)) {
        return null; 
    }
  
    // Transformación de datos:
    // 1. .slice(0, 8): Tomamos solo los primeros 8 intervalos (8 * 3 horas = 24 horas).
    // 2. .map(): Convertimos el objeto complejo de la API en un objeto simple para la UI
    const processedHours = hourlyData ? hourlyData.slice(0, 8).map((item, index) => {
        // Formateo de hora local (ej: "14:00"
        const time = new Date(item.dt * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            id: index,
            time: time,
            // Reutilizamos la utilidad centralizada para obtener el icono correcto
            iconName: getWeatherIcon(item.weather[0].icon), 
            temperature: Math.round(item.main.temp) + '°C'
        };
    }) : [];

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Pronóstico por Hora</h3>
            
            <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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