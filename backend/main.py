from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Aquí creas tu app
app = FastAPI()

# --- AÑADE ESTO ---

# Lista de orígenes permitidos
# DEBES añadir la URL de tu Vercel aquí cuando la tengas
origins = [
    "https://app-plant-h0kauq1d7-christofer-s-projects-18d2340e.vercel.app/", # Tu URL de Vercel (frontend)
    "http://localhost:5173",          # Tu localhost de desarrollo (frontend)
    "http://localhost:8000",          # Tu localhost de desarrollo (backend)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)

# --- FIN DE LO QUE HAY QUE AÑADIR ---


# El resto de tu código...
@app.get("/")
def read_root():
    return {"Hello": "World"}