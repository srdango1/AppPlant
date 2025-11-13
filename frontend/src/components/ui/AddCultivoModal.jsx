import React, { useState } from 'react';
import Button from '../common/Button';

// Obtenemos la URL del backend desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AddCultivoModal({ isOpen, onClose, onCultivoAdded }) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/cultivos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, location, imageUrl }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo crear el cultivo');
            }

            const newCultivo = await response.json();
            onCultivoAdded(newCultivo); // ⬅️ Envía el nuevo cultivo a la página principal
            
            // Limpiar formulario y cerrar modal
            setName('');
            setLocation('');
            setImageUrl('');
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Estilos del Modal (CSS en línea para simplicidad)
    const modalStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
    };
    const contentStyle = {
        background: 'white', color: '#333', padding: '2rem',
        borderRadius: '8px', width: '90%', maxWidth: '500px',
    };
    const inputStyle = {
        width: '100%', padding: '0.75rem', border: '1px solid #ccc',
        borderRadius: '4px', marginBottom: '1rem',
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Añadir Nuevo Cultivo</h2>
                
                <form onSubmit={handleSubmit}>
                    <label>Nombre del Cultivo (ej: Lechugas)</label>
                    <input type="text" style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
                    
                    <label>Ubicación (ej: Cama 1)</label>
                    <input type="text" style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} required />
                    
                    <label>URL de la Imagen</label>
                    <input type="url" style={inputStyle} value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
                    
                    {error && <p style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</p>}
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cultivo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCultivoModal;