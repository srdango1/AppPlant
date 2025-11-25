import React, {useState}from "react";

import {DayPicker} from 'react-day-picker'
import { es } from "date-fns/locale";
import 'react-day-picker/dist/style.css'

function MiniCalendar (){
    const [selected,setSelected] = useState(new Date());

    return(
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <style>{`
            .rdp { margin: 0; }
            .rdp-day_selected { background-color: #24e04d !important; color: white !important; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; }
            .dark .rdp-day { color: #e5e7eb; }
            .dark .rdp-caption_label { color: #24e04d; }
            `}</style>

            <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={es} // Español
            modifiersClassNames={{
            selected: 'my-selected'
            }}
            className="text-sm"
            />
        </div>
    )
}
export default MiniCalendar;