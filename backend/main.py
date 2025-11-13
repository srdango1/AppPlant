import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# --- Configuración de Supabase ---
# Lee las variables de entorno de Render
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

# Inicializa el cliente de Supabase
supabase: Client = create_client(supabase_url, supabase_key)

# --- Tu aplicación FastAPI ---
app = FastAPI()

# (Tu código de CORS que discutimos)
origins = [
    "https://app-plant-h0kauq1d7-christofer-s-projects-18d2340e.vercel.app/", # Tu frontend
    "http://localhost:5173",          # Tu frontend local
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Ejemplo de cómo usar Supabase ---
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/cultivos")
def get_cultivos():
    # Usa el cliente de supabase para hacer una consulta
    # Asume que tienes una tabla llamada "cultivos"
    try:
        response = supabase.table('cultivos').select("*").execute()
        
        # 'response.data' contiene la lista de tus cultivos
        return {"data": response.data}
    
    except Exception as e:
        return {"error": str(e)}

# El resto de tu código...