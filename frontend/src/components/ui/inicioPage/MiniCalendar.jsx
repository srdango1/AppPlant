import React, { useState, useEffect } from "react";
import { DayPicker } from 'react-day-picker';
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css';
import { format } from "date-fns";
import NoteModal from "../NoteModal"; // Importamos el modal

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MiniCalendar({ onDateSelect }) {
    const [selected, setSelected] = useState(new Date());
    const [notes, setNotes] = useState([]);
    
    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState(null); // Nota del día seleccionado

    // 1. Cargar notas al inicio para pintar los puntitos
    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error cargando notas:", error);
        }
    };

    useEffect(() => {
        fetchNotes();
        
        // Escuchar si el chatbot o alguien más actualiza las notas para refrescar los puntos
        window.addEventListener('cultivoActualizado', fetchNotes);
        return () => window.removeEventListener('cultivoActualizado', fetchNotes);
    }, []);

    // 2. Función para saber qué días tienen nota (para el puntito)
    const daysWithNotes = notes.map(note => new Date(note.date + 'T12:00:00')); // Ajuste de zona horaria simple

    // 3. Manejar clic en un día
    const handleDayClick = (day) => {
        setSelected(day);
        
        // Buscar si ya existe nota ese día
        const dateStr = format(day, 'yyyy-MM-dd');
        const existing = notes.find(n => n.date === dateStr);
        
        setCurrentNote(existing || null);
        setIsModalOpen(true); // Abrir ventanita
        
        if (onDateSelect) onDateSelect(day);
    };

    // 4. Guardar nota (desde el modal)
    const handleSaveNote = async (content) => {
        const dateStr = format(selected, 'yyyy-MM-dd');
        
        // Si ya existe y está vacía, podríamos borrarla, pero aquí guardamos
        try {
            // Si existía, primero la borramos para sobreescribir (método simple)
            if (currentNote) {
                await fetch(`${API_BASE_URL}/notes/${currentNote.id}`, { method: 'DELETE' });
            }
            
            if (content.trim()) {
                await fetch(`${API_BASE_URL}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: "Nota rápida", // Título genérico para notas rápidas
                        content: content,
                        date: dateStr
                    })
                });
            }
            
            setIsModalOpen(false);
            fetchNotes(); // Refrescar puntitos
            window.dispatchEvent(new CustomEvent('cultivoActualizado')); // Avisar a otros componentes
            
        } catch (e) {
            console.error(e);
        }
    };

    // 5. Borrar nota
    const handleDeleteNote = async (id) => {
        await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
        setIsModalOpen(false);
        fetchNotes();
        window.dispatchEvent(new CustomEvent('cultivoActualizado'));
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-center">
                <style>{`
                .rdp { margin: 0; --rdp-cell-size: 35px; }
                .rdp-day_selected { background-color: #4CAF50 !important; color: white !important; font-weight: bold; }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; }
                .dark .rdp-day { color: #e5e7eb; }
                .dark .rdp-caption_label { color: #4CAF50; }
                .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #374151; }
                
                /* ESTILO DEL PUNTITO */
                .rdp-day_hasNote { position: relative; }
                .rdp-day_hasNote::after {
                    content: '';
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 5px;
                    height: 5px;
                    background-color: #ff9800; /* Color naranja para el puntito */
                    border-radius: 50%;
                }
                `}</style>

                <DayPicker
                    mode="single"
                    selected={selected}
                    onDayClick={handleDayClick}
                    locale={es}
                    modifiers={{ hasNote: daysWithNotes }} // Activa el estilo _hasNote
                    modifiersClassNames={{ hasNote: 'rdp-day_hasNote' }}
                    className="text-sm"
                />
            </div>

            {/* Ventanita (Modal) */}
            <NoteModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selected}
                existingNote={currentNote}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
            />
        </>
    );
}
export default MiniCalendar;