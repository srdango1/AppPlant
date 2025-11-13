// src/pages/MisCultivosPage.jsx
import { Link } from 'react-router-dom';
import React from 'react';
import DetailedCultivationCard from '../../components/ui/MisCultivosCard';
import Button from '../../components/common/Button';
// Datos de ejemplo para el prototipo
const cultivosData = [
    {
        id: 'lechugas-cama-1', 
        name: 'Lechugas', 
        location: 'Cama 1', 
        status: 'Saludable', 
        statusColor: 'text-green-500', 
        temp: '22°C', // Agregué 'temp' (Temperatura) ya que estaba en tu HTML original.
        humidity: '65%',
        nutrients: '6.5 pH', // Dato simulado
        waterLevel: '80%', 
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3',
        altText: 'Foto de un cultivo de lechugas'
    },
    {
        id: 'tomates-cherry-balcon', 
        name: 'Tomates Cherry', 
        location: 'Balcón', 
        status: 'Necesita Agua', 
        statusColor: 'text-yellow-500', 
        temp: '25°C', 
        humidity: '40%',
        nutrients: '5.2 pH', // Dato simulado
        waterLevel: '15%', 
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
        altText: 'Foto de tomates cherry'
    },
    {
        id: 'hierbas-ventana', 
        name: 'Hierbas', 
        location: 'Ventana Cocina', 
        status: 'Plaga Detectada', 
        statusColor: 'text-red-500', 
        temp: '20°C', 
        humidity: '60%',
        nutrients: '6.0 pH', // Dato simulado
        waterLevel: '50%', 
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
        altText: 'Foto de hierbas aromáticas'
    },
];


function MisCultivosPage() {
    return (
        <>

            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
                
                {/* Título de la Página */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                        Mis Cultivos
                    </h1>
                    <Button
                    
                    >Añadir Cultivo</Button>
                </div>
                
                {/* Contenedor de la Cuadrícula */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Mapeo para generar las tarjetas con los datos dados arriba*/}
                    {cultivosData.map(cultivo => (
                        <DetailedCultivationCard 
                            key={cultivo.id}
                            name={cultivo.name}
                            locarion={cultivo.location}
                            imageUrl={cultivo.imageUrl}
                            status={cultivo.status}
                            statusColor={cultivo.statusColor}
                            temperature={cultivo.temp}
                            humidity={cultivo.humidity}
                            nutrients={cultivo.nutrients}
                            waterLevel={cultivo.waterLevel}
                           altText={cultivo.altText}
                           id={cultivo.id}
                            
                            
                        />
                    ))}
                    
                </div>
            </main>
            
            
        </>
    );
}

export default MisCultivosPage;