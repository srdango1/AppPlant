import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Google AI (Gemini) ---
import google.generativeai as genai

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google AI (Gemini) ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("ADVERTENCIA: GEMINI_API_KEY no está configurada. El Chatbot no funcionará.")
else:
    genai.configure(api_key=gemini_api_key)

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
    if isinstance(result, str): # Si es un string, es un error
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
    if isinstance(result, str): # Si es un string, es un error
        raise HTTPException(status_code=500, detail=result)
    return result


# --- 🤖 NUEVO ENDPOINT DE CHATBOT 🤖 ---

# 1. Define las "Herramientas" que la IA puede usar
tools = [
    {
        "function_declarations": [
            {
                "name": "get_cultivos_internal",
                "description": "Obtener la lista de todos los cultivos actuales del usuario.",
                "parameters": {"type": "OBJECT", "properties": {}}
            },
            {
                "name": "create_cultivo_internal",
                "description": "Crear un nuevo cultivo en la base de datos.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "nombre": {"type": "STRING", "description": "El nombre que el usuario le da al cultivo, ej: 'Tomates del balcón'"},
                        "ubicacion": {"type": "STRING", "description": "Dónde está el cultivo, ej: 'Interior' o 'Exterior'"},
                        "plantas": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Lista de IDs de plantas, ej: ['tomato', 'lettuce']"},
                    },
                    "required": ["nombre", "ubicacion", "plantas"]
                }
            }
        ]
    }
]

# 2. Inicializa el modelo de IA con las herramientas
# --- ⚠️ AQUÍ ESTÁ EL ARREGLO (CUARTO INTENTO) ⚠️ ---
# Usamos el nombre completo del modelo
model = genai.GenerativeModel(
    model_name='models/gemini-pro',
    tools=tools,
    system_instruction="Eres un asistente de jardinería amigable llamado 'PlantCare'. Ayudas a los usuarios a gestionar sus cultivos. Siempre respondes en español."
)
# --- FIN DEL ARREGLO ---

# 3. Mapea los nombres de las herramientas a las funciones de Python
available_tools = {
    "get_cultivos_internal": get_cultivos_internal,
    "create_cultivo_internal": create_cultivo_internal,
}

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    """
    Recibe un mensaje, lo procesa con la IA y devuelve una respuesta.
    Maneja "tool calling" para get_cultivos y create_cultivo.
    """
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="El servicio de Chatbot no está configurado (falta GEMINI_API_KEY).")

    user_message = chat_message.message
    
    try:
        # 1. Envía el mensaje del usuario a Gemini
        chat = model.start_chat()
        response = chat.send_message(user_message)
        
        # 2. Revisa si la IA quiere usar una herramienta
        function_call = response.candidates[0].content.parts[0].function_call
        
        if not function_call:
            # 2a. Si no hay herramienta, es una respuesta normal
            return {"reply": response.text}

        # 3. Si la IA pide una herramienta, la ejecutamos
        function_name = function_call.name
        args = function_call.args
        
        if function_name not in available_tools:
            raise HTTPException(status_code=500, detail=f"Error: Herramienta desconocida '{function_name}'")

        # 4. Llama a la función de Python correspondiente
        function_to_call = available_tools[function_name]
        
        # Convertir los argumentos (que son un tipo especial) a un dict de Python
        args_dict = {key: value for key, value in args.items()}
        
        # Llama a la función (ej: create_cultivo_internal(...))
        tool_response = function_to_call(**args_dict)

        # 5. Envía el resultado de la herramienta de vuelta a la IA
        response = chat.send_message(
            part=genai.types.FunctionResponse(
                name=function_name,
                response={"result": str(tool_response)} # Le pasamos el resultado
            ),
        )

        # 6. La IA genera una respuesta final en lenguaje natural
        return {"reply": response.text}

    except Exception as e:
        print(f"Error en el endpoint /chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el mensaje: {str(e)}")