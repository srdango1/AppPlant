// src / utils/ utilsWeather.js

/**
 * Traduce el código de icono de OpenWeatherMap a un nombre de icono de Google Material Symbols.
 *
 * @param {string} code - el código del clima recibido de la API (ej: "01d")
 * @returns {string} - El nombre de la clase del icono paa Material Symbols (ej: "wb_sunny")
 * Retorno 'partly_cloudy_day' por defecto si el código no existe.
 */
export const getWeatherIcon = (code) => {
    const iconMap = {
        '01d': 'wb_sunny',
        '02d': 'partly_cloudy_day',
        '03d': 'cloud',
        '04d': 'cloud',
        '09d': 'rainy',
        '10d': 'water_drop',
        '11d': 'thunderstorm',
        '13d': 'ac_unit',
        '50d': 'mist',
        '01n': 'bedtime',
        '02n': 'nights_stay',
        '03n': 'cloud',
        '04n': 'cloud',
        '09n': 'rainy',
        '10n': 'water_drop',
        '11n': 'thunderstorm',
        '13n': 'ac_unit',
        '50n': 'mist',
    };
    return iconMap[code] || 'partly_cloudy_day';
};

/**
 * Convierte un timestamp Unix en el nombre del día de la semana en español.
 * @param {number} dateString - Timestamp Unix segundos
 * @returns {string} Nombre del día 
 */
export const getDayName = (dateString) => {
    const date = new Date(dateString * 1000);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

/**
 * Filtra la lista de pronósticos horarios para obtener una predicción apreoximada
 * para el día siguiente y el subsiguiente
 * @param {Array} list - lista de 40 objetos de pronóstico (cada 3 horas)
 * @returns {Array} Array con 2 objetos procesados para mostrar en el UI.
 */
export const getDailyForecast = (list) => {
    if (!list) return [];
    
    /**
     * La API devuelve datos cada 3 hras.
     * Indice 8 aprox = 24 horas despues (8 * 3 = 24)
     * Indice 16 aprox = 48 horas despues
     */
    const tomorrow = list[8]; 
    const dayAfter = list[16];

    if (!tomorrow || !dayAfter) return [];

    return [
        {
            day: "Mañana",
            iconName: getWeatherIcon(tomorrow.weather[0].icon),
            //Calculamos rango simulado para UI
            tempRange: `${Math.round(tomorrow.main.temp)}° / ${Math.round(tomorrow.main.temp - 3)}°`,
            isHighlighted: true
        },
        {
            day: getDayName(dayAfter.dt).charAt(0).toUpperCase() + getDayName(dayAfter.dt).slice(1),
            iconName: getWeatherIcon(dayAfter.weather[0].icon),
            tempRange: `${Math.round(dayAfter.main.temp)}° / ${Math.round(dayAfter.main.temp - 3)}°`,
            isHighlighted: false
        }
    ];
};

/**
 * Recibe los datos crudos de la API y los transforma en un objeto limpio
 * y fácil de consumir por los componentes de React.
 * @param {object} weatherData - datos crudos de OpenWeatherMap.
 * @param {string|null} weatherError - Estado de error actual 
 * @returns {Object|null} Objeto estructurado con city, temp, forecast, details,etc.
 */
export const formatWeatherData = (weatherData, weatherError) => {
    //Validación de integridad de datos
    if (!weatherData || weatherError || !weatherData.list) {
        return null;
    }
    const current = weatherData.list[0];
    const cityData = weatherData.city;

    //Helper interno para formatear la hora (HH:MM)
    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    return {
        city: weatherData.city ? weatherData.city.name : 'N/A',
        temperature: Math.round(weatherData.list[0].main.temp),
        condition: weatherData.list[0].weather[0].description,
        iconName: getWeatherIcon(weatherData.list[0].weather[0].icon),
        humidity: weatherData.list[0].main.humidity,
        wind: weatherData.list[0].wind.speed,
        forecast: getDailyForecast(weatherData.list),

        //Array listo para iterar en el componente "Detalles de hoy"
        todayDetails:[
            {
                label : "Humedad",
                value : `${current.main.humidity}%`,
                icon : "water_drop"
            },
            {
                label : "Prob. de Lluvia",
                value : `${Math.round(current.pop * 100)}%`,
                icon : "rainy"
            },
            {
                label : "Viento",
                value : `${Math.round(current.wind.speed * 3.6)} km/h`,//Conversión m/s a km/h
                icon : "air"
            }
        ],
        // Array listo para iterar en el sidebar "Condiciones actuales"
        currentDetails: [
            { 
                label: "Sensación Térmica", 
                value: `${Math.round(current.main.feels_like)}°C`, 
                iconName: "thermostat" 
            },
            { 
                label: "Presión Atmosférica", 
                value: `${current.main.pressure} hPa`, 
                iconName: "compress" 
            },
            { 
                label: "Amanecer", 
                value: cityData ? formatTime(cityData.sunrise) : "N/A", 
                iconName: "wb_twilight" 
            },
            { 
                label: "Atardecer", 
                value: cityData ? formatTime(cityData.sunset) : "N/A", 
                iconName: "wb_twilight" 
            },
            
        ]
    };
};
/**
 * Determina la imagen de fondo de la tarjeta del clima según la descripción.
 * @param {string} condition - Descripción del clima (ej "nubes dispersas")
 * @returns {string} Ruta absoluta de la imagen en la carpeta public.
 */
export const getWeatherBackgroundImage = (condition) => {
    if (!condition) return '/img/default.jpg'; // Imagen por defecto

    const cond = condition.toLowerCase();
    console.log(`🖼️ Buscando fondo para: "${cond}"`);

    //Búsqueda por pañabras claves en enpañol
    if (cond.includes('lluvia') || cond.includes('llovizna')) return '/img/rainy-day.webp';
    if (cond.includes('nube') || cond.includes('nublado')) return '/img/cloudy.webp';
    if (cond.includes('despejado') || cond.includes('sol')) return '/img/sunny.webp';
    if (cond.includes('tormenta')) return '/img/stormy.webp';
    if (cond.includes('nieve')) return '/img/snowy.webp';
    
    console.warn("⚠️ No hubo coincidencia, usando default.");
    return '/images/weather/default.jpg';
};