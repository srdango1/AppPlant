//src/componentes/layout/Header.jsx
import React,{useState} from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const linkClasses = "text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2 md:py-0";
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 dark:border-b-gray-700 bg-background-light dark:bg-background-dark px-10 py-3 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>spa</span>
        <h2 className="text-xl font-bold tracking-[-0.015em] text-gray-800 dark:text-white">PlantCare</h2>
      </div>
      
      <button 
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-3xl">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

      {/* 2. Barra de Navegación Principal (Visible en Desktop) */}
      <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkClasses}>Inicio</Link>
          <Link to="/cultivos" className={linkClasses}>Mis Cultivos</Link>
          <Link to="/estadisticas" className={linkClasses}>Estadísticas</Link>
          <Link to="/clima" className={linkClasses}>Clima</Link>
          <Link to="/notas" className={linkClasses}>Notas</Link>
        </nav>
      
      {/* 3. Botones de Acción de Usuario */}
      <div className="hidden md:flex items-center gap-4">
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

    {isMenuOpen && (
        <nav className="md:hidden flex flex-col px-6 pb-4 border-t border-gray-100 dark:border-gray-700 bg-background-light dark:bg-background-dark animate-fade-in-down">
          <Link to="/" className={linkClasses} onClick={closeMenu}>Inicio</Link>
          <Link to="/cultivos" className={linkClasses} onClick={closeMenu}>Mis Cultivos</Link>
          <Link to="/estadisticas" className={linkClasses} onClick={closeMenu}>Estadísticas</Link>
          <Link to="/clima" className={linkClasses} onClick={closeMenu}>Clima</Link>
          <Link to="/notas" className={linkClasses} onClick={closeMenu}>Notas</Link>
          
          {/* Opciones extra para móvil (Perfil, Ajustes) */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex gap-4">
             <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 py-2">
                <span className="material-symbols-outlined">person</span> Perfil
             </button>
             <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 py-2">
                <span className="material-symbols-outlined">settings</span> Ajustes
             </button>
          </div>
        </nav>
      )}
      

      
    </header>
  );
}

export default Header;