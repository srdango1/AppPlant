//src/components/AgregarCultivo/Paso2/SeleccionCultivo.jsx
import React from 'react';

/**
 * Tarjeta de selección de planta individual.
 * Componente visual interactivo que permite seleccionar un ítem de una grilla.
 * * @param {string} emoji - Emoji representativo de la planta.
 * @param {string} name - Nombre de la planta.
 * @param {boolean} isSelected - Estado visual de selección (borde y check).
 * @param {Function} onSelect - Manejador de clic.
 */
function PlantSelectionCard({ emoji, name, isSelected, onSelect }) {
  
  // Clases base y estados condicionales para interacción y selección
  const baseClasses = "group relative cursor-pointer rounded-xl transition-all duration-300 bg-card-light dark:bg-card-dark shadow-md hover:shadow-xl flex flex-col items-center p-4";
  const selectedClasses = isSelected 
    ? "border-2 border-primary shadow-xl ring-2 ring-primary/50" 
    : "border-2 border-transparent hover:border-primary";
  
  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      
      <div className={`absolute top-3 right-3 z-10 size-6 rounded-full border-2 flex items-center justify-center`}>
        {isSelected ? (
          <span className="material-symbols-outlined text-white text-base bg-primary border-primary">check</span>
        ) : (
          <span className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 group-hover:border-primary"></span>
        )}
      </div>
      
      <div className="w-36 h-36 flex items-center justify-center">
        <span className="text-8xl">{emoji}</span>
      </div>
      
      <div className="text-center">
        <h3 className="font-bold">{name}</h3>
      </div>
    </div>
  );
}

export default PlantSelectionCard;