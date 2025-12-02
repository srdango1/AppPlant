import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniCalendar from '../components/ui/inicioPage/MiniCalendar';
import Button from '../components/common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Mismos colores que en el modal para mantener consistencia
const COLORS = [
    { id: 'white', class: 'bg-white', border: 'border-gray-200' },
    { id: 'yellow', class: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: 'green', class: 'bg-green-50', border: 'border-green-200' },
    { id: 'blue', class: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'purple', class: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'red', class: 'bg-red-50', border: 'border-red-200' },
];

function NotasPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const urlDate = searchParams.get('date');
    const initialDate = urlDate ? parseISO(urlDate) : new Date();
    
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para nueva nota
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [newNoteColor, setNewNoteColor] = useState(COLORS[0]); // Color por defecto (blanco)
    const [isCreating, setIsCreating] = useState(false);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const displayDate = format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es });

    useEffect(() => {
        fetchNotes();
        setSearchParams({ date: dateStr });
    }, [selectedDate]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/notes?date=${dateStr}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error cargando notas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newNoteTitle || "Sin título",
                    content: newNoteContent,
                    date: dateStr,
                    color: newNoteColor.class // Enviamos el color seleccionado
                })
            });

            if (response.ok) {
                // Resetear formulario
                setNewNoteTitle("");
                setNewNoteContent("");
                setNewNoteColor(COLORS[0]);
                setIsCreating(false);
                fetchNotes();
                // Avisar al resto de la app (ej: para actualizar puntitos del calendario)
                window.dispatchEvent(new CustomEvent('cultivoActualizado'));
            }
        } catch (error) {
            console.error("Error creando nota:", error);
        }
    };

    const handleDeleteNote = async (id) => {
        if(!confirm("¿Borrar nota?")) return;
        try {
            await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
            window.dispatchEvent(new CustomEvent('cultivoActualizado'));
        } catch (error) {
            console.error("Error borrando nota:", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
            
            {/* Panel Izquierdo: Calendario */}
            <aside className="w-full lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Calendario</h2>
                <div className="flex justify-center mb-8">
                    {/* Pasamos onDateSelect para que al hacer clic solo cambie la fecha aquí, sin navegar */}
                    <MiniCalendar 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate} 
                    />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                        📅 Selecciona un día para ver tu bitácora.
                    </p>
                </div>
            </aside>

            {/* Panel Derecho: Lista de Notas */}
            <main className="flex-1 p-6 lg:p-10 bg-gray-50 dark:bg-[#121212] overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{displayDate}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {notes.length} {notes.length === 1 ? 'nota' : 'notas'} registradas
                            </p>
                        </div>
                        <Button onClick={() => setIsCreating(!isCreating)}>
                            {isCreating ? "Cancelar" : "Nueva Nota +"}
                        </Button>
                    </div>

                    {/* Formulario de Creación */}
                    {isCreating && (
                        <div className={`p-6 rounded-xl shadow-sm border mb-8 transition-colors ${newNoteColor.class} ${newNoteColor.border}`}>
                            <form onSubmit={handleCreateNote} className="flex flex-col gap-4">
                                {/* Input Título */}
                                <input 
                                    type="text" 
                                    placeholder="Título (ej: Riego con nutrientes)"
                                    className="w-full p-2 bg-transparent border-b border-black/10 focus:border-primary outline-none text-lg font-bold text-gray-800 placeholder-gray-400"
                                    value={newNoteTitle}
                                    onChange={e => setNewNoteTitle(e.target.value)}
                                    autoFocus
                                />
                                
                                {/* Input Contenido */}
                                <textarea 
                                    placeholder="Escribe los detalles aquí..."
                                    className="w-full p-3 rounded-lg bg-white/50 border border-black/5 focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px] resize-none text-gray-700"
                                    value={newNoteContent}
                                    onChange={e => setNewNoteContent(e.target.value)}
                                />

                                <div className="flex justify-between items-center">
                                    {/* Selector de Color */}
                                    <div className="flex gap-2">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setNewNoteColor(color)}
                                                className={`w-6 h-6 rounded-full border ${color.class} ${color.border} ${newNoteColor.id === color.id ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                                title={color.id}
                                            />
                                        ))}
                                    </div>

                                    <Button type="submit">Guardar Nota</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Lista de Notas */}
                    {loading ? (
                        <p className="text-center text-gray-500">Cargando notas...</p>
                    ) : notes.length > 0 ? (
                        <div className="grid gap-4">
                            {notes.map(note => {
                                // Encontramos el borde correspondiente al color guardado
                                const colorObj = COLORS.find(c => c.class === note.color) || COLORS[0];
                                
                                return (
                                    <div key={note.id} className={`p-5 rounded-xl shadow-sm border flex justify-between group transition-all hover:shadow-md ${note.color || 'bg-white'} ${colorObj.border}`}>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                                                {note.title || "Sin título"}
                                            </h3>
                                            <p className="text-gray-600 whitespace-pre-wrap text-sm">
                                                {note.content}
                                            </p>
                                        </div>
                                        <div className="flex flex-col justify-between items-end ml-4">
                                            <button 
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-full hover:bg-black/5"
                                                title="Borrar nota"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        !isCreating && (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-2">edit_note</span>
                                <p className="text-gray-500 dark:text-gray-400">No hay notas para este día.</p>
                                <p className="text-sm text-gray-400">¡Comienza escribiendo algo!</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}

export default NotasPage;