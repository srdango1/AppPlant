import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Google Vertex AI ---
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
        print("Credenciales de Google configuradas exitosamente desde JSON.")
    except Exception as e:
        print(f"ERROR: No se pudo escribir el JSON de credenciales: {e}")
else:
    print("ADVERTENCIA: GOOGLE_APPLICATION_CREDENTIALS_JSON no está configurada. El Chatbot no funcionará.")

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google Vertex AI ---
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")
if GOOGLE_PROJECT_ID:
    # Mantenemos 'us-central1', la región por defecto
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")
else:
    print("ADVERTENCIA: GOOGLE_PROJECT_ID no está configurado. El Chatbot no funcionará.")

# --- Modelos de Datos Pydantic ---
class CultivoCreate(BaseModel):
    nombre: str
    ubicacion: str
    plantas: List[str]
    deviceId: Optional[str] = None

class ChatMessage(BaseModel):
    message: str

# --- Tu aplicación FastAPI ---
app = FastAPI()

# --- Configuración de CORS ---
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

# --- ENDPOINTS DE CULTIVOS (Funciones Internas) ---
def get_cultivos_internal():
    """Obtiene todos los registros de la tabla 'cultivos'."""
    try:
        response = supabase.table('cultivos').select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        return f"Error al obtener cultivos: {str(e)}"

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
    """Crea un nuevo cultivo en la base de datos."""
    try:
        data_to_insert = {
            "name": nombre, "location": ubicacion, "plantas": plantas, "deviceId": deviceId,
            "status": "Iniciando", "statusColor": "text-gray-500", "temp": "N/A",
            "humidity": "N/A", "nutrients": "N/A", "waterLevel": "N/A"
        }
        response = supabase.table('cultivos').insert(data_to_insert).execute()
        return response.data[0] if response.data else "Error al crear el cultivo"
    except Exception as e:
        return f"Error al crear cultivo: {str(e)}"

# --- ENDPOINTS DE API (Públicos) ---

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api():
    result = get_cultivos_internal()
    if isinstance(result, str):
        raise HTTPException(status_code=500, detail=result)
    return result

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate):
    result = create_cultivo_internal(
        nombre=cultivo.nombre,
        ubicacion=cultivo.ubicacion,
        plantas=cultivo.plantas,
        deviceId=cultivo.deviceId
    )
    if isinstance(result, str):
        raise HTTPException(status_code=500, detail=result)
    return result

# --- 🤖 ENDPOINT DE DIAGNÓSTICO 🤖 ---
@app.get("/list-models")
def list_available_models():
    if not GOOGLE_PROJECT_ID:
        raise HTTPException(status_code=500, detail="Proyecto de Google no configurado.")
    try:
        models = aiplatform.Model.list()
        genai_models = [
            {"name": m.name, "display_name": m.display_name} 
            for m in models 
            if "gemini" in m.display_name.lower() or "gemini" in m.name
        ]
        return {"models": genai_models}
    except Exception as e:
        print(f"Error al listar modelos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al listar modelos: {str(e)}")

# --- 🤖 ENDPOINT DE CHATBOT (Con el nombre de modelo ESTABLE) 🤖 ---

tool_get_cultivos = FunctionDeclaration(name="get_cultivos_internal", description="Obtener la lista de todos los cultivos actuales del usuario.", parameters={})
tool_create_cultivo = FunctionDeclaration(name="create_cultivo_internal", description="Crear un nuevo cultivo en la base de datos.", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}}, "required": ["nombre", "ubicacion", "plantas"]})

# --- ⚠️ AQUÍ ESTÁ EL ARREGLO (Usando tu lista de modelos estables) ⚠️ ---
# Usamos "gemini-2.5-flash"
model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction="Eres un asistente de jardinería amigable llamado 'PlantCare'. Ayudas a los usuarios a gestionar sus cultivos. Siempre respondes en español.",
    tools=[Tool(function_declarations=[tool_get_cultivos, tool_create_cultivo])]
)
# --- FIN DEL ARREGLO ---

available_tools = {"get_cultivos_internal": get_cultivos_internal, "create_cultivo_internal": create_cultivo_internal}
chat = model.start_chat()

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    if not GOOGLE_PROJECT_ID or not SERVICE_ACCOUNT_JSON_STRING:
        raise HTTPException(status_code=500, detail="El servicio de Chatbot no está configurado.")
    try:
        response = chat.send_message(chat_message.message)
        function_call = response.candidates[0].content.parts[0].function_call
        if not function_call:
            return {"reply": response.text}
        function_name = function_call.name
        if function_name not in available_tools:
            raise HTTPException(status_code=500, detail=f"Error: Herramienta desconocida '{function_name}'")
        function_to_call = available_tools[function_name]
        args = {key: value for key, value in function_call.args.items()}
        tool_response = function_to_call(**args)
        response = chat.send_message(Part.from_function_response(name=function_name, response={"result": str(tool_response)}))
        return {"reply": response.text}
    except Exception as e:
        print(f"Error en el endpoint /chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el mensaje: {str(e)}")