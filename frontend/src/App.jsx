import React from 'react'; // Eliminamos useState y useEffect que no se usan aquí
import {
    Routes,
    Route
} from "react-router-dom";
import MisCultivosPage from './pages/MisCultivosPages/MisCultivosPage';
import CultivosDetalle from './pages/MisCultivosPages/CultivosDetalle';
import Header from './components/layout/Header';
// 1. Importar la nueva página
import AddCultivoPage from './pages/AddCultivoPage/AddCultivoPage';

// La URL del backend ya no se usa en App.jsx, se usa en las páginas
// const API_BASE_URL = 'http://localhost:8000'; 

function App (){
  return(
   <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark relative flex min-h-screen w-full flex-col">
        <Header/>
        
          <Routes>
            <Route path='/' element={<MisCultivosPage/>}/>
            {/* 2. Añadir la nueva ruta */}
            <Route path='/cultivos/nuevo' element={<AddCultivoPage/>}/>
            <Route path='/cultivos/:id' element={<CultivosDetalle/>}/>
          </Routes>
      </div>
  );
}

export default App;