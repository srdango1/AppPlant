import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, HttpUrl # Pydantic se usa para validar los datos de entrada

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Modelo de Datos (Pydantic) ---
# Esto valida los datos que llegan desde el frontend
class CultivoCreate(BaseModel):
    name: str
    location: str
    imageUrl: HttpUrl # Valida que sea una URL

# --- Tu aplicación FastAPI ---
app = FastAPI()

# --- Configuración de CORS ---
origins = [
    "https" ://tu-url-de-vercel.vercel.app", # ⚠️ RECUERDA PONER TU URL DE VERCEL AQUÍ
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
            return [] # Devuelve lista vacía si no hay datos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cultivos")
def create_cultivo(cultivo: CultivoCreate):
    """
    Crea un nuevo cultivo en la base de datos.
    """
    try:
        # Prepara los datos para insertar, añadiendo valores por defecto
        data_to_insert = {
            "name": cultivo.name,
            "location": cultivo.location,
            "imageUrl": str(cultivo.imageUrl), # Convertir HttpUrl a string
            "status": "Iniciando",
            "statusColor": "text-gray-500",
            "temp": "N/A",
            "humidity": "N/A",
            "nutrients": "N/A",
            "waterLevel": "N/A"
        }
        
        # Inserta en la tabla 'cultivos' y pide que devuelva el registro creado
        response = supabase.table('cultivos').insert(data_to_insert).execute()
        
        if response.data:
            # Devuelve el nuevo objeto de cultivo (está en data[0])
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail=response.error.message if response.error else "Error al crear cultivo")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))