import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniCalendar from '../components/ui/inicioPage/MiniCalendar';
import Button from '../components/common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function NotasPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlDate = searchParams.get('date');
    const initialDate = urlDate ? parseISO(urlDate) : new Date();
    
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [notes, setNotes] = useState([]);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const displayDate = format(selectedDate, "d 'de' MMMM, yyyy", { locale: es });

    useEffect(() => {
        fetchNotes();
        setSearchParams({ date: dateStr });
    }, [selectedDate]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes?date=${dateStr}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) return;

        try {
            await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newNoteTitle, content: newNoteContent, date: dateStr })
            });
            setNewNoteTitle(""); setNewNoteContent(""); setIsCreating(false); fetchNotes();
        } catch (error) { console.error(error); }
    };

    const handleDeleteNote = async (id) => {
        if(!confirm("¿Borrar nota?")) return;
        await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
        fetchNotes();
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
            {/* Calendario a la izquierda */}
            <aside className="w-full lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Calendario</h2>
                <div className="flex justify-center mb-6">
                    <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>
            </aside>

            {/* Notas a la derecha */}
            <main className="flex-1 p-6 lg:p-10 bg-gray-50 dark:bg-[#121212] overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notas del Día</h1>
                            <p className="text-gray-500 capitalize mt-1">{displayDate}</p>
                        </div>
                        <Button onClick={() => setIsCreating(!isCreating)}>
                            {isCreating ? "Cerrar" : "Nueva Nota +"}
                        </Button>
                    </div>

                    {isCreating && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
                            <form onSubmit={handleCreateNote} className="flex flex-col gap-4">
                                <input type="text" placeholder="Título" className="w-full p-3 rounded-lg border" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} autoFocus />
                                <textarea placeholder="Detalles..." className="w-full p-3 rounded-lg border h-24" value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} />
                                <div className="flex justify-end"><Button type="submit">Guardar</Button></div>
                            </form>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {notes.length > 0 ? notes.map(note => (
                            <div key={note.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border flex justify-between">
                                <div><h3 className="font-bold text-lg">{note.title}</h3><p className="text-gray-600 whitespace-pre-wrap">{note.content}</p></div>
                                <button onClick={() => handleDeleteNote(note.id)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                        )) : <p className="text-center text-gray-500">No hay notas.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NotasPage;