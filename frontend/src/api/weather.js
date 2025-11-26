
const API_KEY = import.meta.env.VITE_API_WEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
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
        throw error; // Re-lanzamos el error para que el Hook lo capture
    }
};