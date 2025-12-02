import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- USA LA LIBRERÍA QUE SÍ TIENES INSTALADA ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- LIMPIEZA DE VARIABLES (Para evitar conflictos) ---
if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
    del os.environ["GOOGLE_APPLICATION_CREDENTIALS"]

# --- Configuración Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración IA ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("❌ ERROR: Falta GEMINI_API_KEY.")
else:
    genai.configure(api_key=gemini_api_key)

# --- Modelos ---
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
    except:
        return []

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
    try:
        data = {
            "name": nombre, "location": ubicacion, "plantas": plantas, "deviceId": deviceId,
            "status": "Iniciando", "statusColor": "text-gray-500", "temp": "N/A",
            "humidity": "N/A", "nutrients": "N/A", "waterLevel": "N/A"
        }
        res = supabase.table('cultivos').insert(data).execute()
        return res.data[0] if res.data else {"error": "Error"}
    except Exception as e:
        return {"error": str(e)}

# --- ENDPOINTS ---
@app.get("/")
def health(): return {"status": "ok"}

@app.get("/cultivos")
def get(): return get_cultivos_internal()

@app.post("/cultivos")
def create(c: CultivoCreate): 
    return create_cultivo_internal(c.nombre, c.ubicacion, c.plantas, c.deviceId)

# --- CHATBOT ---
tools = [get_cultivos_internal, create_cultivo_internal]

SYSTEM_PROMPT = """
Eres PlantCare.
1. SEGURIDAD: NO drogas.
2. FORMATO: Texto plano, listas con guiones (-). NO Markdown.
3. CONTEXTO: Recuerda "el primero", "ese cultivo".
"""

# Inicialización
chat = None
try:
    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT, tools=tools)
    chat = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Chatbot iniciado.")
except Exception as e:
    print(f"❌ Error inicio IA: {e}")

@app.post("/chat")
def handle_chat(msg: ChatMessage):
    global chat
    if not gemini_api_key: raise HTTPException(status_code=500, detail="Falta API Key")
    
    if chat is None:
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            raise HTTPException(status_code=500, detail="Chat no disponible")

    try:
        response = chat.send_message(msg.message)
        frontend_resp = {"reply": response.text, "action_performed": None}
        
        # Detectar acción
        try:
            if len(chat.history) >= 2:
                for part in chat.history[-2].parts:
                    if part.function_call and part.function_call.name == 'create_cultivo_internal':
                        frontend_resp["action_performed"] = "create"
        except: pass

        return frontend_resp
    except:
        # Reinicio forzado
        try: chat = model.start_chat(enable_automatic_function_calling=True)
        except: pass
        return {"reply": "Error de conexión. Intenta de nuevo."}