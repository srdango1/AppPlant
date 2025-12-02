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

# --- 1. CONFIGURACIÓN DE CREDENCIALES (Aquí usamos tu JSON) ---
# Render lee el texto de la variable y crea el archivo que Google necesita
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if SERVICE_ACCOUNT_JSON_STRING:
    try:
        service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
        temp_file_path = "/tmp/service_account.json"
        with open(temp_file_path, "w") as f:
            json.dump(service_account_info, f)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
        print("✅ Credenciales JSON configuradas correctamente.")
    except Exception as e:
        print(f"❌ Error al procesar el JSON: {e}")
else:
    print("⚠️ ADVERTENCIA: Falta la variable GOOGLE_APPLICATION_CREDENTIALS_JSON")

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google Vertex AI ---
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")
if GOOGLE_PROJECT_ID:
    # Iniciamos Vertex AI en la región central (la más compatible)
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")

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

# --- ENDPOINTS API ---
@app.get("/")
def health_check(): return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api(): return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate): 
    return create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)

# --- CHATBOT (VERTEX AI) ---

tool_get = FunctionDeclaration(name="get_cultivos_internal", description="Ver lista de cultivos", parameters={"type": "OBJECT", "properties": {}})
tool_create = FunctionDeclaration(name="create_cultivo_internal", description="Crear cultivo", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}, "deviceId": {"type": "STRING"}}, "required": ["nombre", "ubicacion", "plantas"]})

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

# Inicialización del modelo con Vertex AI
try:
    model = GenerativeModel(
        "gemini-1.5-flash-001", # Modelo estándar estable
        system_instruction=SYSTEM_PROMPT,
        tools=[Tool(function_declarations=[tool_get, tool_create])]
    )
    chat = model.start_chat()
    print("✅ Chatbot Vertex AI iniciado.")
except Exception as e:
    print(f"❌ Error al iniciar modelo Vertex: {e}")
    chat = None

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat
    
    if not GOOGLE_PROJECT_ID or not SERVICE_ACCOUNT_JSON_STRING:
        raise HTTPException(status_code=500, detail="Faltan credenciales JSON o Project ID.")

    try:
        response = chat.send_message(chat_message.message)
        function_call = response.candidates[0].content.parts[0].function_call
        
        frontend_response = {"reply": "", "action_performed": None}
        
        if function_call:
            fname = function_call.name
            if fname == 'get_cultivos_internal':
                tool_result = get_cultivos_internal()
            elif fname == 'create_cultivo_internal':
                args = {k: v for k, v in function_call.args.items()}
                tool_result = create_cultivo_internal(**args)
                frontend_response["action_performed"] = "create"
            else:
                tool_result = "Herramienta desconocida"

            # Enviar resultado a la IA (convertido a string)
            response = chat.send_message(
                Part.from_function_response(name=fname, response={"result": str(tool_result)})
            )

        frontend_response["reply"] = response.text
        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciar chat si falla
        try:
            chat = model.start_chat()
        except:
            pass
        return {"reply": "Tuve un problema de conexión. ¿Me lo repites?"}