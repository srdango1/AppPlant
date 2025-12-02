import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

function NoteModal({ isOpen, onClose, date, existingNote, onSave, onDelete }) {
    const [content, setContent] = useState('');
    
    // Cuando se abre o cambia la nota existente, actualizamos el texto
    useEffect(() => {
        if (isOpen) {
            setContent(existingNote ? existingNote.content : '');
        }
    }, [isOpen, existingNote]);

    if (!isOpen) return null;

    // Formato bonito de fecha para el título
    const dateTitle = date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(content);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h3 className="font-bold text-lg capitalize text-gray-800 dark:text-white">{dateTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                        autoFocus
                        className="w-full h-32 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                        placeholder="Escribe una nota para este día (ej: Regar tomates, revisar plagas...)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className="flex gap-2 justify-end">
                        {existingNote && (
                            <button 
                                type="button"
                                onClick={() => { if(confirm("¿Borrar?")) onDelete(existingNote.id); }}
                                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                            >
                                Borrar
                            </button>
                        )}
                        <Button type="submit" className="h-9 text-sm">
                            {existingNote ? "Actualizar" : "Guardar Nota"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoteModal;