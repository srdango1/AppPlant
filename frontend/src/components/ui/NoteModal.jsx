//src/components/modals/NoteModal.jsx
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuración de paleta de colores para las notas
const COLORS = [
    { id: 'white', class: 'bg-white', border: 'border-gray-200' },
    { id: 'yellow', class: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: 'green', class: 'bg-green-50', border: 'border-green-200' },
    { id: 'blue', class: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'red', class: 'bg-red-50', border: 'border-red-200' },
];

/**
 * Modal de gestión de Notas Diarias (Bitácora).
 * Implementa funcionalidades CRUD completas (Crear, Leer, Eliminar) para una fecha específica.
 * Sincroniza cambios con el calendario mediante eventos personalizados.
 * * @param {boolean} isOpen - Estado de visibilidad.
 * @param {Function} onClose - Función de cierre.
 * @param {Date} date - Objeto Date correspondiente al día seleccionado.
 */
function NoteModal({ isOpen, onClose, date }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estado del formulario de creación
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    // Helpers de formateo de fecha
    const dateStr = date ? date.toISOString().split('T')[0] : '';
    const displayDate = date ? date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

    /**
     * Effect: Carga las notas cada vez que se abre el modal o cambia la fecha seleccionada.
     */
    useEffect(() => {
        if (isOpen && date) {
            fetchNotes();
            // Resetear campos del formulario
            setTitle('');
            setContent('');
            setSelectedColor(COLORS[0]);
        }
    }, [isOpen, date]);

    // Función GET para obtener notas del backend
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/notes?date=${dateStr}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja la creación de una nueva nota (POST).
     * Dispara el evento 'cultivoActualizado' para que el calendario pinte el punto de color.
     */
    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim() && !content.trim()) return;

        try {
            await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title || "Nota rápida",
                    content: content,
                    date: dateStr,
                    color: selectedColor.class // PErsistencia del color
                })
            });
            
            // UX: Limpiar formulario y recargar lista inmediata
            setTitle('');
            setContent('');
            fetchNotes();

            // Sincronización Global: Notificar al calendario para actualizar indicadores visuales
            window.dispatchEvent(new CustomEvent('cultivoActualizado'));
        } catch (error) {
            console.error(error);
        }
    };

    // Función DELETE para eliminar notas
    const handleDelete = async (id) => {
        if(!confirm("¿Borrar?")) return;
        await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
        fetchNotes();
        // Notificamos también al borrar, por si era la última nota del día (para quitar el punto)
        window.dispatchEvent(new CustomEvent('cultivoActualizado'));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold capitalize text-gray-800 dark:text-white">{displayDate}</h3>
                    <button onClick={onClose}><span className="material-symbols-outlined text-gray-400 hover:text-gray-600">close</span></button>
                </div>

                {/* Lista de Notas Existentes */}
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 bg-gray-50/50 dark:bg-gray-800">
                    {loading ? <p className="text-center text-xs text-gray-400">Cargando...</p> : 
                     notes.length === 0 ? <p className="text-center text-xs text-gray-400 italic py-2">Sin notas este día</p> :
                     notes.map(note => {
                         const colorObj = COLORS.find(c => c.class === note.color) || COLORS[0];
                         return (
                            <div key={note.id} className={`p-3 rounded-lg border text-sm relative group ${note.color || 'bg-white'} ${colorObj.border}`}>
                                <p className="font-bold text-gray-800 mb-1">{note.title}</p>
                                <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                                <button 
                                    onClick={() => handleDelete(note.id)}
                                    className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                         )
                     })
                    }
                </div>

                {/* Formulario de Nueva Nota */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <form onSubmit={handleSave} className="flex flex-col gap-3">
                        <p className="text-xs font-bold text-gray-500 uppercase">Nueva Nota</p>
                        
                        <input 
                            type="text" placeholder="Título..." 
                            className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={title} onChange={e => setTitle(e.target.value)}
                        />
                        <textarea 
                            placeholder="Detalles..." 
                            className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary outline-none h-16 resize-none"
                            value={content} onChange={e => setContent(e.target.value)}
                        />
                        
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {COLORS.map(c => (
                                    <button
                                        key={c.id} type="button"
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-5 h-5 rounded-full border ${c.class} ${selectedColor.id === c.id ? 'ring-2 ring-gray-400' : ''}`}
                                    />
                                ))}
                            </div>
                            <Button type="submit" className="h-8 text-xs px-3">Guardar</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default NoteModal;