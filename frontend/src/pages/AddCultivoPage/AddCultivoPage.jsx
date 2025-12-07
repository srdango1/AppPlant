//src/pages/AddCultivoPage/AddCultivoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importar todos los componentes de los pasos
import ProgressBar from '../../components/AgregarCultivo/ProgressBar';
import PasoUno from '../../components/AgregarCultivo/Paso1/PasoUno';
import PasoDos from '../../components/AgregarCultivo/Paso2/PasoDos';
import PasoTres from '../../components/AgregarCultivo/Paso3/PasoTres';
import PasoCuatro from '../../components/AgregarCultivo/Paso4/PasoCuatro';

// Obtenemos la URL del backend desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Página controladora para el flujo de creación de cultivos (Wizard).
 * Responsabilidades:
 * 1. Gestionar el estado global del formulario (State Lifting) para que los datos persistan entre pasos.
 * 2. Controlar la navegación secuencial (Paso 1 -> 2 -> 3 -> 4).
 * 3. Realizar la petición final POST a la API.
 */
function AddCultivoPage() {
    // Estado para controlar en qué paso se encuentra el usuario (1 a 4)
    const [currentStep, setCurrentStep] = useState(1);

    // Estado acumulativo con todos los datos del nuevo cultivo
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        plantas: [],
        deviceId: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Funciones de navegación
    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const handleCancel = () => navigate('/'); // Vuelve a la página principal

    /**
     * Finaliza el proceso y envía los datos al servidor.
     * Se ejecuta solo en el último paso (Paso 4).
     */
    const handleFinish = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/cultivos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo crear el cultivo');
            }
            
            // Notificación Global: Avisamos a la app que hay nuevos datos para recargar listas
            window.dispatchEvent(new CustomEvent('cultivoActualizado'));
            
            navigate('/'); // Vuelve a la página principal

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    /**
     * Renderizado Condicional del paso actual.
     * Actúa como un Router interno para intercambiar componentes manteniendo el estado.
     */
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PasoUno onNext={nextStep} onCancel={handleCancel} data={formData} setData={setFormData} />;
            case 2:
                return <PasoDos onNext={nextStep} onBack={prevStep} data={formData} setData={setFormData} />;
            case 3:
                return <PasoTres onNext={nextStep} onBack={prevStep} data={formData} setData={setFormData} />;
            case 4:
                return <PasoCuatro onFinish={handleFinish} onBack={prevStep} formData={formData} isLoading={isLoading} />;
            default:
                return <PasoUno onNext={nextStep} onCancel={handleCancel} data={formData} setData={setFormData} />;
        }
    };

    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                
                {/* Título y Barra de Progreso */}
                <div className="flex flex-col gap-6">
                    <h1 className="text-4xl font-black tracking-tighter">Añadir Nuevo Cultivo</h1>
                    <ProgressBar currentStep={currentStep} totalSteps={4} />
                </div>
                
                {/* Contenedor del Paso Actual */}
                <div>
                    {error && <p className="text-red-500 mb-4">Error al guardar: {error}</p>}
                    {renderStep()}
                </div>

            </div>
        </main>
    );
}

export default AddCultivoPage;