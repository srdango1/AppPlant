//src/components/AgregarCultivo/Paso4/PasoCuatro.jsx
import React from 'react';
import SummaryItem from './Resumen';

/**
 * Cuarto y último paso del Wizard: Resumen y Confirmación.
 * Muestra una vista consolidada de todos los datos recopilados en los pasos anteriores
 * (Nombre, Plantas, Hardware) para que el usuario valide antes de guardar.
 * * @param {Object} formData - Objeto con el estado global acumulado del wizard.
 * @param {Function} onFinish - Función para enviar los datos finales al backend/padre.
 * @param {Function} onBack - Función para regresar al paso anterior.
 * @param {boolean} isLoading - Estado de carga para deshabilitar botones durante el envío.
 */
function StepFourSummary({ formData, onFinish, onBack, isLoading }) {
    
    // Preparación de datos para visualización (Data Mapping)
    // Se manejan valores por defecto (Fallbacks) por si algún campo es null/undefined.
    const datos = {
        nombre: formData.nombre || "Sin nombre",
        ubicacion: formData.ubicacion || "Sin ubicación",
        // Formateo de array a string legible
        plantas: `${formData.plantas.length} plantas (${formData.plantas.join(', ') || 'Ninguna'})`,
        device: formData.deviceId || "Ninguno conectado",
        alertRef: formData.nombre || "Cultivo"
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-[#333333] dark:text-white">Resumen del Cultivo</h3>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SummaryItem label="Nombre del Cultivo" value={datos.nombre} />
                    <SummaryItem label="Ubicación" value={datos.ubicacion} />
                    <SummaryItem label="Plantas Seleccionadas" value={datos.plantas} />
                    <SummaryItem label="Dispositivo Conectado" value={datos.device} />
                </div>
            </div>

            <div className="p-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-lg flex flex-col items-start p-6 shadow-[0_0_4px_rgba(0,0,0,0.1)]">
                    <div className="flex w-full items-start justify-between gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-bold leading-normal">Referencia para Alertas</p>
                            <p className="text-yellow-900 dark:text-yellow-100 text-2xl font-bold leading-tight">{datos.alertRef}</p>
                            <p className="text-yellow-700 dark:text-yellow-300 text-base font-normal leading-normal">Las notificaciones se basarán en los umbrales de este cultivo.</p>
                        </div>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-yellow-400/80 dark:bg-yellow-500/90 text-yellow-900 dark:text-yellow-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors">
                            <span className="truncate">Cambiar</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 p-4 mt-8">
                <button 
                    className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium leading-normal hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    <span className="truncate">Volver al Paso Anterior</span>
                </button>
                <button 
                    className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-green-600 transition-colors
                    disabled:opacity-50 disabled:cursor-wait"
                    
                    onClick={onFinish} 
                    disabled={isLoading} 
                >
                    <span className="truncate">
                        {isLoading ? 'Guardando...' : 'Finalizar y Guardar Cultivo'}
                    </span>
                </button>
            </div>
        </div>
    );
}

export default StepFourSummary;