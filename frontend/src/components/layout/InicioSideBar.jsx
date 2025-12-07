//src/components/layout/InicioSideBar.jsx
import React from 'react';
//Import Componentes
import DailyForecast from '../ui/inicioPage/DailyForecast';
import AlertItem from '../ui/AlertItem';
import { Link } from 'react-router-dom';
import MiniCalendar from '../ui/inicioPage/MiniCalendar';
//--- MOCKS (Datos de prueba para visualización) ---
const MOCK_FORECAST = [
  { day: "Mañana", iconName: "wb_sunny", tempRange: "25° / 15°", isHighlighted: true },
  { day: "Miércoles", iconName: "cloud", tempRange: "22° / 14°" },
];

const MOCK_ALERTS = [
  { iconName: "water_drop", iconColor: "text-red-500", title: "Nivel de agua bajo", timeAgo: "Cama de Hierbas - Hace 1 hora", isCritical: true },
  { iconName: "thermostat", iconColor: "text-yellow-500", title: "Alta temperatura", timeAgo: "Cama de Lechugas - Hace 3 horas" },
];

/**
 * Barra lateral derecha para la página de Inicio (Dashboard).
 * Proporciona un resumen contextual rápido para el usuario:
 * 1. Resumen del clima actual y pronóstico corto.
 * 2. Últimas alertas críticas de los cultivos.
 * 3. Accesos directos a acciones frecuentes.
 * 4. Calendario interactivo.
 * * @param {Object} currentWeatherData - Objeto con datos del clima procesados (viene de useWeather + formatWeatherData).
 */
function Sidebar({currentWeatherData}) {
  
  // Desestructuración segura con valores por defecto (Fallbacks)
  // Esto previene que el componente se rompa si la API del clima falla.
  const temp = currentWeatherData?.temperature || 'N/A';
  const condition = currentWeatherData?.condition || 'Cargando...';
  const icon = currentWeatherData?.iconName || 'partly_cloudy_day'; 
  const forecastData = currentWeatherData?.forecast || MOCK_FORECAST; 
  //Las alertas aún usan mocks hasta integrar la API de notificaciones
  const alertsData = currentWeatherData?.alerts || MOCK_ALERTS;
  
  return (
    <aside className="hidden lg:block w-1/3 xl:w-1/4 p-6 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-8">
        
        {/* 1. SECCIÓN DE CLIMA (Datos Dinámicos de API) */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-accent text-3xl text-blue-500">
                    {icon} 
                </span>
            <div className="flex flex-col">
              <h1 className="text-lg font-medium">{temp}°C</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{condition}</p>
            </div>
          </div>
          
          {/* Lista de Pronóstico Diario */}
          <div className="flex flex-col gap-3">
            <h4 className="font-medium">Pronóstico del Tiempo</h4>
            {forecastData.map ((forecast , index) =>(
              <DailyForecast
                key={index}
                day={forecast.day}
                iconName={forecast.iconName}
                tempRange={forecast.tempRange}
                isHighlighted={forecast.isHighlighted}
              />
            ))}
      
          </div>
        </div>
        
        {/* 2. SECCIÓN DE ALERTAS (Datos Mock actuales) */}
        <div>
          <h4 className="font-medium mb-4">Últimas Alertas</h4>
          <div className="flex flex-col gap-3">
            <AlertItem 
              iconName="water_drop" 
              iconColor="text-red-500" 
              title="Nivel de agua bajo" 
              timeAgo="Cama de Hierbas - Hace 1 hora"
              isCritical={true}
            />
            <AlertItem 
              iconName="thermostat" 
              iconColor="text-yellow-500" 
              title="Alta temperatura" 
              timeAgo="Cama de Lechugas - Hace 3 horas"
            />
          </div>
        </div>
        
        {/* 3. ACCESOS RÁPIDOS */}
        <div>
          <h4 className="font-medium mb-4">Accesos Rápidos</h4>
          <div className="flex flex-col gap-2">
            {/* Botón Principal: Crear Cultivo */}
            <Link 
            to= "/cultivos/nuevo"
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined">add</span>
              <span>Añadir nuevo cultivo</span>
            </Link>
            
          </div>
        </div>
        {/* 4. CALENDARIO */}
        <MiniCalendar/>
      </div>
    </aside>
  );
}

export default Sidebar;