import React from 'react';
import { Link } from 'react-router-dom';

// 1. Definimos las clases base que todos los botones compartirán
const BASE_CLASSES = "flex items-center justify-center rounded-lg h-11 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-colors";

// 2. Definimos las variantes (propósito y estilo)
const VARIANTS = {
    // Estilo Principal 
    primary: "bg-primary text-white hover:bg-primary/90", 
    // Estilo Secundario 
    secondary: "bg-gray-200 text-text-light hover:bg-gray-300 dark:bg-gray-700 dark:text-text-dark dark:hover:bg-gray-600",
    // Estilo de Peligro 
    danger: "bg-red-600 text-white hover:bg-red-700",
    // Estilo Terciario o Solo texto
    ghost: "bg-transparent text-primary hover:bg-primary/10",
};

// Componente funcional con props desestructuradas
const Button = ({ children, onClick, variant = 'primary', className = '', to }) => {
    
    // Concatenamos las clases base con las clases específicas de la variante seleccionada
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const allClasses = `${BASE_CLASSES} ${variantClasses} ${className}`

    if (to) {
        return(
            <Link
            to = {to}
            className={allClasses}
            onClick={onClick}>
                {children}
            </Link>
        )
    }

    return (
        <button
            type="button" 
            onClick={onClick}
            
            className={allClasses}
        >
            {children}
        </button>
    );
};

export default Button;