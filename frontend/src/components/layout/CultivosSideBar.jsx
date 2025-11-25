import React from 'react';
import SidebarSection from '../common/SideBarSection';
import ActionButton from '../common/ActionButton'; 
import AlertItem from '../ui/AlertItem'; 
import NoteItem from '../ui/NotesItem';  
// --- DATOS EN DURO (MOCKS) ---

const QUICK_ACTIONS = [
    { icon: 'water_drop', label: 'Regar', handler: () => alert('Regando...') },
    { icon: 'science', label: 'Añadir Nutrientes', handler: () => alert('Nutrientes añadidos.') },
    { icon: 'photo_camera', label: 'Tomar Foto', handler: () => alert('Foto tomada.') },
];

const ALERTAS = [
    { 
        message: 'Nivel de humedad bajo', 
        bgColor: 'bg-red-100/50 dark:bg-red-900/20', 
        iconColor: 'text-red-500', 
        textColor: 'text-red-700 dark:text-red-400' 
    }
];

const NOTAS = [
    { text: 'Se observaron hojas amarillas.', date: '24/05/2024' }
];

const TAREAS = [
    { text: 'Próxima cosecha: 15/06', icon: 'calendar_today' }
];


const DetailsSidebar = () => {
    
    return (
        <aside className="w-96 p-8 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50">
            <div className="flex h-full min-h-[700px] flex-col justify-start gap-8">
                
                {/* SECCIÓN 1: ACCIONES RÁPIDAS */}
                <SidebarSection title="Acciones Rápidas">
                    {QUICK_ACTIONS.map((action, index) => (
                        <ActionButton 
                            key={index} 
                            icon={action.icon} 
                            label={action.label} 
                            onClick={action.handler} 
                        />
                    ))}
                </SidebarSection>
                
                {/* SECCIÓN 2: ALERTAS */}
                <SidebarSection title="Alertas">
                    {ALERTAS.map((alert, index) => (
                        <AlertItem 
                            key={index}
                            message={alert.message}
                            bgColor={alert.bgColor}
                            iconColor={alert.iconColor}
                            textColor={alert.textColor}
                        />
                    ))}
                </SidebarSection>

                {/* SECCIÓN 3: NOTAS */}
                <SidebarSection title="Notas">
                    {NOTAS.map((note, index) => (
                        <NoteItem 
                            key={index}
                            text={note.text}
                            date={note.date}
                        />
                    ))}
                </SidebarSection>
                
                {/* SECCIÓN 4: TAREAS (Usamos un ActionButton simple o creamos un TaskItem si la lógica crece) */}
                <SidebarSection title="Tareas">
                    {TAREAS.map((task, index) => (
                        <ActionButton 
                            key={index} 
                            icon={task.icon} 
                            label={task.text} 
                            // Sin handler, ya que es solo informativo
                            onClick={() => console.log('Ver calendario')} 
                        />
                    ))}
                </SidebarSection>

            </div>
        </aside>
    );
};

export default DetailsSidebar;