import { useState,useEffect } from "react";
import {fetchWeatherData} from '../api/weather';

const useWeather = (city) => {
    const [data,setData] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null);

    useEffect(() => {
        const loadWeather = async () => {
            setLoading(true);
            try {
                // Aquí usamos la función del Paso 1
                const result = await fetchWeatherData(city); 
                setData(result);
                console.log(`✅ Clima recibido para ${city}:`, result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            loadWeather();
        }
    }, [city]);

    return { data, loading, error };
};

export default useWeather;