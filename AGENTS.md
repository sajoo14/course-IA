# 🤖 AI Agents & Workflow

This document explains how **Artificial Intelligence** was not just the *product* of this project, but also the *builder*.

## 1. Agentic Development Workflow
The development of JustiBot followed an "Agentic" approach, treating the AI (Antigravity) as a pair programmer rather than just a code generator.



### Workflow Steps
1.  **Planning**: We started by defining the "User Story" (Colombian Legal Assistant).
2.  **Implementation**: The AI generated the initial boilerplate for FastAPI and React.
3.  **Debugging**: When API keys failed (Error 404), the AI diagnosed the issue and implemented a **Dynamic Model Discovery** strategy.
4.  **Documentation**: This documentation itself was structured and drafted by the AI based on reference repositories.

---

## 2. Dynamic Model Discovery (Self-Healing AI)
One of the most advanced features implemented by the agents is the **Self-Healing AI Service**.

### The Problem
Google Gemini's API changes frequently, and specific model names (like `gemini-pro` or `gemini-1.5-flash`) might become deprecated or unavailable in certain regions (like Colombia) without warning, causing 404 errors.

### The Agentic Solution
Instead of hardcoding a model name, the system asks the API "What do I have access to?" before generating text.

**Code Logic (`ai_service.py`):**
```python
# 1. List all models available to this specific API Key
available_models = []
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        available_models.append(m.name)

# 2. Select the first valid model automatically
model_name = available_models[0].name
```

This ensures **JustiBot** is robust and requires less maintenance than traditional hardcoded apps.
