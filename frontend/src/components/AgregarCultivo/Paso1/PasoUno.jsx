import React from 'react';

function PasoUno({ onNext, onCancel, data, setData }) {
  
  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    setData({
      ...data, // Mantiene los datos de otros pasos
      nombre: e.target.value // Actualiza solo el nombre
    });
  };

  // Función para manejar el clic en la ubicación
  const handleLocationClick = (location) => {
    setData({
      ...data,
      ubicacion: location
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[480px]">
      
      <label className="flex flex-col min-w-40 flex-1">
        <p className="text-[#333333] dark:text-gray-200 text-base font-medium leading-normal pb-2">
          Nombre del Cultivo
        </p>
        <input 
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#333333] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-[#E0E0E0] dark:border-gray-600 bg-white dark:bg-background-dark h-14 placeholder:text-[#757575] p-[15px] text-base font-normal leading-normal" 
          placeholder="Ej: Tomates Cherry" 
          value={data.nombre}
          onChange={handleChange}
        />
      </label>
      
      <div className="flex flex-col gap-3">
        <p className="text-[#333333] dark:text-gray-200 text-base font-normal leading-normal">
          ¿Dónde crecerá tu cultivo?
        </p>
        <div className="grid grid-cols-2 gap-4">
          
          <button 
            className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary
              ${data.ubicacion === 'Interior' 
                ? 'border-primary bg-primary/20 text-gray-900 dark:text-white' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            onClick={() => handleLocationClick('Interior')}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Interior</span>
          </button>
          
          <button 
            className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary
              ${data.ubicacion === 'Exterior' 
                ? 'border-primary bg-primary/20 text-gray-900 dark:text-white' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            onClick={() => handleLocationClick('Exterior')}
          >
            <span className="material-symbols-outlined">yard</span>
            <span>Exterior</span>
          </button>
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-4 pt-4">
        <button 
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-sm font-bold leading-normal tracking-[0.015em] bg-transparent text-[#757575] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onCancel} // Usamos el callback del padre
        >
          Cancelar
        </button>
        <button 
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary"
          onClick={onNext}
          disabled={!data.nombre} 
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default PasoUno;