//src/components/common/Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Estilos base compartidos por todos los botones (Layout, tipografía, transición)
const BASE_CLASSES = "flex items-center justify-center rounded-lg h-11 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-colors";

// Sistema de variantes para mantener consistencia visual en toda la app
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

/**
 * Componente de Botón Universal.
 * Puede comportarse como un <button> HTML estándar o como un <Link> de React Router
 * dependiendo de si se pasa la prop 'to'.
 * * @param {ReactNode} children - Contenido del botón.
 * @param {Function} onClick - Manejador de evento click.
 * @param {string} [variant='primary'] - Estilo visual ('primary', 'secondary', 'danger', 'ghost').
 * @param {string} [className=''] - Clases adicionales opcionales.
 * @param {string} [to] - Si existe, renderiza un Link en lugar de un button.
 * @param {string} [type='button'] - Tipo de botón HTML ('button', 'submit', 'reset').
 */
const Button = ({ children, onClick, variant = 'primary', className = '', to, type = 'button' }) => {
    
    // Composición de clases
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const allClasses = `${BASE_CLASSES} ${variantClasses} ${className}`

    // Renderizado condicional: Si tiene 'to', es un Link de navegación
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
    // Si no, es un botón funcional estándar
    return (
        <button
            type={type} 
            onClick={onClick}
            className={allClasses}
        >
            {children}
        </button>
    );
};

export default Button;