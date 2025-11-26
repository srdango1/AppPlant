import React from "react";

import StatsCard from "../components/ui/inicioPage/StatsCard"
import WeatherWidget from "../components/ui/inicioPage/WeatherWidget";
import CultivationCard from "../components/ui/inicioPage/CultivationCard";
import Sidebar from "../components/layout/InicioSideBar";

import useWeather from '../hooks/useWeather'

function Inicio (){
    const defaultCity = 'Osorno,cl';
    const {data, loading,error}= useWeather(defaultCity)

    if (loading) return <div>Cargando el dashboard...</div>;
    if (error) return <div>Error al cargar datos: {error}</div>;

    const currentSummary = data.current;
    const hourlyForecast = data.hourly;

    return(
        <div className="relative flex min-h-screen w-full flex-col">
            
            <div className="flex flex-1">
                <main className="w-full lg:w-2/3 xl:w-3/4 p-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <StatsCard title="Humedad promedio" value="65%" />
                        <StatsCard title="Temperatura promedio" value="24°C" />
                        <StatsCard title="Nivel de agua" value="80%" />
                        <StatsCard title="Luz recibida" value="75%" />
                    </div>
                    <WeatherWidget rawData ={hourlyForecast}/>

                    <h3 className="text-xl font-bold mb-4">Mis Camas de Cultivo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Aquí van los componentes <CultivationCard /> por ahora con datos fijos */}
                        <CultivationCard name="Cama de Tomates" status="Saludable" statusColor="bg-primary" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCI9BGKuXk_Qy_f0mtGxRE2-nXFt3P7Tx2Ipr2xoSzMofKF_GetMIc90aRoYNAzslJb25tqn762mbpNXdc_0BUMVyjTpb5HDsA4-BPwGRUXaFTKzMbQx3sN2SaS-Qpn04_cPWYfFVH471Et9ARYTIbsFTok3Ut6SFMY6-VoF7Zg--P3Z5r6sEY6EN5kq_PWvK7tnG1XT8Ilv_ODD-qL3eknPpW-ZziJnvHETO4Ei6gRs33ehY6GGBq-HdTFTzUNQVghndQ7uNmGufN7" />
                        <CultivationCard name="Cama de Lechugas" status="Normal" statusColor="bg-yellow-400" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuASTwh0cNgTSJ87XlU7_I5An2iynqis3znXZFkcSrQwaHfbiI2OZk7kJuYjCNwuo64oezSdQWNVFiH5fQGCQkYewT8FHbKmDqV3cJH5n2BtjqpfDQgavlxYmEN7Q4i5rnBUn25lzS7hCrYeZJgQJuZPaEDNqDuHU0YbnsKCgj4zzCD3DBl5bcZ_X1mhTQPAkBt1gyde4YGQ1NkzgbVLtwo02n_AOa_FBQE54LgxjwmLnPpXifbybaWD1FhTrUbRN1vNeymxdzHcSiCW" />

                    </div>
                </main>
                <Sidebar weatherSummary={currentSummary}/>
            </div>
        </div>
    )
}
export default Inicio;