import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Google AI (Versión Simple) ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google AI ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("ADVERTENCIA: GEMINI_API_KEY no está configurada.")
else:
    genai.configure(api_key=gemini_api_key)

# --- Modelos Pydantic ---
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
    try:
        response = supabase.table('cultivos').select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error DB: {e}")
        return []

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
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

# --- CONFIGURACIÓN DEL CHATBOT ---

# Definición de herramientas para la librería google-generativeai
tools_list = [
    get_cultivos_internal,
    create_cultivo_internal
]

# --- SYSTEM PROMPT ---
SYSTEM_PROMPT = """
Eres PlantCare, un asistente agrónomo experto, amable y profesional.

REGLAS PRINCIPALES:
1. PERSONALIDAD:
   - Sé amable y cercano ("¡Claro que sí!", "Me parece genial").
   - Responde siempre en Español Neutro y cuida la ortografía (usa signos ¿? ¡!).

2. SEGURIDAD (ESTRICTO):
   - Tienes PROHIBIDO ayudar con plantas ilegales o drogas (cannabis, marihuana, etc.). Si te preguntan, di amablemente que solo trabajas con cultivos legales.

3. FORMATO VISUAL (MUY IMPORTANTE):
   - NO uses Markdown (nada de **negritas**, ## títulos). Texto plano solamente.
   - Para listas, usa guiones simples (-) y pon cada elemento en una línea nueva.
   - Ejemplo:
     - Tomates (Balcón)
     - Lechugas (Jardín)

4. INTELIGENCIA Y MEMORIA:
   - Si el usuario dice "el primero" o "el de tomates", revisa la última lista que mencionaste para saber a cuál se refiere.
   - Si te piden consejos, usa 'get_cultivos_internal' para ver qué tienen y dar consejos personalizados.
   - Si piden crear un cultivo, intenta inferir nombre y ubicación.
"""

# Inicializamos el modelo con las herramientas
# Usamos 'gemini-1.5-flash', que es el modelo estándar actual para API Keys
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    system_instruction=SYSTEM_PROMPT,
    tools=tools_list
)

# Chat con historial automático
chat = model.start_chat(enable_automatic_function_calling=True)

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    if not gemini_api_key: raise HTTPException(status_code=500, detail="Falta API Key")
    
    try:
        # En esta librería, function calling es automático si se configura al inicio
        response = chat.send_message(chat_message.message)
        
        frontend_response = {
            "reply": response.text,
            "action_performed": None
        }

        # Verificamos si se usó una función inspeccionando el historial reciente
        # (Esto es un truco porque la librería abstrae la llamada)
        if len(chat.history) >= 2:
            last_parts = chat.history[-2].parts
            for part in last_parts:
                if part.function_call and part.function_call.name == 'create_cultivo_internal':
                    frontend_response["action_performed"] = "create"

        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciar chat en caso de error grave
        global chat
        chat = model.start_chat(enable_automatic_function_calling=True)
        return {"reply": "Tuve un pequeño problema. ¿Me lo repites?"}