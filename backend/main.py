import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- IMPORTACIONES CORRECTAS (Solo la librería simple) ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- LIMPIEZA DE VARIABLES CONFLICTIVAS ---
if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
    del os.environ["GOOGLE_APPLICATION_CREDENTIALS"]

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de la IA ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("❌ ERROR CRÍTICO: No se encontró GEMINI_API_KEY.")
else:
    genai.configure(api_key=gemini_api_key)
    print("✅ API Key configurada.")

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
    try:
        response = supabase.table('cultivos').select("*").execute()
        return response.data if response.data else []
    except Exception as e:
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

# --- ENDPOINTS ---
@app.get("/")
def health_check(): return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api(): return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate): 
    return create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)

# --- CHATBOT ---
tools_list = [get_cultivos_internal, create_cultivo_internal]

SYSTEM_PROMPT = """
Eres PlantCare, un asistente experto en cultivos.
REGLAS:
1. PERSONALIDAD: Amable, usa emojis 🌿.
2. SEGURIDAD: Rechaza temas ilegales.
3. FORMATO: Texto plano, listas con guiones (-).
4. CONTEXTO: Recuerda lo hablado.
5. ACCIÓN: Confirma si creas algo.
"""

# Inicialización
model = None
chat = None

try:
    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT, tools=tools_list)
    chat = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Chatbot iniciado.")
except Exception as e:
    print(f"❌ Error inicio IA: {e}")

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat
    
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="Falta API Key.")
    
    if chat is None:
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            raise HTTPException(status_code=500, detail="Chat no disponible.")

    try:
        response = chat.send_message(chat_message.message)
        
        frontend_response = {"reply": response.text, "action_performed": None}

        # Detectar acción
        try:
            if len(chat.history) >= 2:
                for message in chat.history[-2:]:
                    if hasattr(message, 'parts'):
                        for part in message.parts:
                            if part.function_call and part.function_call.name == 'create_cultivo_internal':
                                frontend_response["action_performed"] = "create"
        except:
            pass

        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        try: chat = model.start_chat(enable_automatic_function_calling=True)
        except: pass
        return {"reply": "Tuve un problema técnico. ¿Podrías repetirlo?"}