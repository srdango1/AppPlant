import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional # 1. Importar List y Optional

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- 2. Modelo de Datos Pydantic ACTUALIZADO ---
class CultivoCreate(BaseModel):
    nombre: str
    ubicacion: str
    plantas: List[str] # Ahora es una lista de strings
    deviceId: Optional[str] = None # Es opcional


# --- Tu aplicación FastAPI ---
app = FastAPI()

# --- Configuración de CORS ---
origins = [
    "https://app-plant.vercel.app",
    "https://app-plant-h0kauq1d7-christofer-s-projects-18d2340e.vercel.app",
    "https://appplant.onrender.com",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

# Endpoint raíz para la prueba de salud de Render
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}


@app.get("/cultivos")
def get_cultivos():
    """
    Obtiene todos los registros de la tabla 'cultivos'.
    """
    try:
        response = supabase.table('cultivos').select("*").execute()
        if response.data:
            return response.data
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cultivos")
def create_cultivo(cultivo: CultivoCreate): # 3. Usa el nuevo modelo Pydantic
    """
    Crea un nuevo cultivo en la base de datos CON LOS NUEVOS DATOS.
    """
    try:
        # 4. Diccionario de datos ACTUALIZADO
        data_to_insert = {
            "name": cultivo.nombre,
            "location": cultivo.ubicacion,
            "plantas": cultivo.plantas,
            "deviceId": cultivo.deviceId,
            
            # Valores por defecto para el resto
            "status": "Iniciando",
            "statusColor": "text-gray-500",
            "temp": "N/A",
            "humidity": "N/A",
            "nutrients": "N/A",
            "waterLevel": "N/A"
        }
        
        response = supabase.table('cultivos').insert(data_to_insert).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail=response.error.message if response.error else "Error al crear cultivo")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))