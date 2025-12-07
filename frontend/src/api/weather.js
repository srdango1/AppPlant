/**
 * Modulo de API utilizado para interactuar con OpenWeatherMap
 * Este realiza la peticiones HTTP Puras.
 */
const API_KEY = import.meta.env.VITE_API_WEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 *Realiza un apeticion asincrona para obtener el pronóstico del clima.
 * @param {string} city - nombre de la ciudad a consultar.
 * @returns {Promise<object>} Promesa que entrega los datos del clima en formato JSON.
 * @throws{Error} - Lanza un error si la respuesta de la API no es exitosa
 */
export const fetchWeatherData = async (city) => {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
        );
        
        if (!response.ok) {
            throw new Error(`Error API: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Fallo en la petición del clima:", error);
        throw error; // Re-lanza el error para que el Hook lo capture
    }
};