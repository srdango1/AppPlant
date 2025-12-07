// src/hooks/useWeather.js
import { useState,useEffect } from "react";
import {fetchWeatherData} from '../api/weather';

/**
 * Custom Hook para gestionar el ciclo de los datos del clima.
 * Separa la logica de carga, error y almacenamiento de estado del componente visual.
 * @param {*} city - Nombre de la ciudad para la que se cargarán los datos.
 * @returns {object} - Objeto con el estado actual de la petición;
 * - data : Los datos del clima o null si no ha cargado.
 * - loading : Booleano que indica si se está realizando la petición. 
 * - error : Mensaje de error o null si no hubo problemas. 
 */

const useWeather = (city) => {
    const [data,setData] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null);

    useEffect(() => {
        /**
         * Funcióninterna asincrona para ejecutar el fetch.
         * Se define dentro del useEffect apra evitar dependencias externas.
         */
        const loadWeather = async () => {
            setLoading(true);
            try {
                // Llamamos a la función pura de la API.
                const result = await fetchWeatherData(city); 
                setData(result);
                console.log(`✅ Clima recibido para ${city}:`, result);
            } catch (err) {
                setError(err.message);
            } finally {
                //Aseguramos que el estado de carga se desactive siempre.
                setLoading(false);
            }
        };

        if (city) {
            loadWeather();
        }
    }, [city]); // El efecto se re-ejecuta si cambia la ciudad

    return { data, loading, error };
};

export default useWeather;