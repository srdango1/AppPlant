import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Google AI (Librería Simple) ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google AI ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("ADVERTENCIA: GEMINI_API_KEY no está configurada. El chat no funcionará.")
else:
    genai.configure(api_key=gemini_api_key)

# --- Modelos de Datos ---
class CultivoCreate(BaseModel):
    nombre: str
    ubicacion: str
    plantas: List[str]
    deviceId: Optional[str] = None

class ChatMessage(BaseModel):
    message: str

app = FastAPI()

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

# --- HERRAMIENTAS ---
def get_cultivos_internal():
    """Obtiene la lista de cultivos."""
    try:
        response = supabase.table('cultivos').select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        return []

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
    """Crea un cultivo en la base de datos."""
    try:
        data_to_insert = {
            "name": nombre, "location": ubicacion, "plantas": plantas, "deviceId": deviceId,
            "status": "Iniciando", "statusColor": "text-gray-500", "temp": "N/A",
            "humidity": "N/A", "nutrients": "N/A", "waterLevel": "N/A"
        }
        response = supabase.table('cultivos').insert(data_to_insert).execute()
        return response.data[0] if response.data else {"error": "No se pudo crear"}
    except Exception as e:
        return {"error": str(e)}

# --- ENDPOINTS API ---
@app.get("/")
def health_check(): return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api(): return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate): 
    return create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)

# --- CHATBOT ---

# Lista de herramientas (funciones reales)
tools_list = [get_cultivos_internal, create_cultivo_internal]

SYSTEM_PROMPT = """
Eres PlantCare, un asistente agrónomo amable.

REGLAS:
1. PERSONALIDAD: Sé cercano y usa español neutro.
2. SEGURIDAD: Rechaza temas ilegales.
3. FORMATO: Usa texto plano y listas con guiones (-). NO Markdown.
4. CONTEXTO: Recuerda lo que hablamos ("el primero", "ese cultivo").
5. ACCIÓN: Si creas un cultivo, confirma los detalles.
"""

# Inicialización del modelo (Usamos 1.5 Flash que es el estándar para API Keys)
try:
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=SYSTEM_PROMPT,
        tools=tools_list
    )
    # Chat con historial automático habilitado
    chat = model.start_chat(enable_automatic_function_calling=True)
except Exception as e:
    print(f"Error al iniciar modelo: {e}")
    chat = None

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat # Usamos la variable global
    
    if not gemini_api_key or chat is None:
        raise HTTPException(status_code=500, detail="Chat no configurado.")

    try:
        # En esta librería, la "magia" de llamar herramientas es automática
        response = chat.send_message(chat_message.message)
        
        frontend_response = {
            "reply": response.text,
            "action_performed": None
        }

        # Detectamos si se creó un cultivo revisando el historial reciente
        # (Si la IA decidió llamar a create_cultivo_internal, estará en el historial)
        for content in chat.history:
            for part in content.parts:
                if part.function_call and part.function_call.name == 'create_cultivo_internal':
                    frontend_response["action_performed"] = "create"

        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciar chat en caso de error
        chat = model.start_chat(enable_automatic_function_calling=True)
        return {"reply": "Tuve un pequeño problema. ¿Podrías repetirlo?"}