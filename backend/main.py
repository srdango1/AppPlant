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
os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS_JSON", None)

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google AI ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")

if not gemini_api_key:
    print("❌ ERROR CRÍTICO: No se encontró GEMINI_API_KEY.")
else:
    genai.configure(api_key=gemini_api_key)
    print("✅ API Key configurada exitosamente.")

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

tools_list = [get_cultivos_internal, create_cultivo_internal]

# --- SYSTEM PROMPT ACTUALIZADO (CONSEJOS AGRONÓMICOS) ---
SYSTEM_PROMPT = """
Eres PlantCare, un asistente agrónomo experto, amable y profesional.

REGLAS PRINCIPALES:

1. PERSONALIDAD:
   - Sé amable y cercano. Usa frases como "¡Claro que sí!" o "Entendido".
   - Responde siempre en Español Neutro y cuida la ortografía (signos ¿? ¡!).

2. SEGURIDAD (ESTRICTO):
   - Tienes PROHIBIDO ayudar con plantas ilegales o drogas (cannabis, marihuana, etc.). Rechaza estas peticiones amablemente.

3. FORMATO VISUAL (IMPORTANTE):
   - NO uses Markdown (nada de **negritas**, ni # títulos). Usa solo texto plano.
   - Para listas, usa guiones simples (-) y pon cada elemento en una línea nueva.
   - Ejemplo visual:
     - Tomates (Balcón)
     - Lechugas (Jardín)

4. INTELIGENCIA Y CONTEXTO:
   - Si el usuario pregunta "¿Cómo están mis plantas?" o "¿Qué cuidados necesita mi cultivo?", DEBES llamar a la herramienta 'get_cultivos_internal' para ver qué tiene plantado.
   - Si el usuario dice "el primero", refiérete al primer cultivo de la lista que acabas de ver.

5. CONSEJOS TÉCNICOS (AGUA/LUZ):
   - Cuando tengas la lista de cultivos, usa tu conocimiento de experto para dar consejos específicos para ESAS plantas.
   - Ejemplo: Si ves que tiene 'Tomates', explícale cuánta luz directa necesitan y la frecuencia de riego ideal para tomates. No des consejos genéricos, dales consejos para SU planta.

6. CREACIÓN:
   - Si piden crear un cultivo, confirma los detalles antes de llamar a la herramienta.
"""

# Inicialización del modelo
model = None
chat = None

try:
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash', 
        system_instruction=SYSTEM_PROMPT,
        tools=tools_list
    )
    chat = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Chatbot iniciado con instrucciones mejoradas.")
except Exception as e:
    print(f"❌ Error al iniciar modelo: {e}")

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat 
    
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="Falta API Key.")
    
    if chat is None:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT, tools=tools_list)
            chat = model.start_chat(enable_automatic_function_calling=True)
        except Exception as e:
             raise HTTPException(status_code=500, detail="El chat no está disponible.")

    try:
        response = chat.send_message(chat_message.message)
        
        frontend_response = {
            "reply": response.text,
            "action_performed": None
        }

        # Detección de creación de cultivo para recargar página
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
        try:
            chat = model.start_chat(enable_automatic_function_calling=True)
        except:
            pass
        return {"reply": "Tuve un pequeño problema técnico. ¿Podrías repetirlo?"}