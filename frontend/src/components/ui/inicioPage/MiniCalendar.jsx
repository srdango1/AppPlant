import React, { useState, useEffect } from "react";
import { DayPicker } from 'react-day-picker';
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css';
import { format } from "date-fns";
import NoteModal from "../NoteModal"; // Importamos el modal que acabamos de crear

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MiniCalendar({ onDateSelect, selectedDate }) {
    const [selected, setSelected] = useState(selectedDate || new Date());
    const [noteDates, setNoteDates] = useState([]); // Lista de fechas que tienen notas
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Cargar fechas con notas para poner los puntitos
    const fetchNoteDates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            if (response.ok) {
                const data = await response.json();
                // Guardamos solo las fechas únicas
                const dates = data.map(n => n.date);
                setNoteDates(dates);
            }
        } catch (error) {
            console.error("Error fetching notes for calendar:", error);
        }
    };

    useEffect(() => {
        fetchNoteDates();
        // Escuchar cambios globales para actualizar los puntitos al instante
        window.addEventListener('cultivoActualizado', fetchNoteDates);
        return () => window.removeEventListener('cultivoActualizado', fetchNoteDates);
    }, []);

    // Sincronizar si la prop cambia
    useEffect(() => {
        if (selectedDate) setSelected(selectedDate);
    }, [selectedDate]);

    // 2. Función para pintar los estilos de los días
    const modifiers = {
        hasNote: (date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return noteDates.includes(dateStr);
        }
    };

    const handleSelect = (date) => {
        if (!date) return;
        setSelected(date);
        
        if (onDateSelect) {
            // Si estamos en la página de Notas (nos pasan la función), solo cambiamos la fecha
            onDateSelect(date);
        } else {
            // Si estamos en Inicio (no nos pasan función), abrimos el MODAL
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-center w-full">
                <style>{`
                .rdp { margin: 0; --rdp-cell-size: 35px; }
                .rdp-day_selected { background-color: #4CAF50 !important; color: white !important; font-weight: bold; }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; }
                .dark .rdp-day { color: #e5e7eb; }
                .dark .rdp-caption_label { color: #4CAF50; }
                .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #374151; }
                
                /* ESTILO DEL PUNTITO PARA DÍAS CON NOTAS */
                .rdp-day_hasNote::after {
                    content: '';
                    position: absolute;
                    bottom: 4px; left: 50%; transform: translateX(-50%);
                    width: 4px; height: 4px;
                    background-color: #F59E0B; /* Naranja */
                    border-radius: 50%;
                }
                `}</style>

                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    locale={es}
                    modifiers={modifiers}
                    modifiersClassNames={{ hasNote: 'rdp-day_hasNote' }}
                    className="text-sm"
                />
            </div>

            {/* El Modal solo se abre si NO nos pasaron onDateSelect (es decir, en Inicio) */}
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