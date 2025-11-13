import React, { useState, useEffect } from 'react';
import {
    Routes,
    Route
} from "react-router-dom";
import MisCultivosPage from './pages/MisCultivosPages/MisCultivosPage';
import CultivosDetalle from './pages/MisCultivosPages/CultivosDetalle';
import Header from './components/layout/Header';
// URL base de tu backend Python (Reemplazar con la URL de Render después del despliegue)
const API_BASE_URL = 'http://localhost:8000'; 
function App (){
  return(
   <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark relative flex min-h-screen w-full flex-col">
        <Header/>
        
          <Routes>
            <Route path='/' element={<MisCultivosPage/>}/>
            <Route path='/cultivos/:id' element={<CultivosDetalle/>}/>
          </Routes>
      </div>
  );
}


export default App;
