import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importamos la librería simple de Google ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- LIMPIEZA DE SEGURIDAD ---
# Borramos variables antiguas de memoria por si acaso siguen en Render
os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS_JSON", None)

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de la IA ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("❌ ERROR: Falta la GEMINI_API_KEY en Render.")
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
        print(f"Error DB: {e}")
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

# --- CHATBOT IA ---

# Definición de herramientas para la librería simple
tools_list = [get_cultivos_internal, create_cultivo_internal]

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

# Inicialización del modelo (Usamos 1.5 Flash que funciona con API Key)
try:
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=SYSTEM_PROMPT,
        tools=tools_list
    )
    # Iniciamos el chat globalmente para mantener memoria
    chat = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Chatbot iniciado con API Key.")
except Exception as e:
    print(f"❌ Error al iniciar modelo: {e}")
    chat = None

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat 
    
    if not gemini_api_key or chat is None:
        # Intento de reconexión si falló al inicio
        try:
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel(model_name='gemini-1.5-flash', system_instruction=SYSTEM_PROMPT, tools=tools_list)
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            raise HTTPException(status_code=500, detail="Error de configuración IA.")

    try:
        # Enviar mensaje
        response = chat.send_message(chat_message.message)
        
        frontend_response = {
            "reply": response.text,
            "action_performed": None
        }

        # Detectar si se creó un cultivo revisando el historial
        # (La librería ejecuta la función automáticamente, nosotros solo verificamos si ocurrió)
        try:
            if len(chat.history) >= 2:
                # Revisamos los últimos mensajes buscando llamadas a función
                for message in chat.history[-2:]:
                    if hasattr(message, 'parts'):
                        for part in message.parts:
                            if part.function_call and part.function_call.name == 'create_cultivo_internal':
                                frontend_response["action_performed"] = "create"
        except:
            pass # Si falla la verificación del historial, no rompemos el chat

        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciar chat si hay error grave
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            pass
        return {"reply": "Tuve un pequeño problema técnico. ¿Podrías repetirlo?"}