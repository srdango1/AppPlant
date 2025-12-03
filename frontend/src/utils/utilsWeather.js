
// 1. Mover getWeatherIcon al principio 
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

// 2. Función auxiliar de fecha
export const getDayName = (dateString) => {
    const date = new Date(dateString * 1000);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

// 3. Procesar el pronóstico de 2 días
export const getDailyForecast = (list) => {
    if (!list) return [];
    
    // Índices aproximados para +24h y +48h (API devuelve cada 3h)
    const tomorrow = list[8]; 
    const dayAfter = list[16];

    if (!tomorrow || !dayAfter) return [];

    return [
        {
            day: "Mañana",
            iconName: getWeatherIcon(tomorrow.weather[0].icon),
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

// 4. Función maestra para formatear todo
export const formatWeatherData = (weatherData, weatherError) => {
    if (!weatherData || weatherError || !weatherData.list) {
        return null;
    }
    const current = weatherData.list[0];
    const cityData = weatherData.city;

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
                value : `${Math.round(current.wind.speed * 3.6)} km/h`,
                icon : "air"
            }
        ],
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

export const getWeatherBackgroundImage = (condition) => {
    if (!condition) return '/img/default.jpg'; // Imagen por defecto

    const cond = condition.toLowerCase();
    console.log(`🖼️ Buscando fondo para: "${cond}"`);
    if (cond.includes('lluvia') || cond.includes('llovizna')) return '/img/rainy-day.webp';
    if (cond.includes('nube') || cond.includes('nublado')) return '/img/cloudy.webp';
    if (cond.includes('despejado') || cond.includes('sol')) return '/img/sunny.webp';
    if (cond.includes('tormenta')) return '/img/stormy.webp';
    if (cond.includes('nieve')) return '/img/snowy.webp';
    
    console.warn("⚠️ No hubo coincidencia, usando default.");
    return '/images/weather/default.jpg';
};