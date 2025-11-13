import React, { useState, useEffect } from 'react';
import DetailedCultivationCard from '../../components/ui/MisCultivosCard';
import Button from '../../components/common/Button';
// 1. Ya NO importamos el modal

// Obtenemos la URL del backend desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MisCultivosPage() {
    // 2. Eliminamos el estado 'isModalOpen'
    const [cultivos, setCultivos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCultivos = async () => {
            setIsLoading(true); // Asegúrate de poner loading al recargar
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
        fetchCultivos();
    }, []); // El array vacío [] significa que esto se ejecuta solo una vez al cargar

    // 3. Eliminamos la función 'handleCultivoAdded'.
    // La página se recargará con 'useEffect' cuando naveguemos de vuelta.

    return (
        <>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                        Mis Cultivos
                    </h1>
                    {/* 4. El botón ahora usa 'to' para navegar */}
                    <Button to="/cultivos/nuevo">
                        Añadir Cultivo
                    </Button>
                </div>
                
                {isLoading && <p>Cargando cultivos...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {cultivos.map(cultivo => (
                            <DetailedCultivationCard 
                                key={cultivo.id}
                                id={cultivo.id}
                                name={cultivo.name}
                                // ¡Añadido! Usa 'location' de la base de datos
                                location={cultivo.location} 
                                // ¡Añadido! Usa la primera planta para el alt text, o un default
                                altText={`Foto de ${cultivo.plantas ? cultivo.plantas[0] : cultivo.name}`}
                                // ¡Actualizado! Tu tabla ya no tiene imageUrl
                                // puedes poner una imagen por defecto o construirla basada en las plantas
                                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3" // URL de marcador de posición
                                status={cultivo.status}
                                statusColor={cultivo.statusColor}
                                temp={cultivo.temp}
                                humidity={cultivo.humidity}
                                nutrients={cultivo.nutrients}
                                waterLevel={cultivo.waterLevel}
                            />
                        ))}
                    </div>
                )}
            </main>
            
            {/* 5. El modal se ha eliminado de aquí */}
        </>
    );
}

export default MisCultivosPage;