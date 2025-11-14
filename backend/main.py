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
    # Usamos la región 'us-east1'
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-east1")
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

# --- 🤖 NUEVO ENDPOINT DE CHATBOT (Versión Vertex AI) 🤖 ---

# 1. Define las "Herramientas" (Sintaxis de Vertex AI)
tool_get_cultivos = FunctionDeclaration(
    name="get_cultivos_internal",
    description="Obtener la lista de todos los cultivos actuales del usuario.",
    parameters={}
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
        },
        "required": ["nombre", "ubicacion", "plantas"]
    }
)

# 2. Inicializa el modelo de IA con las herramientas
# --- ⚠️ AQUÍ ESTÁ EL ARREGLO (USANDO TU CAPTURA) ⚠️ ---
# Usamos el nombre exacto de la lista
model = GenerativeModel(
    "gemini-2.5-flash-preview-09-2025",
    system_instruction="Eres un asistente de jardinería amigable llamado 'PlantCare'. Ayudas a los usuarios a gestionar sus cultivos. Siempre respondes en español.",
    tools=[Tool(function_declarations=[tool_get_cultivos, tool_create_cultivo])]
)
# --- FIN DEL ARREGLO ---

# 3. Mapea los nombres de las herramientas a las funciones de Python
available_tools = {
    "get_cultivos_internal": get_cultivos_internal,
    "create_cultivo_internal": create_cultivo_internal,
}

# 4. Inicia un chat persistente (requerido por Vertex AI)
chat = model.start_chat()

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    """
    Recibe un mensaje, lo procesa con la IA y devuelve una respuesta.
    """
    if not GOOGLE_PROJECT_ID or not SERVICE_ACCOUNT_JSON_STRING:
        raise HTTPException(status_code=500, detail="El servicio de Chatbot no está configurado (faltan GOOGLE_PROJECT_ID o CREDENTIALS).")

    try:
        # 1. Envía el mensaje del usuario a Gemini
        response = chat.send_message(chat_message.message)
        
        # 2. Revisa si la IA quiere usar una herramienta
        function_call = response.candidates[0].content.parts[0].function_call
        
        if not function_call:
            # 2a. Si no hay herramienta, es una respuesta normal
            return {"reply": response.text}

        # 3. Si la IA pide una herramienta, la ejecutamos
        function_name = function_call.name
        
        if function_name not in available_tools:
            raise HTTPException(status_code=500, detail=f"Error: Herramienta desconocida '{function_name}'")

        # 4. Llama a la función de Python correspondiente
        function_to_call = available_tools[function_name]
        args = {key: value for key, value in function_call.args.items()}
        
        tool_response = function_to_call(**args)

        # 5. Envía el resultado de la herramienta de vuelta a la IA
        response = chat.send_message(
            Part.from_function_response(
                name=function_name,
                response={"result": str(tool_response)}
            ),
        )

        # 6. La IA genera una respuesta final en lenguaje natural
        return {"reply": response.text}

    except Exception as e:
        print(f"Error en el endpoint /chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el mensaje: {str(e)}")