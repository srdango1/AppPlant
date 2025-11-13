import React, { useState, useEffect } from 'react';
import DetailedCultivationCard from '../../components/ui/MisCultivosCard';
import Button from '../../components/common/Button';
import AddCultivoModal from '../../components/ui/AddCultivoModal'; // 1. Importar el modal

// Obtenemos la URL del backend desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MisCultivosPage() {
    // 2. Usar estado para los cultivos y el modal
    const [cultivos, setCultivos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Cargar datos del backend cuando la página se monta
    useEffect(() => {
        const fetchCultivos = async () => {
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
    }, []); // El array vacío [] significa que esto se ejecuta solo una vez

    // 4. Función para añadir el nuevo cultivo al estado
    const handleCultivoAdded = (newCultivo) => {
        setCultivos(prevCultivos => [...prevCultivos, newCultivo]);
        setIsModalOpen(false); // Cierra el modal
    };

    return (
        <>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                        Mis Cultivos
                    </h1>
                    {/* 5. Botón para abrir el modal */}
                    <Button onClick={() => setIsModalOpen(true)}>
                        Añadir Cultivo
                    </Button>
                </div>
                
                {/* 6. Manejo de estados de Carga y Error */}
                {isLoading && <p>Cargando cultivos...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {/* 7. Contenedor de la Cuadrícula */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 8. Mapeo de la lista de cultivos del estado */}
                        {cultivos.map(cultivo => (
                            <DetailedCultivationCard 
                                key={cultivo.id}
                                id={cultivo.id}
                                name={cultivo.name}
                                location={cultivo.location}
                                imageUrl={cultivo.imageUrl}
                                status={cultivo.status}
                                statusColor={cultivo.statusColor}
                                temp={cultivo.temp}
                                humidity={cultivo.humidity}
                                nutrients={cultivo.nutrients}
                                waterLevel={cultivo.waterLevel}
                                altText={`Foto de ${cultivo.name}`}
                            />
                        ))}
                    </div>
                )}
            </main>
            
            {/* 9. Renderizar el modal */}
            <AddCultivoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCultivoAdded={handleCultivoAdded}
            />
        </>
    );
}

export default MisCultivosPage;