import { useState, useRef, useEffect } from "react";

// ── STYLES ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", surface: "#111111", surfaceAlt: "#1a1a1a",
  border: "#222222", accent: "#e8ff00", text: "#f0f0f0",
  textMuted: "#666666", textDim: "#999999", green: "#00e676",
};

const s = {
  container: { display: "flex", flexDirection: "column", height: "100vh", paddingBottom: "80px", fontFamily: "'DM Mono', 'Courier New', monospace", background: C.bg, color: C.text },
  label: { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, marginBottom: "6px", display: "block" },
  accentBar: { width: "32px", height: "3px", background: C.accent, marginBottom: "12px" },
  input: { background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "20px", color: C.text, fontFamily: "'DM Mono', monospace", fontSize: "13px", padding: "10px 16px", flex: 1, outline: "none", boxSizing: "border-box" },
};

// ── SYSTEM PROMPT ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert AI performance coach embedded in a workout tracker app. 
You help gym-goers optimize their training based on lifestyle factors like sleep, diet, and recovery. 
You're knowledgeable, direct, and motivating — like a personal trainer who also understands sports nutrition.
Keep responses concise (2-4 sentences max). Focus on practical, actionable advice.
You can comment on how sleep, diet, and stress affect workout performance.
If the user mentions they're hungover, tired, or ate poorly — acknowledge it and adjust your advice accordingly.`;

// ── QUICK PROMPTS ──────────────────────────────────────────────────────────
export const QUICK_PROMPTS = [
  "I only slept 5 hours",
  "Best pre-workout meal?",
  "I'm hungover today",
  "Should I train fasted?",
  "How much protein do I need?",
  "I ate junk food last night",
];

// ── INITIAL WELCOME MESSAGE ────────────────────────────────────────────────
export const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hey! I'm your AI performance coach. Tell me how you're feeling today — sleep, diet, stress — and I'll help you optimize your session. You can also ask me about pre-workout nutrition, recovery, or anything gym-related. 💪",
};

// ── API CALL ───────────────────────────────────────────────────────────────
export const fetchAIResponse = async (messages) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
};

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function AIChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const reply = await fetchAIResponse(updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError("Couldn't reach the AI. Please try again.");
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Connection error — please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={s.label}>AI Coach</span>
        <div style={s.accentBar} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.green }} data-testid="online-indicator" />
          <span style={{ fontSize: "12px", color: C.textMuted }}>Online · Powered by Claude</span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}
        data-testid="message-list"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
            data-testid={`message-${i}`}
          >
            <div style={{
              maxWidth: "82%",
              background: m.role === "user" ? C.accent : C.surface,
              color: m.role === "user" ? "#000" : C.text,
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding: "10px 14px",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "system-ui, sans-serif",
            }}
              data-testid={`message-bubble-${i}`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }} data-testid="loading-indicator">
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px 12px 12px 2px", padding: "10px 14px", display: "flex", gap: "4px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ fontSize: "11px", color: "#ff3b3b", textAlign: "center", padding: "4px" }} data-testid="error-message">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div
        style={{ padding: "8px 20px", display: "flex", gap: "6px", overflowX: "auto", flexShrink: 0, borderTop: `1px solid ${C.border}` }}
        data-testid="quick-prompts"
      >
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            data-testid={`quick-prompt-${prompt}`}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={loading}
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: "2px",
              color: C.textDim,
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.08em",
              padding: "5px 10px",
              cursor: loading ? "default" : "pointer",
              whiteSpace: "nowrap",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ padding: "8px 20px 12px", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
        <input
          data-testid="chat-input"
          style={s.input}
          placeholder="Ask your coach..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          data-testid="send-button"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? C.surfaceAlt : C.accent,
            border: "none",
            borderRadius: "50%",
            width: "42px",
            height: "42px",
            cursor: loading || !input.trim() ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "16px",
            transition: "background 0.15s",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}