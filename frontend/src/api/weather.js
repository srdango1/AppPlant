const API_RENDER_BASE_URL = 'https://appplant.onrender.com/';
export const conseguirClima = async(city) =>{
    try{
        const response = await fetch(`${API_RENDER_BASE_URL}/weather?city=${city}`);
        if (!response.ok){
            throw new Error('No se encontraron datos del clima en el servidor')
        }
        return await response.json();
    }
    catch(error){
        console.error("Error al llamar al backend de clima",error)
        throw error;
    }

}