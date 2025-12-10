// src/utils/imageUtils.js

/**
 * Obtiene la imagen genérica del cultivo basada en su ubicación.
 * * @param {Array} plants - Lista de plantas (se mantiene por compatibilidad, aunque no define la imagen).
 * @param {string} location - Ubicación ('Interior', 'Exterior', 'Balcón', etc.).
 * @returns {string} Ruta absoluta de la imagen en la carpeta public.
 */
export const getCultivationImage = (plants, location) => {
    
    // Rutas a las imágenes en la carpeta public/images/
    const IMG_INTERIOR = '/img/Crops/indoor.png';
    const IMG_EXTERIOR = '/img/Crops/exterior.png';
    const IMG_DEFAULT = '/img/Crops/default.jpg'

    // 1. Validación de seguridad: si no hay ubicación, asumimos exterior por defecto.
    if (!location) {
        return IMG_DEFAULT;
    }

    // 2. Normalización: Convertimos a minúsculas para comparar sin errores.
    const loc = location.toLowerCase();

    // 3. Lógica de selección:
    // Si la ubicación dice "interior" (ej: "Casa Interior", "Sala Interior"), usa la foto de maceta.
    if (loc.includes('interior')) {
        return IMG_INTERIOR;
    }

    // Para cualquier otro caso ("Exterior", "Patio", "Balcón", "Terraza"), usa la foto de cultivo.
    return IMG_EXTERIOR;
};