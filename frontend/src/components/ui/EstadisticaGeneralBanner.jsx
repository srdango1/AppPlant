import React from 'react';

/**
 * Banner de Resumen General Global.
 * Presenta una visión holística del sistema (promedios de todos los cultivos).
 * Incluye una imagen destacada decorativa y métricas consolidadas.
 * * @param {string|number} tempAvg - Temperatura promedio global.
 * @param {string|number} humidityAvg - Humedad promedio global.
 * @param {string|number} waterConsumption - Consumo total de agua (ej: "15L").
 */
const GeneralSummaryBanner = ({ tempAvg, humidityAvg, waterConsumption }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row mb-8 border border-gray-200 dark:border-gray-700">
            
            {/* Columna Izquierda: Imagen Decorativa */}
            <div className="md:w-1/3 h-48 md:h-auto bg-[#0a1f22] relative overflow-hidden flex items-center justify-center">
                {/* Efecto de Círculo con Imagen */}
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10">
                    <img 
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" 
                        alt="Naturaleza Resumen" 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                </div>
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            {/* Columna Derecha: Datos Consolidados */}
            <div className="p-8 flex flex-col justify-center md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Resumen General del Sistema
                </h2>
                
                <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span>Temperatura Promedio:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{tempAvg}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span>Humedad General:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{humidityAvg}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Consumo de Agua (Semana):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{waterConsumption}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSummaryBanner;