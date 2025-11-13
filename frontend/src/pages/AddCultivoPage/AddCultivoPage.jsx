import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProgressBar from '../../components/AgregarCultivo/ProgressBar';
import PasoUno from '../../components/AgregarCultivo/Paso1/PasoUno';
import PasoDos from '../../components/AgregarCultivo/Paso2/PasoDos';
import PasoTres from '../../components/AgregarCultivo/Paso3/PasoTres';
import PasoCuatro from '../../components/AgregarCultivo/Paso4/PasoCuatro';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Ya NO hay función generateImageUrl ---

function AddCultivoPage() {
    const [currentStep, setCurrentStep] = useState(1);
    // --- 'imageUrl' eliminado del estado ---
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        plantas: [],
        deviceId: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const handleCancel = () => navigate('/');

    const handleFinish = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // --- Ya no generamos URL, solo enviamos el formData ---
            const response = await fetch(`${API_BASE_URL}/cultivos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), // Envía el estado simple
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo crear el cultivo');
            }
            
            navigate('/');

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

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
            <div className="max-w-4xl mx_auto flex flex-col gap-8">
                
                <div className="flex flex-col gap-6">
                    <h1 className="text-4xl font-black tracking-tighter">Añadir Nuevo Cultivo</h1>
                    <ProgressBar currentStep={currentStep} totalSteps={4} />
                </div>
                
                <div>
                    {error && <p className="text-red-500 mb-4">Error al guardar: {error}</p>}
                    {renderStep()}
                </div>

            </div>
        </main>
    );
}

export default AddCultivoPage;