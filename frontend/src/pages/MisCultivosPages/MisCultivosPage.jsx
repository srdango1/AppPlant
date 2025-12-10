import React, { useState, useEffect } from 'react';
import DetailedCultivationCard from '../../components/ui/MisCultivosCard';
import Button from '../../components/common/Button';

import { getCultivationImage } from '../utils/utilsImg';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Página principal de "Mis Cultivos".
 * Responsabilidades:
 * 1. Obtener la lista de todos los cultivos del usuario desde la API.
 * 2. Manejar estados de carga (Loading) y error.
 * 3. Escuchar eventos de actualización ('cultivoActualizado') para refrescar la lista sin recargar.
 * 4. Renderizar la grilla de tarjetas de cultivo.
 */
function MisCultivosPage() {
    const [cultivos, setCultivos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Función asíncrona reutilizable para obtener los datos.
     * Se define fuera del useEffect para poder ser llamada por el listener de eventos.
     */    
        const fetchCultivos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/cultivos`);
            if (!response.ok) throw new Error('No se pudieron cargar los datos');
            
            const data = await response.json();
            setCultivos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Carga inicial de datos al montar el componente
    useEffect(() => {
        fetchCultivos();
    }, []);

/**
     * Effect: Patrón de Observador (Event Listener).
     * Permite que otros componentes (como el Chatbot o Modales de creación)
     * notifiquen que hubo cambios, forzando una recarga de esta lista.
     */    
    useEffect(() => {
        const handleCultivoActualizado = () => {
            console.log("Evento 'cultivoActualizado' recibido. Recargando cultivos...");
            fetchCultivos(); 
        };
        window.addEventListener('cultivoActualizado', handleCultivoActualizado);

        // Cleanup: Importante para evitar fugas de memori
        return () => {
            window.removeEventListener('cultivoActualizado', handleCultivoActualizado);
        };
    }, []); 

    return (
        <>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                        Mis Cultivos
                    </h1>
                    <Button to="/cultivos/nuevo">
                        Añadir Cultivo
                    </Button>
                </div>
                
                {/* Feedback Visual: Estados de Carga y Error */}
                {isLoading && <p>Cargando cultivos...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {/* Renderizado de la lista */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {cultivos.map(cultivo => {
                            const visualImageUrl = getVisualImageUrl(cultivo.plantas, cultivo.location);

                            return (
                                <DetailedCultivationCard 
                                    key={cultivo.id}
                                    id={cultivo.id}
                                    name={cultivo.name}
                                    location={cultivo.location} 
                                    altText={`Foto de ${cultivo.plantas ? cultivo.plantas[0] : cultivo.name}`}
                                    imageUrl={visualImageUrl}
                                    status={cultivo.status}
                                    statusColor={cultivo.statusColor}
                                    temp={cultivo.temp}
                                    humidity={cultivo.humidity}
                                    nutrients={cultivo.nutrients}
                                    waterLevel={cultivo.waterLevel}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}

export default MisCultivosPage;