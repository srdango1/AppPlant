import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part, FunctionDeclaration
import vertexai.generative_models as generative_models
from google.cloud import aiplatform

# --- Configuración de Credenciales ---
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if SERVICE_ACCOUNT_JSON_STRING:
    try:
        service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
        temp_file_path = "/tmp/service_account.json"
        with open(temp_file_path, "w") as f:
            json.dump(service_account_info, f)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
    except Exception as e:
        print(f"ERROR JSON: {e}")

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google Vertex AI ---
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")
if GOOGLE_PROJECT_ID:
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")

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
    """Obtiene todos los registros de la tabla 'cultivos'."""
    try:
        response = supabase.table('cultivos').select("*").execute()
        # Devuelve la lista real para que el frontend no falle
        return response.data if response.data else []
    except Exception as e:
        print(f"Error DB: {e}")
        return []

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
    """Crea un nuevo cultivo."""
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
def get_cultivos_api(): 
    return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate): 
    return create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)

# --- CONFIGURACIÓN DE LA IA ---

tool_get = FunctionDeclaration(name="get_cultivos_internal", description="Ver lista de cultivos del usuario", parameters={"type": "OBJECT", "properties": {}})
tool_create = FunctionDeclaration(name="create_cultivo_internal", description="Crear cultivo", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}, "deviceId": {"type": "STRING"}}, "required": ["nombre", "ubicacion", "plantas"]})

# --- TU SYSTEM PROMPT MEJORADO ---
SYSTEM_PROMPT = """
Eres PlantCare, un asistente agrónomo experto, amable y profesional.

REGLAS PRINCIPALES:
1. PERSONALIDAD:
   - Sé amable y cercano.
   - Responde siempre en Español Neutro y cuida la ortografía (usa signos ¿? ¡!).

2. SEGURIDAD (ESTRICTO):
   - Tienes PROHIBIDO ayudar con plantas ilegales o drogas. Si te preguntan, di amablemente que solo trabajas con cultivos legales.

3. FORMATO VISUAL (MUY IMPORTANTE):
   - NO uses Markdown (nada de **negritas**, ## títulos).
   - Para listas, usa guiones simples (-) y pon cada elemento en una línea nueva.
   - Ejemplo de formato deseado:
     - Nombre: Tomates (Ubicación: Balcón)
     - Plantas: tomate
     - Estado: Iniciando

4. INTELIGENCIA Y MEMORIA:
   - Si el usuario dice "el primero", refiere a la última lista mostrada.
   - Antes de aconsejar, usa 'get_cultivos_internal' para saber qué tiene el usuario.
"""

model = GenerativeModel(
    "gemini-2.5-flash-preview-09-2025", 
    system_instruction=SYSTEM_PROMPT,
    tools=[Tool(function_declarations=[tool_get, tool_create])]
)

available_tools = {"get_cultivos_internal": get_cultivos_internal, "create_cultivo_internal": create_cultivo_internal}

# Chat Global
chat = model.start_chat()

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    # --- CORRECCIÓN AQUÍ: Declaramos global al principio ---
    global chat 
    # -------------------------------------------------------

    if not GOOGLE_PROJECT_ID: raise HTTPException(status_code=500, detail="Error configuración")
    try:
        response = chat.send_message(chat_message.message)
        function_call = response.candidates[0].content.parts[0].function_call
        
        frontend_response = {"reply": ""}
        
        if function_call:
            fname = function_call.name
            if fname in available_tools:
                args = {k: v for k, v in function_call.args.items()}
                tool_result = available_tools[fname](**args)
                
                if fname == 'create_cultivo_internal':
                    frontend_response["action_performed"] = "create"
                
                # Convertir a string SOLO para la IA
                response = chat.send_message(
                    Part.from_function_response(name=fname, response={"result": str(tool_result)})
                )

        frontend_response["reply"] = response.text
        return frontend_response
    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciamos el chat si hay error
        chat = model.start_chat()
        return {"reply": "Tuve un pequeño problema de conexión. ¿Me lo repites?"}