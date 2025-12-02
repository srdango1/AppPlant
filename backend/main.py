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
from google.cloud import aiplatform

# --- 1. CONFIGURACIÓN DE CREDENCIALES (JSON) ---
SERVICE_ACCOUNT_JSON_STRING = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if SERVICE_ACCOUNT_JSON_STRING:
    try:
        # Crear archivo temporal
        service_account_info = json.loads(SERVICE_ACCOUNT_JSON_STRING)
        temp_file_path = "/tmp/service_account.json"
        with open(temp_file_path, "w") as f:
            json.dump(service_account_info, f)
        
        # Configurar entorno
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
        GOOGLE_PROJECT_ID = service_account_info.get("project_id")
        
        # Inicializar Vertex AI
        vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
        aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")
        print(f"✅ Vertex AI conectado. Proyecto: {GOOGLE_PROJECT_ID}")
        
    except Exception as e:
        print(f"❌ Error crítico leyendo el JSON: {e}")
else:
    print("⚠️ ADVERTENCIA: Falta GOOGLE_APPLICATION_CREDENTIALS_JSON")

# --- Configuración Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Modelos de Datos ---
class CultivoCreate(BaseModel):
    nombre: str
    ubicacion: str
    plantas: List[str]
    deviceId: Optional[str] = None

# --- NUEVO MODELO PARA NOTAS ---
class NoteCreate(BaseModel):
    title: str
    content: str
    date: str
    color: Optional[str] = "bg-white"

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
        return res.data[0] if res.data else {"error": "Error al crear"}
    except Exception as e:
        return {"error": str(e)}

# --- ENDPOINTS API ---
@app.get("/")
def health(): return {"status": "ok"}

@app.get("/cultivos")
def get_cultivos(): return get_cultivos_internal()

@app.post("/cultivos")
def create_cultivo(c: CultivoCreate): 
    return create_cultivo_internal(c.nombre, c.ubicacion, c.plantas, c.deviceId)

# --- NUEVOS ENDPOINTS DE NOTAS ---
@app.get("/notes")
def get_notes(date: Optional[str] = None):
    try:
        query = supabase.table('notes').select("*").order('created_at', desc=True)
        if date:
            query = query.eq('date', date)
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notes")
def create_note(note: NoteCreate):
    try:
        response = supabase.table('notes').insert(note.dict()).execute()
        return response.data[0] if response.data else {"error": "Error al guardar"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/notes/{note_id}")
def delete_note(note_id: str):
    try:
        supabase.table('notes').delete().eq('id', note_id).execute()
        return {"message": "Eliminada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- CHATBOT (VERTEX AI) ---
tool_get = FunctionDeclaration(name="get_cultivos_internal", description="Ver lista de cultivos", parameters={"type": "OBJECT", "properties": {}})
tool_create = FunctionDeclaration(name="create_cultivo_internal", description="Crear cultivo", parameters={"type": "OBJECT", "properties": {"nombre": {"type": "STRING"}, "ubicacion": {"type": "STRING"}, "plantas": {"type": "ARRAY", "items": {"type": "STRING"}}, "deviceId": {"type": "STRING"}}, "required": ["nombre", "ubicacion", "plantas"]})

SYSTEM_PROMPT = """
Eres PlantCare.
1. SEGURIDAD: NO drogas.
2. FORMATO: Texto plano, listas con guiones (-). NO Markdown.
3. CONTEXTO: Recuerda "el primero".
"""

# Inicialización del modelo
chat = None
try:
    # Usamos TU modelo preferido
    model = GenerativeModel(
        "gemini-2.5-flash", 
        system_instruction=SYSTEM_PROMPT,
        tools=[Tool(function_declarations=[tool_get, tool_create])]
    )
    chat = model.start_chat()
    print("✅ Chatbot Vertex iniciado.")
except Exception as e:
    print(f"❌ Error al iniciar modelo Vertex: {e}")

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    global chat
    if chat is None: raise HTTPException(status_code=500, detail="Chat no disponible")

    try:
        response = chat.send_message(chat_message.message)
        frontend_response = {"reply": "", "action_performed": None}
        
        if response.candidates and response.candidates[0].content.parts:
             for part in response.candidates[0].content.parts:
                if part.function_call:
                    fname = part.function_call.name
                    if fname == 'get_cultivos_internal':
                        res = str(get_cultivos_internal())
                        frontend_response["action_performed"] = "read"
                    elif fname == 'create_cultivo_internal':
                        args = {k: v for k, v in part.function_call.args.items()}
                        res = str(create_cultivo_internal(**args))
                        frontend_response["action_performed"] = "create"
                    else:
                        res = "Función desconocida"

                    response = chat.send_message(
                        Part.from_function_response(name=fname, response={"result": res})
                    )
            
        frontend_response["reply"] = response.text
        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        try: chat = model.start_chat()
        except: pass
        return {"reply": "Tuve un problema técnico. ¿Me lo repites?"}