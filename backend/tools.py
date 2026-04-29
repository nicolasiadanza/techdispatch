import random
from datetime import datetime

def verificar_conexion(cliente_id: str) -> str:
    resultados = ["signal OK", "weak signal", "no signal"]
    return random.choice(resultados)

def reiniciar_modem(cliente_id: str) -> dict:
    exitos = [True, False]
    success = random.choice(exitos)
    if success:
        tiempo_estimado = random.randint(1, 5)
        return {"success": True, "estimated_time": f"{tiempo_estimado} minutos"}
    else:
        return {"success": False, "estimated_time": None}

def verificar_senal(cliente_id: str) -> int:
    nivel_senal = random.randint(0, 100)
    return nivel_senal

def crear_ticket(problema: str, diagnostico: str, acciones: list) -> dict:
    ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    timestamp = datetime.now().isoformat()
    priority = "alta" if "urgente" in problema.lower() else "normal"
    return {
        "ticket_id": ticket_id,
        "timestamp": timestamp,
        "priority": priority,
        "problema": problema,
        "diagnostico": diagnostico,
        "acciones": acciones
    }

def escalar_a_tecnico(ticket_id: str, motivo: str) -> dict:
    return {
        "ticket_id": ticket_id,
        "motivo": motivo,
        "escalado": True
    }
