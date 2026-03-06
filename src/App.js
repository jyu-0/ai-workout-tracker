import { useState, useRef, useEffect } from "react";
import LogWorkout from "./components/LogWorkout/LogWorkout";
import History from "./components/History/History";
import Progress from "./components/Progress/Progress";

const COLORS = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceAlt: "#1a1a1a",
  border: "#222222",
  accent: "#e8ff00",
  accentDim: "#b8cc00",
  text: "#f0f0f0",
  textMuted: "#666666",
  textDim: "#999999",
  red: "#ff3b3b",
  green: "#00e676",
  orange: "#ff9100",
};

const mockHistory = [
  {
    id: 1,
    date: "Mar 4, 2026",
    name: "Push Day",
    muscles: ["Chest", "Shoulders", "Triceps"],
    exercises: [
      { name: "Bench Press", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }, { reps: 7, weight: 185 }] },
      { name: "Overhead Press", sets: [{ reps: 10, weight: 115 }, { reps: 9, weight: 115 }] },
      { name: "Tricep Pushdown", sets: [{ reps: 12, weight: 60 }, { reps: 12, weight: 60 }] },
    ],
    sleep: 7,
    diet: "Clean",
    recovery: "Good",
  },
  {
    id: 2,
    date: "Mar 2, 2026",
    name: "Pull Day",
    muscles: ["Back", "Biceps"],
    exercises: [
      { name: "Deadlift", sets: [{ reps: 5, weight: 315 }, { reps: 5, weight: 315 }, { reps: 4, weight: 315 }] },
      { name: "Pull-ups", sets: [{ reps: 10, weight: 0 }, { reps: 9, weight: 0 }, { reps: 8, weight: 0 }] },
      { name: "Barbell Row", sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 155 }] },
    ],
    sleep: 6,
    diet: "Junk food",
    recovery: "Poor",
  },
  {
    id: 3,
    date: "Feb 28, 2026",
    name: "Leg Day",
    muscles: ["Quads", "Hamstrings", "Glutes"],
    exercises: [
      { name: "Squat", sets: [{ reps: 5, weight: 275 }, { reps: 5, weight: 275 }, { reps: 5, weight: 275 }] },
      { name: "Romanian Deadlift", sets: [{ reps: 10, weight: 185 }, { reps: 10, weight: 185 }] },
      { name: "Leg Press", sets: [{ reps: 12, weight: 360 }, { reps: 12, weight: 360 }] },
    ],
    sleep: 8,
    diet: "Clean",
    recovery: "Excellent",
  },
];

const PRs = [
  { exercise: "Bench Press", weight: 225, date: "Feb 15, 2026", trend: "+10 lbs this month" },
  { exercise: "Squat", weight: 315, date: "Jan 28, 2026", trend: "+25 lbs this month" },
  { exercise: "Deadlift", weight: 365, date: "Feb 20, 2026", trend: "+15 lbs this month" },
  { exercise: "Overhead Press", weight: 145, date: "Mar 1, 2026", trend: "+5 lbs this month" },
];

const EXERCISES = ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Pull-ups", "Barbell Row", "Tricep Pushdown", "Leg Press", "Romanian Deadlift", "Incline Press", "Lat Pulldown", "Dumbbell Curl"];

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Core", "Calves"];

const initialMessages = [
  {
    role: "assistant",
    content: "Hey! I'm your AI performance coach. Tell me how you're feeling today — sleep, diet, stress — and I'll help you optimize your session. You can also ask me about pre-workout nutrition, recovery, or anything gym-related. 💪",
  },
];

const styles = {
  app: {
    background: COLORS.bg,
    minHeight: "100vh",
    maxWidth: "430px",
    margin: "0 auto",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: COLORS.text,
    position: "relative",
    overflow: "hidden",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    background: COLORS.surface,
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    zIndex: 100,
    padding: "8px 0 16px",
  },
  navBtn: (active) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "8px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: active ? COLORS.accent : COLORS.textMuted,
    fontSize: "9px",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "color 0.15s",
  }),
  page: {
    padding: "24px 20px 100px",
    minHeight: "100vh",
  },
  label: {
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    marginBottom: "6px",
    display: "block",
  },
  accentBar: {
    width: "32px",
    height: "3px",
    background: COLORS.accent,
    marginBottom: "20px",
  },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "2px",
    padding: "16px",
    marginBottom: "12px",
  },
  input: {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "2px",
    color: COLORS.text,
    fontFamily: "'DM Mono', monospace",
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: (variant = "primary") => ({
    background: variant === "primary" ? COLORS.accent : "transparent",
    color: variant === "primary" ? "#000" : COLORS.accent,
    border: variant === "primary" ? "none" : `1px solid ${COLORS.accent}`,
    borderRadius: "2px",
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "opacity 0.15s",
  }),
  tag: (color = COLORS.accent) => ({
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}40`,
    borderRadius: "2px",
    fontSize: "9px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "3px 8px",
    display: "inline-block",
  }),
};

// ── ICONS (inline SVG) ──────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = "currentColor" }) => {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    dumbbell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M6 4v16M18 4v16M6 8H4a1 1 0 00-1 1v6a1 1 0 001 1h2M18 8h2a1 1 0 011 1v6a1 1 0 01-1 1h-2M6 6h12"/></svg>,
    history: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    ai: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    fire: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2C8 7 6 10 6 14a6 6 0 0012 0c0-2-1-4-2-5-1 2-2 3-3 3-1 0-2-1-2-3 0-1 1-3 1-7z"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  };
  return icons[name] || null;
};

// ── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ onStartWorkout }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const lastWorkout = mockHistory[0];
  const daysSince = 1;

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: "28px" }}>
        <span style={styles.label}>Today</span>
        <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>{today}</div>
        <div style={styles.accentBar} />
        <div style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          READY TO<br /><span style={{ color: COLORS.accent }}>TRAIN?</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
        {[
          { label: "This Week", value: "3", unit: "sessions" },
          { label: "Last Sleep", value: "7", unit: "hrs" },
          { label: "Streak", value: "5", unit: "days" },
        ].map((s) => (
          <div key={s.label} style={{ ...styles.card, padding: "12px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: COLORS.accent }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.unit}</div>
            <div style={{ fontSize: "8px", color: COLORS.textDim, marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Start Workout CTA */}
      <button onClick={onStartWorkout} style={{ ...styles.btn("primary"), width: "100%", padding: "16px", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <Icon name="plus" size={16} color="#000" />
        START WORKOUT
      </button>

      {/* Last Workout */}
      <span style={styles.label}>Last Session</span>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "14px" }}>{lastWorkout.name}</div>
            <div style={{ fontSize: "11px", color: COLORS.textMuted }}>{lastWorkout.date}</div>
          </div>
          <span style={styles.tag(COLORS.green)}>{daysSince}d ago</span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {lastWorkout.muscles.map((m) => (
            <span key={m} style={styles.tag()}>{m}</span>
          ))}
        </div>
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: COLORS.textMuted }}>
            <Icon name="moon" size={12} color={COLORS.textMuted} /> {lastWorkout.sleep}h sleep
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: COLORS.textMuted }}>
            <Icon name="zap" size={12} color={COLORS.textMuted} /> {lastWorkout.diet}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: lastWorkout.recovery === "Good" ? COLORS.green : COLORS.orange }}>
            <Icon name="fire" size={12} color={lastWorkout.recovery === "Good" ? COLORS.green : COLORS.orange} /> {lastWorkout.recovery}
          </div>
        </div>
      </div>

      {/* Today's PRs hint */}
      <span style={styles.label}>Top PRs</span>
      {PRs.slice(0, 2).map((pr) => (
        <div key={pr.exercise} style={{ ...styles.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600" }}>{pr.exercise}</div>
            <div style={{ fontSize: "10px", color: COLORS.textMuted }}>{pr.trend}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: COLORS.accent }}>{pr.weight}</div>
            <div style={{ fontSize: "9px", color: COLORS.textMuted }}>LBS</div>
          </div>
        </div>
      ))}
    </div>
  );
}


// ── AI CHAT ──────────────────────────────────────────────────────────────────
function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are an expert AI performance coach embedded in a workout tracker app. You help gym-goers optimize their training based on lifestyle factors like sleep, diet, and recovery. You're knowledgeable, direct, and motivating — like a personal trainer who also understands sports nutrition. Keep responses concise (2-4 sentences max). Focus on practical, actionable advice. You can comment on how sleep, diet, and stress affect workout performance.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = ["I only slept 5 hours", "Best pre-workout meal?", "I'm hungover today", "Should I train fasted?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
        <span style={styles.label}>AI Coach</span>
        <div style={styles.accentBar} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.green }} />
          <span style={{ fontSize: "12px", color: COLORS.textMuted }}>Online · Powered by Claude</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%",
              background: m.role === "user" ? COLORS.accent : COLORS.surface,
              color: m.role === "user" ? "#000" : COLORS.text,
              border: m.role === "assistant" ? `1px solid ${COLORS.border}` : "none",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding: "10px 14px",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "system-ui, sans-serif",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "12px 12px 12px 2px", padding: "10px 14px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: COLORS.accent, animation: `pulse 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "8px 20px", display: "flex", gap: "6px", overflowX: "auto" }}>
        {quickPrompts.map((q) => (
          <button key={q} onClick={() => setInput(q)} style={{ ...styles.tag(), cursor: "pointer", background: "transparent", border: `1px solid ${COLORS.border}`, whiteSpace: "nowrap", fontFamily: "inherit", color: COLORS.textDim }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 20px 12px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: "8px" }}>
        <input
          style={{ ...styles.input, flex: 1, borderRadius: "20px", padding: "10px 16px" }}
          placeholder="Ask your coach..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} disabled={loading} style={{ ...styles.btn("primary"), borderRadius: "50%", width: "42px", height: "42px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading ? 0.5 : 1 }}>
          <Icon name="send" size={14} color="#000" />
        </button>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [prevTab, setPrevTab] = useState(null);

  const navigate = (t) => { setPrevTab(tab); setTab(t); };

  const navItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "log", label: "Log", icon: "dumbbell" },
    { id: "history", label: "History", icon: "history" },
    { id: "progress", label: "Progress", icon: "chart" },
    { id: "ai", label: "AI Coach", icon: "ai" },
  ];

  return (
    <div style={styles.app}>
      <div style={{ overflowY: "auto", height: "100vh" }}>
        {tab === "home" && <Dashboard onStartWorkout={() => navigate("log")} />}
        {tab === "log" && <LogWorkout onComplete={() => navigate("history")} />}
        {tab === "history" && <History />}
        {tab === "progress" && <Progress />}
        {tab === "ai" && <AIChat />}
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button key={item.id} style={styles.navBtn(tab === item.id)} onClick={() => navigate(item.id)}>
            <Icon name={item.icon} size={20} color={tab === item.id ? COLORS.accent : COLORS.textMuted} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
