from fastapi import FastAPI, Request
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from agent import process_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str
    state: dict

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(request: Request, body: ChatRequest):
    result = process_message(body.message, body.state)
    return {
        "response": result["response"],
        "state": result["state"],
        "tools_called": result.get("tools_called", []),
        "ticket": result.get("ticket", None)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
