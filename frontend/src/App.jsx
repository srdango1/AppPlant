import React from 'react';
import { Routes, Route } from "react-router-dom";
import MisCultivosPage from './pages/MisCultivosPages/MisCultivoPage';
import CultivosDetalle from './pages/MisCultivosPages/CultivosDetalle';
import Header from './components/layout/Header';
import AddCultivoPage from './pages/AddCultivoPage/AddCultivoPage';

// 1. Importa el nuevo componente de ChatBot
import ChatBot from './components/ui/ChatBot';

function App (){
  return(
   <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark relative flex min-h-screen w-full flex-col">
        <Header/>
        
          <Routes>
            <Route path='/' element={<MisCultivosPage/>}/>
            <Route path='/cultivos/nuevo' element={<AddCultivoPage/>}/>
            <Route path='/cultivos/:id' element={<CultivosDetalle/>}/>
          </Routes>
          
        {/* 2. Añade el ChatBot aquí */}
        {/* Se mostrará en todas las páginas */}
        <ChatBot />
      </div>
  );
}

export default App;