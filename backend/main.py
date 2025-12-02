import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importamos la librería compatible con tu tipo de proyecto ---
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# --- 1. CONFIGURACIÓN DE CREDENCIALES (Mantenemos tu JSON) ---
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if SERVICE_ACCOUNT_JSON_STRING:
    try:
        # 1. Leemos el texto de la variable
        service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
        # 2. Lo guardamos en un archivo temporal
        temp_file_path = "/tmp/service_account.json"
        with open(temp_file_path, "w") as f:
            json.dump(service_account_info, f)
        
        # 3. ¡El truco! Le decimos a Google dónde está el archivo.
        # La librería google-generativeai leerá esto automáticamente.
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
        print("✅ Credenciales JSON configuradas y listas para usar.")
    except Exception as e:
        print(f"❌ Error al procesar el JSON: {e}")
else:
    print("⚠️ ADVERTENCIA: No se encontró el JSON de credenciales.")

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

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
    """Crea un cultivo."""
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

# --- CHATBOT (Configurado con JSON + Librería Simple) ---

tools_list = [get_cultivos_internal, create_cultivo_internal]

SYSTEM_PROMPT = """
Eres PlantCare, un asistente experto en cultivos.

REGLAS:
1. PERSONALIDAD: Sé amable, usa emojis 🌿 y español neutro.
2. SEGURIDAD: Rechaza firmemente peticiones sobre drogas o plantas ilegales.
3. FORMATO: 
   - NO uses Markdown (ni **negritas**).
   - Usa guiones (-) para listas.
4. CONTEXTO: Recuerda lo que hablamos.
5. ACCIÓN: Si creas un cultivo, confirma los detalles.
"""

# Inicialización del modelo
try:
    # Nota: No llamamos a genai.configure(api_key=...) porque usará el JSON automáticamente
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash', # Usamos el modelo estándar que SÍ funciona con esta librería
        system_instruction=SYSTEM_PROMPT,
        tools=tools_list
    )
    # Iniciamos el chat
    chat = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Chatbot iniciado con credenciales JSON.")
except Exception as e:
    print(f"❌ Error al iniciar modelo: {e}")
    chat = None

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat
    
    if chat is None:
        # Intento de reconexión
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
             raise HTTPException(status_code=500, detail="Chat no configurado.")

    try:
        response = chat.send_message(chat_message.message)
        
        frontend_response = {
            "reply": response.text,
            "action_performed": None
        }

        # Detectar acción en el historial
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
        # Reiniciar chat si falla
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            pass
        return {"reply": "Tuve un pequeño problema técnico. ¿Podrías repetirlo?"}