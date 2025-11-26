import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional

# --- Importaciones de Google Vertex AI ---
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part, FunctionDeclaration, SafetySetting
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
        print("Credenciales de Google configuradas exitosamente.")
    except Exception as e:
        print(f"ERROR: No se pudo escribir el JSON de credenciales: {e}")
else:
    print("ADVERTENCIA: GOOGLE_APPLICATION_CREDENTIALS_JSON no está configurada.")

# --- Configuración de Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- Configuración de Google Vertex AI ---
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")
if GOOGLE_PROJECT_ID:
    vertexai.init(project=GOOGLE_PROJECT_ID, location="us-central1")
    aiplatform.init(project=GOOGLE_PROJECT_ID, location="us-central1")

# --- MAPA DE IMÁGENES (Para que la IA asigne fotos automáticamente) ---
PLANT_IMAGES = {
    'tomato': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'tomate': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'lettuce': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3',
    'lechuga': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3',
    'basil': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
    'albahaca': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
    'mint': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
    'menta': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0eqkJqrsUOhyuj_gJsuJVJl6N8BL4ItNP3g3Xydy5u2nouGaNpwUcGkKN2NmiDKf-Gt__ssBUXQQMMXY7YSI1FY5I01CILFhd9D7Wa9wFaaveqTMk4ZnNUEwiBRqQxZVXPhj-6YvPHJITBjafbAFBEMI2kNpnb5c5GkhlRb6vByVenoDqIQaq2FIrndueUAZ89fqtHUSWUjOMXS3hBWfRv31P32oUrH77tl2nJOPpjZlh85DL20uoM8oq2h3H97dV7J1jP2wGQog',
    'strawberry': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'fresa': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'frutilla': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'pepper': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'pimiento': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_9Hakg1INZM6BjqCTO4Z5KeV40vNA2ZY7qG0qds2AxuGTfuFeSyPiTVuoQxgBHvxGqcWYWnEp_Q7ncD_DdbKaP3-13VgIj1dl9QkeaRFpaSpf91FOl6ceLdV4DMVEt7ZtGvEsxYGVTfvHOhKHPfywpHbyxj7nJ6ZUadKrOj6CUrcNb2ZEtLQqetfoGqBlnU04QyXKf1G7_W3NFqWPo_rT6QkxPBTai9aTBERgwZoXM3_nlJZouYSP47E2llMx-lCRvGIHrrwFfQa',
    'default': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrro4BndRZevZ6SI0fqkNRopd60Dn6wfgbc4FSaS222BH1a75sE54KZABAlJuWnH_w9WUd0spUm3ZGnBj2oFdUDU8_za2__RfeTmj8gLqI1Sg_FmbGsAHqTnbulbgcikLwxpyZtv8c_Zx1120qJhzHSK9zJcIMkUXCyGHr7a13u_BjfhyqEbeEEvB6HOBRVhQURGyTgLzUckPUQlxHKujj_l1K6KMwAubQpfGufoahxzQiYaFZ3e-cKsUIBfnwBgaCpBq9MIuk0L3'
}

def get_image_for_plant(plant_name: str) -> str:
    """Busca una imagen basada en el nombre, normalizando a minúsculas."""
    for key, url in PLANT_IMAGES.items():
        if key in plant_name.lower():
            return url
    return PLANT_IMAGES['default']

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

# --- FUNCIONES INTERNAS (HERRAMIENTAS) ---

def get_cultivos_internal():
    """Obtiene todos los registros de la tabla 'cultivos'."""
    try:
        response = supabase.table('cultivos').select("*").execute()
        return response.data if response.data else "El usuario no tiene cultivos registrados aún."
    except Exception as e:
        return f"Error al obtener cultivos: {str(e)}"

def create_cultivo_internal(nombre: str, ubicacion: str, plantas: List[str], deviceId: Optional[str] = None):
    """Crea un nuevo cultivo en la base de datos y asigna imagen automáticamente."""
    try:
        # 1. Lógica automática de Imagen
        # Tomamos la primera planta de la lista para decidir la foto
        main_plant = plantas[0] if plantas else "default"
        image_url = get_image_for_plant(main_plant)

        data_to_insert = {
            "name": nombre,
            "location": ubicacion,
            "plantas": plantas,
            "deviceId": deviceId,
            # No guardamos imageUrl en DB según tu última petición, 
            # pero si decidieras volver a guardarla, iría aquí.
            # Por ahora el frontend la deduce, pero esto ayuda a la IA a saber qué imagen "tendría".
            
            "status": "Iniciando",
            "statusColor": "text-gray-500",
            "temp": "N/A",
            "humidity": "N/A",
            "nutrients": "N/A",
            "waterLevel": "N/A"
        }
        response = supabase.table('cultivos').insert(data_to_insert).execute()
        return response.data[0] if response.data else "Error al crear el cultivo"
    except Exception as e:
        return f"Error al crear cultivo: {str(e)}"

# --- ENDPOINTS PÚBLICOS ---
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

@app.get("/cultivos")
def get_cultivos_api():
    result = get_cultivos_internal()
    if isinstance(result, str) and "Error" in result:
        raise HTTPException(status_code=500, detail=result)
    return result

@app.post("/cultivos")
def create_cultivo_api(cultivo: CultivoCreate):
    result = create_cultivo_internal(cultivo.nombre, cultivo.ubicacion, cultivo.plantas, cultivo.deviceId)
    if isinstance(result, str) and "Error" in result:
        raise HTTPException(status_code=500, detail=result)
    return result

# --- 🤖 CONFIGURACIÓN DEL CHATBOT 🤖 ---

tool_get_cultivos = FunctionDeclaration(
    name="get_cultivos_internal",
    description="Usa esta herramienta cuando el usuario pregunte qué cultivos tiene, o pida consejos sobre 'sus' plantas. Devuelve la lista de cultivos guardados.",
    parameters={"type": "OBJECT", "properties": {}}
)

tool_create_cultivo = FunctionDeclaration(
    name="create_cultivo_internal",
    description="Usa esta herramienta SOLO cuando el usuario confirme explícitamente que quiere crear un nuevo cultivo.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "nombre": {"type": "STRING", "description": "Nombre del cultivo"},
            "ubicacion": {"type": "STRING", "description": "Ubicación (Interior/Exterior)"},
            "plantas": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Lista de plantas (ej: ['tomate'])"},
            "deviceId": {"type": "STRING", "description": "Opcional. ID del dispositivo hardware"}
        },
        "required": ["nombre", "ubicacion", "plantas"]
    }
)

# --- INSTRUCCIONES DEL SISTEMA (AQUÍ ESTÁ LA SEGURIDAD Y PERSONALIDAD) ---
SYSTEM_PROMPT = """
Eres PlantCare, un asistente agrónomo experto, amable y profesional.

TUS REGLAS DE ORO:
1. SEGURIDAD ABSOLUTA: Tienes estrictamente PROHIBIDO ayudar, asesorar o crear cultivos relacionados con plantas ilegales, drogas o sustancias controladas (ej: cannabis, marihuana, coca, amapola, hongos alucinógenos). Si un usuario menciona esto, rechaza la petición firmemente pero con educación, diciendo que solo trabajas con cultivos legales y alimenticios.

2. CONTEXTO:
   - Si el usuario pregunta "¿Cómo están mis plantas?" o "¿Qué tengo sembrado?", DEBES usar la herramienta 'get_cultivos_internal' primero para ver su base de datos.
   - Luego, responde basándote en esa información real.
   - Si te piden consejos de cuidado, mira qué plantas tienen (usando la herramienta) y dales consejos específicos para ESAS plantas.

3. ORTOGRAFÍA Y TONO:
   - Escribe en Español Neutro perfecto.
   - Usa signos de interrogación y exclamación de apertura y cierre (¿? ¡!).
   - Sé conciso pero útil. No pierdas el hilo.

4. CREACIÓN DE CULTIVOS:
   - Si te piden crear un cultivo, extrae la información necesaria.
   - Si falta información (ej: ubicación), asume un valor lógico por defecto (ej: "Exterior" para maíz, "Interior" para hierbas delicadas) o pregúntalo si es crítico.
"""

model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT,
    tools=[Tool(function_declarations=[tool_get_cultivos, tool_create_cultivo])]
)

available_tools = {
    "get_cultivos_internal": get_cultivos_internal,
    "create_cultivo_internal": create_cultivo_internal
}

# Iniciamos el chat fuera del endpoint para intentar mantener algo de caché,
# aunque en Render (serverless) esto se reinicia frecuentemente.
chat = model.start_chat()

@app.post("/chat")
def handle_chat_message(chat_message: ChatMessage):
    if not GOOGLE_PROJECT_ID:
        raise HTTPException(status_code=500, detail="Error de configuración del servidor.")

    try:
        # Enviamos el mensaje a la IA
        response = chat.send_message(chat_message.message)
        
        # Verificamos si quiere usar una herramienta
        function_call = response.candidates[0].content.parts[0].function_call
        
        frontend_response = {"reply": ""}

        if function_call:
            function_name = function_call.name
            
            if function_name in available_tools:
                # Ejecutar la herramienta
                tool_func = available_tools[function_name]
                args = {key: value for key, value in function_call.args.items()}
                
                tool_result = tool_func(**args)
                
                # Marcar acción para el frontend
                if function_name == 'create_cultivo_internal':
                    frontend_response["action_performed"] = "create"

                # Enviar resultado de vuelta a la IA para que genere la respuesta final
                response = chat.send_message(
                    Part.from_function_response(
                        name=function_name,
                        response={"result": str(tool_result)}
                    )
                )
        
        # Respuesta final en texto
        frontend_response["reply"] = response.text
        return frontend_response

    except Exception as e:
        print(f"Error chat: {e}")
        # Fallback elegante si la IA se confunde
        return {"reply": "Lo siento, tuve un problema técnico momentáneo. ¿Podrías repetirme la pregunta?"}