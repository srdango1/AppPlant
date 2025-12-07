//src/componentes/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

//Import Componentes
import MisCultivosPage from '../../pages/MisCultivosPages/MisCultivosPage';
import Inicio from '../../pages/Inicio';
import WeatherPage from '../../pages/WeatherPage';

/**
 * Componente auxiliar para enlaces de navegación con estilos consistentes.
 * Aplica efectos de hover y colores adaptables al tema (claro/oscuro).
 * * @param {string} href - La ruta de destino.
 * @param {ReactNode} children - El texto o contenido del enlace.
 */
const NavLink = ({ href, children }) => (
  <a className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href={href}>
    {children}
  </a>
);
/**
 * Encabezado Global de la Aplicación.
 * Contiene el logotipo, la navegación principal y los controles de usuario.
 * Se mantiene fijo (sticky) en la parte superior.
 */
function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 dark:border-b-gray-700 bg-background-light dark:bg-background-dark px-10 py-3 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>spa</span>
        <h2 className="text-xl font-bold tracking-[-0.015em] text-gray-800 dark:text-white">PlantCare</h2>
      </div>
      
      {/* 2. Barra de Navegación Principal (Visible en Desktop) */}
      <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
        <Link to="/" element={<Inicio/>} >Inicio</Link>
        <Link to="/cultivos" element={<MisCultivosPage/>}>Mis Cultivos</Link>
        <Link to="#" >Estadísticas</Link>
        <Link to="/clima" element ={<WeatherPage/>} >Clima</Link>
        <Link to="/notas" className="...">Notas</Link>
      </nav>
      
      {/* 3. Botones de Acción de Usuario */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined">person</span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}

export default Header;