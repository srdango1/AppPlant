# main.py
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # ¡Importante para CORS!

app = FastAPI()

# --- Configuración de CORS ---
#
# Lista de orígenes (dominios) que tienen permiso para
# hablar con este backend.
#
# ¡He añadido la URL de tu app en Vercel de tu primera imagen!
allowed_origins = [
    "http://localhost:3000",      # Para tu desarrollo local de React
    "[https://app-plant1.vercel.app](https://app-plant1.vercel.app)" # Tu app en Vercel
    # "[https://tu-otra-url.com](https://tu-otra-url.com)", # Puedes añadir más si es necesario
]

# Aquí es donde le das permiso a Vercel para conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos los encabezados
)
# ----------------------------


@app.get("/")
def read_root():
    """Ruta principal de bienvenida."""
    return {"message": "¡El backend de Python (FastAPI) está funcionando en Render!"}


@app.get("/api/data")
def get_data():
    """
    Un ejemplo de ruta de API que devuelve datos JSON.
    Tu frontend de React llamará a esta URL.
    """
    try:
        # Aquí es donde harías tu lógica:
        # - Llamar a Supabase (Postgres)
        # - Llamar a tu base de datos NoSQL (Sensores)
        # - Llamar a la API del Clima
        # - Llamar a tu modelo de ML
        data = {
            "message": "Hola desde la API de FastAPI!",
            "items": ["Planta 1 (desde FastAPI)", "Planta 2", "Planta 3"]
        }
        return data
    except Exception as e:
        return {"error": str(e)}

# --- Para pruebas locales ---
# Esta parte te permite ejecutar `python main.py` en tu PC
# Render NO usará esto. Usará el "Start Command" que definamos.
if __name__ == "__main__":
    # Render te dará un puerto en la variable 'PORT', si no, usa 8000
    port = int(os.environ.get("PORT", 8000))
    # Uvicorn es el servidor que ejecuta FastAPI
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)