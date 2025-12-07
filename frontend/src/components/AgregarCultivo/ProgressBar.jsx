//src/components/AgregarCultivo/ProgressBar.jsx
import React from 'react';

/**
 * Barra de Progreso Visual para el Wizard.
 * Indica al usuario en qué etapa del proceso se encuentra.
 * * @param {number} currentStep - El número del paso actual (1-based).
 * @param {number} totalSteps - El número total de pasos (por defecto 4).
 */
function ProgressBar({ currentStep, totalSteps = 4 }) {
  // Cálculo del porcentaje de completitud
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <p className="text-[#333333] dark:text-gray-300 text-sm font-normal leading-normal">
          Paso {currentStep} de {totalSteps}
        </p>
      </div>
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-2">
        <div 
          className="h-2 rounded-full bg-primary transition-all duration-300 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;