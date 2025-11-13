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


# --- ⚠️ NUEVO ENDPOINT DE DIAGNÓSTICO ⚠️ ---
@app.get("/test-env")
def test_env_vars():
    """
    Imprime las variables de entorno en el log de Render.
    """
    print("--- INICIANDO PRUEBA DE VARIABLES DE ENTORNO ---")
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    print(f"SUPABASE_URL: {url}")
    print(f"SUPABASE_KEY (primeros 5 caracteres): {key[:5] if key else 'None'}")
    
    if not url or not key:
        print("ERROR: Variables de Supabase NO encontradas.")
        raise HTTPException(status_code=500, detail="Variables de entorno de Supabase no configuradas.")
        
    print("--- PRUEBA DE VARIABLES DE ENTORNO FINALIZADA ---")
    return {"message": "Variables de entorno presentes. Revisa los logs de Render."}
# --- FIN DEL ENDPOINT DE DIAGNÓSTICO ---


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