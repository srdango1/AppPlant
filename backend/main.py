import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Vertex AI ---
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part, FunctionDeclaration
import vertexai.generative_models as generative_models
from google.cloud import aiplatform

# --- Configuración de Credenciales y Región Automática ---
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
GOOGLE_PROJECT_ID = None

# Lista de regiones probables para proyectos de AI Studio
REGIONS_TO_TRY = ["us-central1", "us-east1", "us-west1", "us-east4", "northamerica-northeast1"]
ACTIVE_REGION = "us-central1" # Default

if SERVICE_ACCOUNT_JSON_STRING:
    try:
        # 1. Configurar archivo de credenciales
        service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
        temp_file_path = "/tmp/service_account.json"
        with open(temp_file_path, "w") as f:
            json.dump(service_account_info, f)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
        
        # 2. Obtener Project ID
        GOOGLE_PROJECT_ID = service_account_info.get("project_id")
        
        # 3. Inicializar Vertex AI (probaremos regiones al vuelo si falla)
        vertexai.init(project=GOOGLE_PROJECT_ID, location=ACTIVE_REGION)
        aiplatform.init(project=GOOGLE_PROJECT_ID, location=ACTIVE_REGION)
        print(f"✅ Credenciales JSON cargadas. Proyecto: {GOOGLE_PROJECT_ID}")
        
    except Exception as e:
        print(f"❌ Error crítico con el JSON: {e}")
else:
    print("⚠️ Faltan credenciales JSON.")

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
        # ¡IMPORTANTE! Devuelve siempre una LISTA para que el frontend no falle
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

# --- CHATBOT VERTEX AI ---

tool_get = FunctionDeclaration(name="get_cultivos_internal", description="Ver lista de cultivos", parameters={"type": "OBJECT", "properties": {}})
tool_create = FunctionDeclaration(name="create_cultivo_internal", description="Crear cultivo", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}, "deviceId": {"type": "STRING"}}, "required": ["nombre", "ubicacion", "plantas"]})

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

def get_model():
    # Usamos el modelo que estaba en tu código
    return GenerativeModel(
        "gemini-2.5-flash-preview-09-2025", 
        system_instruction=SYSTEM_PROMPT,
        tools=[Tool(function_declarations=[tool_get, tool_create])]
    )

# Variable global para el chat
chat_session = None

# Intentamos inicializar el chat probando regiones si es necesario
try:
    chat_session = get_model().start_chat()
    print(f"✅ Chatbot iniciado en {ACTIVE_REGION}")
except Exception as e:
    print(f"⚠️ Aviso: Error al iniciar chat en {ACTIVE_REGION}: {e}")

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat_session
    global ACTIVE_REGION

    if not GOOGLE_PROJECT_ID: raise HTTPException(status_code=500, detail="Falta JSON.")

    # Lógica de Reintento de Región (Auto-fix)
    if chat_session is None:
        for region in REGIONS_TO_TRY:
            try:
                print(f"🔄 Intentando conectar a Vertex AI en: {region}...")
                vertexai.init(project=GOOGLE_PROJECT_ID, location=region)
                chat_session = get_model().start_chat()
                ACTIVE_REGION = region
                print(f"✅ ¡Conexión exitosa en {region}!")
                break
            except Exception as e:
                print(f"❌ Falló en {region}")
    
    if chat_session is None:
        raise HTTPException(status_code=500, detail="No se encontró una región válida para el modelo.")

    try:
        response = chat_session.send_message(chat_message.message)
        
        frontend_response = {"reply": "", "action_performed": None}
        
        # Procesar llamadas a funciones (Vertex style)
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    fname = part.function_call.name
                    args = {k: v for k, v in part.function_call.args.items()}
                    
                    if fname == 'get_cultivos_internal':
                        # Convertimos a string para la IA, pero la funcion original sigue siendo lista
                        tool_result = str(get_cultivos_internal())
                    elif fname == 'create_cultivo_internal':
                        tool_result = str(create_cultivo_internal(**args))
                        frontend_response["action_performed"] = "create"
                    else:
                        tool_result = "Error: Función desconocida"

                    # Enviar respuesta de la herramienta a la IA
                    response = chat_session.send_message(
                        Part.from_function_response(name=fname, response={"result": tool_result})
                    )
                    # Salir del bucle de partes
                    break

        frontend_response["reply"] = response.text
        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Reiniciar sesión si falla
        try: chat_session = get_model().start_chat()
        except: pass
        return {"reply": "Tuve un problema técnico. ¿Me lo repites?"}