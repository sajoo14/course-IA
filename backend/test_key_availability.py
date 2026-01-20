
import google.generativeai as genai
import os

# LA LLAVE ORIGINAL QUE DICES QUE ES TUYA
TEST_KEY = "PON_TU_LLAVE_AQUI"

print(f"Diagnostico de API Key: {TEST_KEY[:10]}...")

genai.configure(api_key=TEST_KEY)

try:
    print("\n--- MODELOS DISPONIBLES PARA ESTA LLAVE ---")
    models_found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" ✅ {m.name}")
            models_found = True
    
    if not models_found:
        print(" ❌ NO se encontraron modelos disponibles. La llave puede ser invalida o no tener permisos.")

except Exception as e:
    print(f"\nERROR DE CONEXION: {e}")
