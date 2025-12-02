import React, { useState, useEffect } from "react";
import { DayPicker } from 'react-day-picker'
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css'
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

function MiniCalendar({ onDateSelect, selectedDate }) {
    const [selected, setSelected] = useState(selectedDate || new Date());
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedDate) setSelected(selectedDate);
    }, [selectedDate]);

    const handleSelect = (date) => {
        if (!date) return;
        setSelected(date);
        
        // Si estamos en la página de notas (nos pasan onDateSelect), solo actualizamos el estado
        if (onDateSelect) {
            onDateSelect(date);
        } else {
            // Si estamos en el Inicio, navegamos a la página de notas
            const dateStr = format(date, 'yyyy-MM-dd');
            navigate(`/notas?date=${dateStr}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-center">
            <style>{`
            .rdp { margin: 0; }
            .rdp-day_selected { background-color: #4CAF50 !important; color: white !important; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; }
            .dark .rdp-day { color: #e5e7eb; }
            .dark .rdp-caption_label { color: #4CAF50; }
            .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #374151; }
            `}</style>

            <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                locale={es}
                modifiersClassNames={{ selected: 'my-selected' }}
                className="text-sm"
            />
        </div>
    )
}
export default MiniCalendar;