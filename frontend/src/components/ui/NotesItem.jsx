import React from 'react';

const NoteItem = ({ text, date }) => {
    return (
        <div className="flex items-start gap-3 px-3 py-2">
            
            {/* Ícono de Nota */}
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 mt-1">
                description
            </span>
            
            <div className="flex flex-col">
                {/* Texto de la Nota */}
                <p className="text-sm font-medium leading-normal text-[#111713] dark:text-gray-300">
                    {text}
                </p>
                {/* Fecha */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {date}
                </p>
            </div>
        </div>
    );
};

export default NoteItem;