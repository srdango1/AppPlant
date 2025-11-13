import React from "react";


const LineChart = ({ data, labels, color = '#24e04d', fillOpacity = '0.2' }) => {
    
    // Si no se pasan labels, usamos un array por defecto para evitar errores
    const defaultLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const currentLabels = labels && labels.length > 0 ? labels : defaultLabels;

    const StaticSvg = (
        <svg fill="none" height="148" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
            
            {/* Área Sombreada (usando grad-chart para el fill) */}
            <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill={`url(#grad-chart)`}></path>
            
            {/* Línea del Gráfico (usando el prop 'color') */}
            <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke={color} stroke-linecap="round" stroke-width="3"></path>
            
            {/* Definición del Gradiente para el área sombreada */}
            <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="grad-chart" x1="236" x2="236" y1="1" y2="149">
                    <stop stop-color={color} stop-opacity={fillOpacity}></stop>
                    <stop offset="1" stop-color={color} stop-opacity="0"></stop>
                </linearGradient>
            </defs>
        </svg>
    );

    return (
        <>
            {StaticSvg}
            
            {/* Eje X: Renderizado dinámico de las etiquetas (días) usando la prop 'labels' */}
            <div className="flex justify-around">
                {currentLabels.map((label, index) => (
                    <p 
                        key={index}
                        className="text-[13px] font-bold leading-normal tracking-[0.015em] text-[#64876b] dark:text-gray-400"
                    >
                        {label} {/* ⬅️ Aquí se muestra el día */}
                    </p>
                ))}
            </div>
        </>
    );
};

export default LineChart;