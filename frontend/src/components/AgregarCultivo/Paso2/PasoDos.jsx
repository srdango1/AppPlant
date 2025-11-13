import React, { useState } from 'react';
import PlantSelectionCard from './SeleccionCultivo';
import FilterButton from './FiltroCategoria';
import { Link } from 'react-router-dom';

// Datos estáticos
const ALL_PLANTS = [
    { id: 'tomato', emoji: '🍅', name: 'Tomate Cherry', category: 'Frutas' },
    { id: 'lettuce', emoji: '🥬', name: 'Lechuga Romana', category: 'Hortalizas' },
    { id: 'basil', emoji: '🌿', name: 'Albahaca', category: 'Hierbas Aromáticas' },
    { id: 'mint', emoji: '🌱', name: 'Menta', category: 'Hierbas Aromáticas' },
    { id: 'strawberry', emoji: '🍓', name: 'Fresas', category: 'Frutas' },
    { id: 'pepper', emoji: '🫑', name: 'Pimientos', category: 'Hortalizas' },
];

function StepTwoPlantSelection({ onNext, onBack, data, setData }) {
  const [currentFilter, setCurrentFilter] = useState('Todos');

  const handleSelectPlant = (plantId) => {
    const currentSelection = data.plantas || [];
    
    let newSelection;
    if (currentSelection.includes(plantId)) {
      newSelection = currentSelection.filter(id => id !== plantId); // Deseleccionar
    } else {
      newSelection = [...currentSelection, plantId]; // Seleccionar
    }

    setData({
      ...data,
      plantas: newSelection
    });
  };

  const filteredPlants = ALL_PLANTS.filter(plant => 
    currentFilter === 'Todos' || plant.category === currentFilter
  );
  
  const categories = ['Todos', 'Hortalizas', 'Hierbas Aromáticas', 'Frutas'];

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col gap-3 max-w-[480px]">
        <p className="text-4xl font-black tracking-tighter">Selecciona tus Cultivos</p>
        <p className="text-base font-normal text-gray-600 dark:text-gray-300">
          Elige una o más plantas para tu nuevo espacio de cultivo.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          {/* Aquí puedes poner un input de búsqueda si quieres */}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <FilterButton
                key={category}
                name={category}
                isSelected={currentFilter === category}
                onClick={() => setCurrentFilter(category)}
              />
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPlants.map(plant => (
            <PlantSelectionCard
                key={plant.id}
                emoji={plant.emoji}
                name={plant.name}
                isSelected={data.plantas.includes(plant.id)}
                onSelect={() => handleSelectPlant(plant.id)}
            />
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <Link 
            to= "/"
            className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
        >
            Cancelar
        </Link>
        <div className="flex gap-4">
          <button 
            className="px-6 py-3 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onBack}
          >
            Atrás
          </button>
          <button 
            className="px-6 py-3 rounded-lg text-sm font-bold text-white bg-primary hover:bg-secondary-green"
            onClick={onNext}
            disabled={!data.plantas || data.plantas.length === 0}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepTwoPlantSelection;