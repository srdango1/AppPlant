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


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}
@app.get("/cultivos")
def get_cultivos_api():
    result = get_cultivos_internal()
    if isinstance(result, str): raise HTTPException(status_code=500, detail=result)
    return result
@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate):
    result = create_cultivo_internal(nombre=cultivo.nombre, ubicacion=cultivo.ubicacion, plantas=cultivo.plantas, deviceId=cultivo.deviceId)
    if isinstance(result, str): raise HTTPException(status_code=500, detail=result)
    return result
@app.get("/list-models")
def list_available_models():
    # ... (código de list-models)
    if not GOOGLE_PROJECT_ID: raise HTTPException(status_code=500, detail="Proyecto de Google no configurado.")
    try:
        models = aiplatform.Model.list()
        genai_models = [{"name": m.name, "display_name": m.display_name} for m in models if "gemini" in m.display_name.lower() or "gemini" in m.name]
        return {"models": genai_models}
    except Exception as e:
        print(f"Error al listar modelos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al listar modelos: {str(e)}")


# 1. Definición de Herramientas
tool_get_cultivos = FunctionDeclaration(
    name="get_cultivos_internal",
    description="Obtener la lista de todos los cultivos actuales del usuario.",
    parameters={"type": "OBJECT", "properties": {}}
)

tool_create_cultivo = FunctionDeclaration(
    name="create_cultivo_internal",
    description="Crear un nuevo cultivo en la base de datos.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "nombre": {"type": "STRING", "description": "El nombre que el usuario le da al cultivo, ej: 'Tomates del balcón'"},
            "ubicacion": {"type": "STRING", "description": "Dónde está el cultivo, ej: 'Interior' o 'Exterior'"},
            "plantas": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Lista de IDs de plantas, ej: ['tomato', 'lettuce']"},
            "deviceId": {"type": "STRING", "description": "Opcional. El ID del dispositivo de hardware a vincular, ej: 'arduino_uno_balcon_82A4'"}
        },
        "required": ["nombre", "ubicacion", "plantas"] # deviceId no es requerido
    }
)


# 2. Inicialización del Modelo
model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction="Eres un asistente de jardinería amigable llamado 'PlantCare'. Ayudas a los usuarios a gestionar sus cultivos. Siempre respondes en español. Cuando crees un cultivo, infiere el 'deviceId' si el usuario lo menciona (ej: 'mi arduino' o un ID específico), de lo contrario no lo incluyas.",
    tools=[Tool(function_declarations=[tool_get_cultivos, tool_create_cultivo])]
)

# 3. Mapeo de Herramientas
available_tools = {
    "get_cultivos_internal": get_cultivos_internal,
    "create_cultivo_internal": create_cultivo_internal,
}



@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    if not GOOGLE_PROJECT_ID or not SERVICE_ACCOUNT_JSON_STRING:
        raise HTTPException(status_code=500, detail="El servicio de Chatbot no está configurado.")
    try:
        
        # Esto evita que la IA recuerde conversaciones anteriores 
        chat = model.start_chat()

        # 1. Envía el mensaje del usuario a Gemini
        response = chat.send_message(chat_message.message)
        
        function_call = response.candidates[0].content.parts[0].function_call
        
        # --- ⚠️ ARREGLO 1: Preparar la respuesta para el frontend ---
        frontend_response = {"reply": ""}
        # --- FIN DEL ARREGLO 1 ---
        
        if not function_call:
            frontend_response["reply"] = response.text
            return frontend_response # 2a. Si no hay herramienta, es una respuesta normal

        # 3. Si la IA pide una herramienta, la ejecutamos
        function_name = function_call.name
        if function_name not in available_tools:
            raise HTTPException(status_code=500, detail=f"Error: Herramienta desconocida '{function_name}'")

        function_to_call = available_tools[function_name]
        args = {key: value for key, value in function_call.args.items()}
        tool_response = function_to_call(**args)

        if function_name == 'create_cultivo_internal':
            frontend_response["action_performed"] = "create"

        # 5. Envía el resultado de la herramienta de vuelta a la IA
        response = chat.send_message(
            Part.from_function_response(
                name=function_name,
                response={"result": str(tool_response)}
            ),
        )

        # 6. La IA genera una respuesta final en lenguaje natural
        frontend_response["reply"] = response.text
        return frontend_response # Devuelve el objeto completo

    except Exception as e:
        print(f"Error en el endpoint /chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el mensaje: {str(e)}")