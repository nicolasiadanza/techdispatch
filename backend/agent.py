import requests
import re
from tools import verificar_conexion, reiniciar_modem, crear_ticket

SYSTEM_PROMPT = """Eres un agente de soporte tecnico para una empresa de internet. Responde siempre en español. Sé breve y amable."""

def call_ollama(messages):
    response = requests.post(
        "http://localhost:11434/api/chat",
        json={"model": "qwen2.5-coder:14b", "messages": messages, "stream": False}
    )
    return response.json()["message"]["content"]

def process_message(message, state):
    history = state.get("conversation_history", [])
    all_tools = []
    tools_called = []
    ticket = None
    forced_response = None

    # Detectar número de cliente
    client_match = re.search(r'\b(\d{4,6})\b', message)
    client_id = client_match.group(1) if client_match else state.get("client_id")

    # FLUJO HARDCODEADO
    step = state.get("step", "inicio")

    if client_id and step == "inicio":
        result = verificar_conexion(client_id)
        tools_called.append(f"verificar_conexion({client_id})")
        all_tools.append(f"verificar_conexion({client_id})")
        if result == "signal OK":
            forced_response = f"Verifiqué tu conexión y la señal está bien. ¿El problema persiste en todos tus dispositivos?"
            step = "verificado_ok"
        elif result == "weak signal":
            forced_response = f"Verifiqué tu conexión y detecté señal débil. Voy a reiniciar tu modem ahora."
            r2 = reiniciar_modem(client_id)
            tools_called.append(f"reiniciar_modem({client_id})")
            all_tools.append(f"reiniciar_modem({client_id})")
            estado = "exitoso" if r2["success"] else "fallido"
            forced_response += f" Reinicio {estado}. ¿Ya funciona tu internet?"
            step = "reiniciado"
        else:
            forced_response = f"Verifiqué tu conexión y no hay señal. Voy a reiniciar tu modem."
            r2 = reiniciar_modem(client_id)
            tools_called.append(f"reiniciar_modem({client_id})")
            all_tools.append(f"reiniciar_modem({client_id})")
            estado = "exitoso" if r2["success"] else "fallido"
            forced_response += f" Reinicio {estado}. ¿Ya funciona tu internet?"
            step = "reiniciado"

    elif step == "reiniciado" and any(w in message.lower() for w in ["no", "sigue", "igual", "mismo", "nada"]):
        t = crear_ticket(problema="Sin conexión a internet", diagnostico="Sin señal tras reinicio", acciones=all_tools)
        ticket = t
        tools_called.append(f"crear_ticket({t['ticket_id']})")
        all_tools.append(f"crear_ticket({t['ticket_id']})")
        forced_response = f"Creé un ticket de soporte ({t['ticket_id']}). Un técnico visitará tu domicilio en las próximas 24 horas."
        step = "escalado"

    # Si no hay respuesta forzada, usar LLM
    if not forced_response:
        messages_llm = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in history:
            if "user" in turn:
                messages_llm.append({"role": "user", "content": turn["user"]})
            if "agent" in turn:
                messages_llm.append({"role": "assistant", "content": turn["agent"]})
        messages_llm.append({"role": "user", "content": message})
        forced_response = call_ollama(messages_llm)

    history.append({"user": message})
    history.append({"agent": forced_response})

    return {
        "response": forced_response,
        "state": {"conversation_history": history, "all_tools": all_tools, "step": step, "client_id": client_id},
        "tools_called": tools_called,
        "ticket": ticket
    }
