
//import React
import React from 'react';
import { Link } from 'react-router-dom';

//Import Componentes
import MisCultivosPage from '../../pages/MisCultivosPages/MisCultivosPage';
import Inicio from '../../pages/Inicio';


const NavLink = ({ href, children }) => (
  <a className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href={href}>
    {children}
  </a>
);

function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 dark:border-b-gray-700 bg-background-light dark:bg-background-dark px-10 py-3 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>spa</span>
        <h2 className="text-xl font-bold tracking-[-0.015em] text-gray-800 dark:text-white">PlantCare</h2>
      </div>
      
      {/* Navegación */}
      <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
        <Link to="/" element={<Inicio/>} >Inicio</Link>
        <Link to="/cultivos" element={<MisCultivosPage/>}>Mis Cultivos</Link>
        <Link to="#" >Estadísticas</Link>
        <Link to="#" >Clima</Link>
        <Link to="/notas" className="...">Notas</Link>
      </nav>
      
      {/* Botones de Acción  para acceder a las notifiaciones,perfil y settings*/}
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