import { useState, useEffect } from "react";
import { loadWorkoutsFromStorage } from "../LogWorkout/LogWorkout";

// ── STYLES ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", surface: "#111111", surfaceAlt: "#1a1a1a",
  border: "#222222", accent: "#e8ff00", text: "#f0f0f0",
  textMuted: "#666666", textDim: "#999999", red: "#ff3b3b",
  green: "#00e676", orange: "#ff9100",
};

const s = {
  page: { padding: "24px 20px 100px", fontFamily: "'DM Mono', 'Courier New', monospace", color: C.text, background: C.bg, minHeight: "100vh" },
  label: { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, marginBottom: "6px", display: "block" },
  accentBar: { width: "32px", height: "3px", background: C.accent, marginBottom: "20px" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: "2px", padding: "16px", marginBottom: "10px", cursor: "pointer" },
  tag: (color = C.accent) => ({ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: "2px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", display: "inline-block" }),
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: "12px" },
};

// ── RECOVERY COLOR ─────────────────────────────────────────────────────────
const recoveryColor = (r) => {
  if (!r) return C.textMuted;
  if (r === "Excellent") return C.green;
  if (r === "Good") return C.green;
  if (r === "Poor") return C.red;
  return C.orange;
};

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  // Load workouts from localStorage on mount
  useEffect(() => {
    const stored = loadWorkoutsFromStorage();
    setWorkouts(stored);
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  // ── Empty state ────────────────────────────────────────────────────────
  if (workouts.length === 0) {
    return (
      <div style={s.page}>
        <span style={s.label}>Workout History</span>
        <div style={s.accentBar} />
        <div style={s.emptyState} data-testid="empty-state">
          <div style={{ fontSize: "48px" }}>🏋️</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: C.accent }}>NO SESSIONS YET</div>
          <div style={{ fontSize: "12px", color: C.textMuted, maxWidth: "200px", lineHeight: 1.6 }}>
            Log your first workout and it'll show up here
          </div>
        </div>
      </div>
    );
  }

  // ── Workout list ───────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <span style={s.label}>Workout History</span>
      <div style={s.accentBar} />
      <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "16px" }}>
        {workouts.length} session{workouts.length !== 1 ? "s" : ""} logged
      </div>

      {workouts.map((workout, idx) => (
        <div
          key={workout.id}
          style={s.card}
          data-testid={`workout-card-${idx}`}
          onClick={() => toggleExpand(workout.id)}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "15px" }} data-testid={`workout-name-${idx}`}>
                {workout.name}
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }} data-testid={`workout-date-${idx}`}>
                {workout.date}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: C.accent }}>
                  {workout.exercises?.length || 0}
                </div>
                <div style={{ fontSize: "8px", color: C.textMuted }}>EX</div>
              </div>
              <div style={{ color: C.textMuted, fontSize: "16px" }}>
                {expanded === workout.id ? "↑" : "↓"}
              </div>
            </div>
          </div>

          {/* Muscle tags */}
          {workout.muscles?.length > 0 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "10px", flexWrap: "wrap" }} data-testid={`workout-muscles-${idx}`}>
              {workout.muscles.map((m) => (
                <span key={m} style={s.tag()}>{m}</span>
              ))}
            </div>
          )}

          {/* Expanded detail */}
          {expanded === workout.id && (
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }} data-testid={`workout-detail-${idx}`}>

              {/* Exercises */}
              {workout.exercises?.map((ex) => (
                <div key={ex.id} style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: C.accent, marginBottom: "6px" }}>
                    {ex.name}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr", gap: "4px", marginBottom: "4px" }}>
                    {["SET", "REPS", "LBS"].map((h) => (
                      <div key={h} style={{ fontSize: "8px", color: C.textMuted }}>{h}</div>
                    ))}
                  </div>
                  {ex.sets?.map((set, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr", gap: "4px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "12px", color: C.textDim }}>{i + 1}</div>
                      <div style={{ fontSize: "12px" }}>{set.reps}</div>
                      <div style={{ fontSize: "12px" }}>{set.weight || "BW"}</div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Recovery factors */}
              <div style={{ display: "flex", gap: "14px", paddingTop: "10px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
                {workout.sleep && (
                  <span style={{ fontSize: "11px", color: C.textMuted }}>
                    😴 {workout.sleep}h sleep
                  </span>
                )}
                {workout.diet && (
                  <span style={{ fontSize: "11px", color: C.textMuted }}>
                    🍽 {workout.diet}
                  </span>
                )}
                {workout.notes && (
                  <span style={{ fontSize: "11px", color: C.textDim, fontStyle: "italic" }}>
                    "{workout.notes}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}