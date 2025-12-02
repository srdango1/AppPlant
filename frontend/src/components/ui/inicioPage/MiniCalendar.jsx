import React, { useState, useEffect } from "react";
import { DayPicker } from 'react-day-picker';
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css';
import { format } from "date-fns";
import NoteModal from "../NoteModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MiniCalendar({ onDateSelect }) {
    const [selected, setSelected] = useState(new Date());
    const [notes, setNotes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState(null);

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
        window.addEventListener('cultivoActualizado', fetchNotes);
        return () => window.removeEventListener('cultivoActualizado', fetchNotes);
    }, []);

    // Días que tienen notas (para los puntitos)
    const daysWithNotes = notes.map(note => new Date(note.date + 'T12:00:00'));

    const handleDayClick = (day) => {
        setSelected(day);
        const dateStr = format(day, 'yyyy-MM-dd');
        // Buscar nota existente
        const existing = notes.find(n => n.date === dateStr);
        setCurrentNote(existing || null);
        
        // ABRIMOS EL MODAL SIEMPRE (sea nueva o existente)
        // Si estamos en Inicio (sin onDateSelect), abrimos el modal.
        if (!onDateSelect) {
            setIsModalOpen(true);
        } else {
            // Si estamos en NotasPage, solo seleccionamos la fecha
            onDateSelect(day);
        }
    };

    // --- FUNCIÓN ACTUALIZADA: Recibe Title y Color ---
    const handleSaveNote = async (title, content, color) => {
        const dateStr = format(selected, 'yyyy-MM-dd');
        
        try {
            // Si existía, la borramos primero (para simplificar la actualización)
            if (currentNote) {
                await fetch(`${API_BASE_URL}/notes/${currentNote.id}`, { method: 'DELETE' });
            }
            
            if (title.trim() || content.trim()) {
                await fetch(`${API_BASE_URL}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title || "Sin título",
                        content: content,
                        date: dateStr,
                        color: color // Enviamos el color
                    })
                });
            }
            
            setIsModalOpen(false);
            fetchNotes();
            window.dispatchEvent(new CustomEvent('cultivoActualizado'));
            
        } catch (e) {
            console.error(e);
        }
    };

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
                
                /* PUNTITO INDICADOR */
                .rdp-day_hasNote::after {
                    content: '';
                    position: absolute;
                    bottom: 4px; left: 50%; transform: translateX(-50%);
                    width: 5px; height: 5px;
                    background-color: #ff9800;
                    border-radius: 50%;
                }
                `}</style>

                <DayPicker
                    mode="single"
                    selected={selected}
                    onDayClick={handleDayClick}
                    locale={es}
                    modifiers={{ hasNote: daysWithNotes }}
                    modifiersClassNames={{ hasNote: 'rdp-day_hasNote' }}
                    className="text-sm"
                />
            </div>

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