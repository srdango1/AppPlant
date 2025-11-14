import React, { useState, useEffect } from 'react';
import DetailedCultivationCard from '../../components/ui/MisCultivosCard';
import Button from '../../components/common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Función de Lógica Visual (para las imágenes) ---
const getVisualImageUrl = (plantas) => {
    if (!plantas || plantas.length === 0) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3'; 
    }
    const firstPlant = plantas[0];
    const plantImageMap = {
        'tomato': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
        'lettuce': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3',
        'basil': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
        'mint': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
        'strawberry': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
        'pepper': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    };
    return plantImageMap[firstPlant] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3';
};


function MisCultivosPage() {
    const [cultivos, setCultivos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Convertimos la lógica de fetch en una función reutilizable
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

    // 2. useEffect para cargar los datos al inicio
    useEffect(() => {
        fetchCultivos();
    }, []);

    // 3
    // Este useEffect escucha el evento global 'cultivoActualizado'
    // y vuelve a llamar a fetchCultivos() cuando lo oye.
    useEffect(() => {
        const handleCultivoActualizado = () => {
            console.log("Evento 'cultivoActualizado' recibido. Recargando cultivos...");
            fetchCultivos(); // Vuelve a cargar los datos
        };

        // Añade el "listener"
        window.addEventListener('cultivoActualizado', handleCultivoActualizado);

        // Limpia el "listener" cuando el componente se desmonta
        return () => {
            window.removeEventListener('cultivoActualizado', handleCultivoActualizado);
        };
    }, []); // El array vacío [] asegura que esto se ejecute solo una vez

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
                
                {isLoading && <p>Cargando cultivos...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {cultivos.map(cultivo => {
                            const visualImageUrl = getVisualImageUrl(cultivo.plantas);

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