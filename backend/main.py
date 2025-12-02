import os
import json
import sys # Para detener el programa si hay error grave
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part, FunctionDeclaration
import vertexai.generative_models as generative_models
from google.cloud import aiplatform

# ==========================================
# 1. CONFIGURACIÓN CRÍTICA DE GOOGLE CLOUD
# ==========================================

# A. Validar Project ID
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")
if not GOOGLE_PROJECT_ID:
    print("❌ ERROR CRÍTICO: La variable GOOGLE_PROJECT_ID está vacía.")
    sys.exit(1) # Detiene el servidor para que veas el error

# B. Validar y Configurar Credenciales JSON
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if not SERVICE_ACCOUNT_JSON_STRING:
    print("❌ ERROR CRÍTICO: La variable GOOGLE_APPLICATION_CREDENTIALS_JSON está vacía.")
    sys.exit(1)

try:
    # Intentamos leer el JSON. Si pegaste mal el texto, esto fallará aquí y te avisará.
    service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
    
    # Creamos el archivo temporal
    temp_file_path = "/tmp/service_account.json"
    with open(temp_file_path, "w") as f:
        json.dump(service_account_info, f)
    
    # Le decimos a Google dónde está el archivo
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
    print("✅ Credenciales de Google configuradas correctamente.")

except json.JSONDecodeError as e:
    print(f"❌ ERROR CRÍTICO: El JSON de credenciales no es válido. Revisa que copiaste TODO el texto comenzando por {{ y terminando por }}.")
    print(f"Detalle del error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERROR CRÍTICO al procesar credenciales: {e}")
    sys.exit(1)

# C. Iniciar Vertex AI
try:
    # Usamos us-central1 (o us-east1 si tu proyecto está ahí, pero central es más seguro)
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    print(f"✅ Vertex AI inicializado para el proyecto: {GOOGLE_PROJECT_ID}")
except Exception as e:
    print(f"❌ ERROR CRÍTICO al iniciar Vertex AI: {e}")
    sys.exit(1)

# ==========================================
# 2. CONFIGURACIÓN DE SUPABASE
# ==========================================
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# ==========================================
# 3. MODELOS Y API
# ==========================================

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

# --- ENDPOINTS ---
@app.get("/")
def health_check(): return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api(): return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate): 
    return create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)

# --- IA ---
tool_get = FunctionDeclaration(name="get_cultivos_internal", description="Ver lista de cultivos", parameters={"type": "OBJECT", "properties": {}})
tool_create = FunctionDeclaration(name="create_cultivo_internal", description="Crear cultivo", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}, "deviceId": {"type": "STRING"}}, "required": ["nombre", "ubicacion", "plantas"]})

SYSTEM_PROMPT = """
Eres PlantCare.
1. PERSONALIDAD: Amable y cercano. Español Neutro.
2. SEGURIDAD: NO drogas/ilegal.
3. FORMATO: Texto plano (NO Markdown). Listas con guiones (-).
4. MEMORIA: Recuerda el contexto ("el primero").
"""

# Usamos el modelo ESTABLE. Si esto falla, es 100% configuración de cuenta.
try:
    model = GenerativeModel(
        "gemini-1.5-flash-001", 
        system_instruction=SYSTEM_PROMPT,
        tools=[Tool(function_declarations=[tool_get, tool_create])]
    )
    # Iniciamos el chat globalmente
    chat = model.start_chat()
    print("✅ Modelo de IA cargado correctamente.")
except Exception as e:
    print(f"❌ ERROR al cargar el modelo: {e}")
    # No detenemos el servidor aquí para que al menos la página web cargue,
    # pero el chat fallará si esto pasa.

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat # Declaramos global al inicio
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
                
                response = chat.send_message(
                    Part.from_function_response(name=fname, response={"result": str(tool_result)})
                )

        frontend_response["reply"] = response.text
        return frontend_response
    except Exception as e:
        print(f"Error chat: {e}")
        # Intentamos revivir el chat
        try:
            chat = model.start_chat()
        except:
            pass
        return {"reply": "Tuve un problema técnico con mis credenciales. Por favor revisa los logs del servidor."}

available_tools = {"get_cultivos_internal": get_cultivos_internal, "create_cultivo_internal": create_cultivo_internal}