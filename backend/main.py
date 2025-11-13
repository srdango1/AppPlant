import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, HttpUrl

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Modelo de Datos (Pydantic) ---
class CultivoCreate(BaseModel):
    name: str
    location: str
    imageUrl: HttpUrl

# --- Tu aplicación FastAPI ---
app = FastAPI()

# Añade las DOS URLs de Vercel (la de preview y la de producción)
origins = [
    "https://app-plant-h0kauq1d7-christofer-s-projects-18d2340e.vercel.app", # Tu URL de "preview"
    "https://appplant.vercel.app",  # Tu URL de producción (la del error)
    "https://appplant.onrender.com", # Tu backend
    "http://localhost:5173",          # Tu frontend local
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
    """
    Responde 200 OK a la prueba de salud de Render.
    """
    return {"status": "ok", "message": "Backend is running!"}
# --- FIN DEL ARREGLO ---

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
        data_to_insert = {
            "name": cultivo.name,
            "location": cultivo.location,
            "imageUrl": str(cultivo.imageUrl),
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
        