//Import React
import React from 'react';
//Import Componentes
import DailyForecast from '../ui/inicioPage/DailyForecast';
import AlertItem from '../ui/AlertItem';
import { Link } from 'react-router-dom';
import MiniCalendar from '../ui/inicioPage/MiniCalendar';

const MOCK_FORECAST = [
  { day: "Mañana", iconName: "wb_sunny", tempRange: "25° / 15°", isHighlighted: true },
  { day: "Miércoles", iconName: "cloud", tempRange: "22° / 14°" },
];

const MOCK_ALERTS = [
  { iconName: "water_drop", iconColor: "text-red-500", title: "Nivel de agua bajo", timeAgo: "Cama de Hierbas - Hace 1 hora", isCritical: true },
  { iconName: "thermostat", iconColor: "text-yellow-500", title: "Alta temperatura", timeAgo: "Cama de Lechugas - Hace 3 horas" },
];

// solo es el componente grande del sidebar
function Sidebar({currentWeatherData}) {

  const temp = currentWeatherData?.temp || 'N/A';
  const condition = currentWeatherData?.condition || 'Cargando...';
  const icon = currentWeatherData?.iconName || 'partly_cloudy_day'; 
  const forecastData = currentWeatherData?.forecast || MOCK_FORECAST; 
  const alertsData = currentWeatherData?.alerts || MOCK_ALERTS;
  
  return (
    <aside className="hidden lg:block w-1/3 xl:w-1/4 p-6 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-8">
        
        {/* Sección de Clima (Repetida) sorpresa no es dinamico */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`material-symbols-outli8ned text-primary text-4xl`}>{icon}</span>
            <div className="flex flex-col">
              <h1 className="text-lg font-medium">{temp}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{condition}</p>
            </div>
          </div>
          
          {/* Pronóstico del Tiempo para dias siguientes aun no es dinamico*/}
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
        
        {/* Últimas Alertas recibidas, falta hacer dinamico*/}
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
        
        {/* Accesos "Rápidos" */}
        <div>
          <h4 className="font-medium mb-4">Accesos Rápidos</h4>
          <div className="flex flex-col gap-2">
            <Link 
            to= "/cultivos/nuevo"
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined">add</span>
              <span>Añadir nuevo cultivo</span>
            </Link>
            {/* Hay que cambiarle el icon */}
            <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <span className="material-symbols-outlined">history</span>
              <span>Ver Notas</span>
            </button>
          </div>
        </div>
        <MiniCalendar/>
      </div>
    </aside>
  );
}

export default Sidebar;