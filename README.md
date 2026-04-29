# TechDispatch 🛠️
### AI-Powered Technical Support Agent for ISPs

An autonomous support agent that handles internet connectivity issues through a WhatsApp-style interface. No human intervention needed for tier-1 support.

## Live Demo
> Clone and run locally (see setup below)

## How it works
1. Customer describes their problem in natural language
2. Agent asks for customer ID
3. Agent automatically verifies connection, restarts modem if needed
4. If unresolved, creates a support ticket and escalates to a technician

## Diagnostic Panel
Real-time visibility of every action the agent takes — tools called, results, tickets generated.

## In Production
The simulated tools connect to real ISP systems via REST API:
- `verificar_conexion()` → Router/modem API
- `reiniciar_modem()` → ISP management system  
- `crear_ticket()` → CRM/ticketing platform
- Voice support available on request

## Stack
- Backend: Python + FastAPI
- AI: Ollama + Llama (local, no external APIs, no cost)
- Frontend: React + Vite
- Architecture: Stateful agent with hardcoded decision flow + LLM fallback

## Setup
```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend && npm install && npm run dev

The Problem It Solves

Small ISPs use technicians for tier-1 support (password resets, modem restarts, basic diagnostics). This agent handles those automatically, freeing technicians for real on-site work.
