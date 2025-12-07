//src/components/AgregarCultivo/Paso3/PasoTres.jsx
import React, { useState, useEffect } from 'react';
import SensorStatusItem from './SensorStatus';
import { Link } from 'react-router-dom';

// Estado inicial simulado de los sensores
const INITIAL_SENSORS = [
    { id: 'humedad', name: 'Sensor de Humedad del Suelo', status: 'Conectando...', detail: '' },
    { id: 'temp', name: 'Sensor de Temperatura/Humedad', status: 'Conectando...', detail: '' },
    { id: 'luz', name: 'Sensor de Luz', status: 'Conectando...', detail: '' },
];

const SIMULATED_DEVICE_ID = 'arduino_uno_balcon_82A4';

/**
 * Tercer paso del proceso: Conexión de Dispositivos (IoT).
 * Simula el proceso de descubrimiento y vinculación de sensores físicos
 * utilizando timeouts para emular la latencia de la red local.
 */
function StepThreeDeviceConnect({ onNext, onBack, data, setData }) {
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  
  /**
   * Effect: Simulación del proceso de "Handshake" con el dispositivo.
   * Después de 2 segundos, cambia el estado de los sensores a "Conectado".
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Actualizamos estado visual de los sensores
      setSensors(prev => prev.map(s => ({ ...s, status: 'Conectado' })));
      // Guardamos el ID del dispositivo en el estado global del formulario
      setData(prevData => ({
        ...prevData,
        deviceId: SIMULATED_DEVICE_ID 
      }));
      
    }, 2000); // 2 segundos

    return () => clearTimeout(timer);
  }, [setData]);
  
  // Validación: Solo se puede avanzar si todos los sensores están OK
  const canProceed = sensors.every(s => s.status === 'Conectado');
  
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Conectando tu Dispositivo</h2>
           <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">1</div>
              <p>Conecta el dispositivo a la corriente.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">2</div>
              <p>Coloca los sensores en la tierra.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">3</div>
              <p>La aplicación detectará tus sensores...</p>
            </div>
          </div>
           <div className="mt-6 aspect-w-4 aspect-h-3 w-full rounded-lg overflow-hidden">
            <img alt="Dispositivo" className="w-full h-full object-contain bg-gray-200 dark:bg-gray-700" src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"/>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-4">Estado de Conexión</h2>
          <div className="space-y-4 flex-1">
            {sensors.map(sensor => (
              <SensorStatusItem 
                key={sensor.id}
                name={sensor.name}
                status={sensor.status}
                detail={sensor.detail}
              />
            ))}
            
            {!canProceed && (
                <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">Buscando dispositivo...</p>
            )}
            {canProceed && (
                <p className="text-center text-green-600 font-medium">¡Dispositivo {SIMULATED_DEVICE_ID} conectado!</p>
            )}
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <Link 
              to ="/"
              className="text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Cancelar
            </Link>
            <div className="flex gap-4">
              <button 
                className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
                onClick={onBack}
              >
                Atrás
              </button>
              <button 
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed" 
                disabled={!canProceed}
                onClick={onNext}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepThreeDeviceConnect;