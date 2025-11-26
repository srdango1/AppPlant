import React from 'react';

function WeatherWidget({ temperature, condition, iconName, city, humidity, wind }) {
  
  // Estado de carga / sin datos
  if (!temperature) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
        <span className="material-symbols-outlined text-gray-500">sync</span>
        <p className="text-sm text-gray-500">Clima no disponible</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="rounded-xl shadow-sm bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        
        <div className="p-6 flex flex-col gap-3">
          
          {/* 1. TÍTULO */}
          <p className="text-lg font-bold tracking-[-0.015em] text-gray-900 dark:text-white">
            Clima Actual - {city}
          </p>

          {/* 2. FILA CENTRAL: ÍCONO + TEMPERATURA */}
          <div className="flex items-center gap-4">
            {/* Ícono: Usamos text-6xl para que tenga el mismo tamaño base que el texto */}
            <span 
                className="material-symbols-outlined text-blue-500" 
                style={{ fontSize: '64px' }} // Tamaño fijo para asegurar consistencia
            >
              {iconName}
            </span>
            
            {/* Temperatura: 
                leading-none = Quita el espacio extra arriba/abajo
                mt-2 = Un pequeño ajuste óptico si la fuente de números "sube" mucho
            */}
            <p className="text-6xl font-bold text-gray-900 dark:text-white leading-none">
              {temperature}°C
            </p>
          </div>

          {/* 3. DETALLES INFERIORES */}
          <div className='flex flex-col gap-1 mt-1'>
            <p className="text-base font-medium text-gray-600 dark:text-gray-300 capitalize">
              {condition}
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Humedad: {humidity}% &bull; Viento: {wind} km/h
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;