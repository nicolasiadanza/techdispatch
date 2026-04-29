import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({});
  const [toolsCalled, setToolsCalled] = useState([]);
  const [ticket, setTicket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, session_id: "demo123", state }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", text: data.response }]);
      setState(data.state || {});
      setToolsCalled((prev) => [...prev, ...(data.state?.all_tools || [])]);
      if (data.ticket) setTicket(data.ticket);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "agent", text: "Error conectando con el servidor." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#f0f0f0", fontFamily: "Arial, sans-serif" }}>
      <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ background: "#075E54", color: "white", padding: "16px 20px" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>Soporte Técnico Internet</div>
          <div style={{ fontSize: "13px", opacity: 0.8 }}>En línea</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#ECE5DD" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "8px" }}>
              <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#DCF8C6" : "white",
                color: "#111",
                fontSize: "14px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                whiteSpace: "pre-wrap"
              }}>
                {msg.role === "agent" && <div style={{ fontSize: "11px", color: "#075E54", fontWeight: "bold", marginBottom: "4px" }}>Agente de Soporte</div>}
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
              <div style={{ background: "white", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
                <span style={{ color: "#075E54" }}>● ● ●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: "flex", padding: "12px 16px", background: "#F0F0F0", gap: "10px", alignItems: "center" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "none", fontSize: "14px", color: "#111", background: "white", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          />
          <button onClick={sendMessage} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#075E54", border: "none", cursor: "pointer", color: "white", fontSize: "18px" }}>➤</button>
        </div>
      </div>
      <div style={{ flex: "0 0 35%", background: "white", borderLeft: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#075E54", color: "white", padding: "16px 20px", fontWeight: "bold", fontSize: "16px" }}>Panel de Diagnóstico</div>
        <div style={{ padding: "20px", flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>ESTADO ACTUAL</div>
            <div style={{ padding: "8px 12px", background: "#E8F5E9", borderRadius: "8px", color: "#2E7D32", fontWeight: "bold" }}>
              {toolsCalled.length > 0 ? "Diagnosticando" : "Esperando consulta"}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>HERRAMIENTAS EJECUTADAS</div>
            {toolsCalled.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "13px" }}>Ninguna aún</div>
            ) : (
              toolsCalled.map((tool, i) => (
                <div key={i} style={{ padding: "6px 10px", background: "#F3E5F5", borderRadius: "6px", marginBottom: "4px", fontSize: "13px", color: "#6A1B9A" }}>
                  ⚙ {tool}
                </div>
              ))
            )}
          </div>
          {ticket && (
            <div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>TICKET GENERADO</div>
              <div style={{ padding: "12px", background: "#FFF3E0", borderRadius: "8px", fontSize: "13px" }}>
                <div><strong>ID:</strong> {ticket.ticket_id}</div>
                <div><strong>Problema:</strong> {ticket.problema}</div>
                <div><strong>Prioridad:</strong> {ticket.priority}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
