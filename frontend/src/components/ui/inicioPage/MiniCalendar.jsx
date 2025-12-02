import React, { useState, useEffect } from "react";
import { DayPicker } from 'react-day-picker';
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css';
import { format } from "date-fns";
import NoteModal from "../NoteModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- 1. MAPA DE COLORES ---
// Convierte el color de fondo de la nota (suave) al color del puntito (fuerte)
const getDotColor = (noteColorClass) => {
    if (!noteColorClass) return null;
    if (noteColorClass.includes('red')) return 'bg-red-500';
    if (noteColorClass.includes('blue')) return 'bg-blue-500';
    if (noteColorClass.includes('green')) return 'bg-green-500';
    if (noteColorClass.includes('yellow')) return 'bg-yellow-500';
    if (noteColorClass.includes('purple')) return 'bg-purple-500';
    return 'bg-gray-400'; // Default para notas blancas
};

function MiniCalendar({ onDateSelect, selectedDate }) {
    const [selected, setSelected] = useState(selectedDate || new Date());
    const [notesMap, setNotesMap] = useState({}); // Guardamos fecha -> color
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- 2. CARGAR Y PROCESAR NOTAS ---
    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            if (response.ok) {
                const data = await response.json();
                
                // Creamos un diccionario: { "2025-12-06": "bg-red-500", ... }
                const newMap = {};
                data.forEach(note => {
                    // Si hay varias notas un día, el color de la última sobrescribe (o podrías lógica más compleja)
                    if (note.date) {
                        newMap[note.date] = getDotColor(note.color);
                    }
                });
                setNotesMap(newMap);
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

    useEffect(() => {
        if (selectedDate) setSelected(selectedDate);
    }, [selectedDate]);

    const handleSelect = (date) => {
        if (!date) return;
        setSelected(date);
        if (onDateSelect) {
            onDateSelect(date);
        } else {
            setIsModalOpen(true);
        }
    };

    // --- 3. COMPONENTE PERSONALIZADO PARA EL DÍA ---
    // Esto reemplaza el renderizado por defecto del número del día
    function CustomDayContent(props) {
        const { date } = props;
        const dateStr = format(date, 'yyyy-MM-dd');
        const dotColor = notesMap[dateStr]; // Buscamos si este día tiene color

        return (
            <div className="relative flex items-center justify-center w-8 h-8">
                <span className="z-10">{format(date, 'd')}</span>
                {dotColor && (
                    <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                )}
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-center w-full">
                <style>{`
                .rdp { margin: 0; --rdp-cell-size: 40px; }
                .rdp-day_selected { background-color: #4CAF50 !important; color: white !important; font-weight: bold; }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; border-radius: 8px; }
                .dark .rdp-day { color: #e5e7eb; }
                .dark .rdp-caption_label { color: #4CAF50; }
                .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #374151; }
                `}</style>

                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    locale={es}
                    components={{
                        DayContent: CustomDayContent // ¡Aquí inyectamos nuestro renderizador!
                    }}
                    className="text-sm"
                />
            </div>

            {!onDateSelect && (
                <NoteModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    date={selected} 
                />
            )}
        </>
    )
}
export default MiniCalendar;