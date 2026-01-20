
import google.generativeai as genai
import os

# TU LLAVE DIRECTAMENTE AQUI
REAL_KEY = "AIzaSyAGJqAHH3928XaYgLPEeX0zLLpRlpew5lY"

print(f"Probando conexion con llave: {REAL_KEY[:10]}...")

genai.configure(api_key=REAL_KEY)

try:
    print("1. Listando modelos disponibles...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")

    print("\n2. Intentando generar texto con gemini-1.5-flash...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Di 'Hola, la llave funciona correctamente'")
    print(f"\nRESULTADO: {response.text}")

except Exception as e:
    print(f"\nERROR FATAL: {e}")
