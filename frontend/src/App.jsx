import React from 'react';
import { Routes, Route } from "react-router-dom";
import MisCultivosPage from './pages/MisCultivosPages/MisCultivosPage';
// -----------------------------
import CultivosDetalle from './pages/MisCultivosPages/CultivosDetalle';
import Header from './components/layout/Header';
import AddCultivoPage from './pages/AddCultivoPage/AddCultivoPage';
import NotasPage from './pages/NotasPage';
import GeneralStatsPage from './pages/EstadistiPage'
import ChatBot from './components/ui/ChatBot';
import Inicio from './pages/Inicio';
import WeatherPage from './pages/WeatherPage';

function App (){
  return(
   <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark relative flex min-h-screen w-full flex-col">
        <Header/>
        
          <Routes>
            <Route path='/' element={<Inicio/>}/>
            <Route path='/cultivos' element={<MisCultivosPage/>}/>
            <Route path='/cultivos/nuevo' element={<AddCultivoPage/>}/>
            <Route path='/cultivos/:id' element={<CultivosDetalle/>}/>
            <Route path='/notas' element={<NotasPage/>}/>
            <Route path='/clima' element={<WeatherPage/>}/>
            <Route path='/estdisticas' element={<GeneralStatsPage/>}/>
          </Routes>
          
        {/* Añade el ChatBot aquí */}
        {/* Se mostrará en todas las páginas */}
        <ChatBot />
      </div>
  );
}

export default App;