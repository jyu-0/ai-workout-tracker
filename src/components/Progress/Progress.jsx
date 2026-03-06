import { useState, useEffect } from "react";
import { loadWorkoutsFromStorage } from "../LogWorkout/LogWorkout";

// ── STYLES ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", surface: "#111111", surfaceAlt: "#1a1a1a",
  border: "#222222", accent: "#e8ff00", text: "#f0f0f0",
  textMuted: "#666666", textDim: "#999999", green: "#00e676",
};

const s = {
  page: { padding: "24px 20px 100px", fontFamily: "'DM Mono', 'Courier New', monospace", color: C.text, background: C.bg, minHeight: "100vh" },
  label: { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, marginBottom: "6px", display: "block" },
  accentBar: { width: "32px", height: "3px", background: C.accent, marginBottom: "20px" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: "2px", padding: "16px", marginBottom: "10px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: "12px" },
};

// ── PR CALCULATOR ──────────────────────────────────────────────────────────

// For each exercise, find the heaviest set across all workouts
// Returns an array of { exercise, weight, date } sorted by exercise name
export const calculatePRs = (workouts) => {
  const prMap = {};

  workouts.forEach((workout) => {
    workout.exercises?.forEach((ex) => {
      if (!ex.name) return;

      ex.sets?.forEach((set) => {
        const weight = Number(set.weight);
        if (!weight || isNaN(weight)) return; // skip bodyweight or empty

        if (!prMap[ex.name] || weight > prMap[ex.name].weight) {
          prMap[ex.name] = {
            exercise: ex.name,
            weight,
            date: workout.date,
          };
        }
      });
    });
  });

  // Sort alphabetically by exercise name
  return Object.values(prMap).sort((a, b) => a.exercise.localeCompare(b.exercise));
};

// Calculate total volume (sets x reps x weight) per workout for the chart
export const calculateWeeklyVolume = (workouts) => {
  return workouts
    .slice()
    .reverse() // oldest first for chart display
    .slice(-6) // last 6 workouts
    .map((workout, idx) => {
      const volume = workout.exercises?.reduce((total, ex) => {
        return total + ex.sets?.reduce((setTotal, set) => {
          return setTotal + (Number(set.reps) || 0) * (Number(set.weight) || 0);
        }, 0);
      }, 0) || 0;

      return {
        label: `S${idx + 1}`,
        volume,
        date: workout.date,
        name: workout.name,
      };
    });
};

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [prs, setPRs] = useState([]);
  const [volumeData, setVolumeData] = useState([]);

  useEffect(() => {
    const stored = loadWorkoutsFromStorage();
    setWorkouts(stored);
    setPRs(calculatePRs(stored));
    setVolumeData(calculateWeeklyVolume(stored));
  }, []);

  // ── Empty state ────────────────────────────────────────────────────────
  if (workouts.length === 0) {
    return (
      <div style={s.page}>
        <span style={s.label}>Performance</span>
        <div style={s.accentBar} />
        <div style={s.emptyState} data-testid="empty-state">
          <div style={{ fontSize: "48px" }}>📈</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: C.accent }}>NO DATA YET</div>
          <div style={{ fontSize: "12px", color: C.textMuted, maxWidth: "200px", lineHeight: 1.6 }}>
            Log some workouts and your PRs will appear here
          </div>
        </div>
      </div>
    );
  }

  const maxVolume = Math.max(...volumeData.map((d) => d.volume), 1);

  return (
    <div style={s.page}>
      <span style={s.label}>Performance</span>
      <div style={s.accentBar} />

      {/* Volume Chart */}
      {volumeData.length > 0 && (
        <>
          <span style={s.label}>Session Volume (lbs lifted)</span>
          <div style={{ ...s.card, marginBottom: "24px" }} data-testid="volume-chart">
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
              {volumeData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div
                    data-testid={`volume-bar-${i}`}
                    title={`${d.name}: ${d.volume.toLocaleString()} lbs`}
                    style={{
                      width: "100%",
                      background: C.accent,
                      borderRadius: "2px 2px 0 0",
                      height: `${(d.volume / maxVolume) * 70}px`,
                      opacity: i === volumeData.length - 1 ? 1 : 0.4,
                      minHeight: "4px",
                      transition: "height 0.3s",
                    }}
                  />
                  <div style={{ fontSize: "8px", color: C.textMuted }}>{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "11px", color: C.textMuted }}>
              {volumeData.length} session{volumeData.length !== 1 ? "s" : ""} tracked
            </div>
          </div>
        </>
      )}

      {/* Personal Records */}
      <span style={s.label}>Personal Records</span>

      {prs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", color: C.textMuted, fontSize: "12px", padding: "24px" }} data-testid="no-prs">
          No weighted exercises logged yet
        </div>
      ) : (
        <div data-testid="pr-list">
          {prs.map((pr) => (
            <div key={pr.exercise} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }} data-testid={`pr-${pr.exercise.replace(/\s+/g, "-").toLowerCase()}`}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{pr.exercise}</div>
                <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>{pr.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "700", color: C.accent, lineHeight: 1 }} data-testid={`pr-weight-${pr.exercise.replace(/\s+/g, "-").toLowerCase()}`}>
                  {pr.weight}
                </div>
                <div style={{ fontSize: "9px", color: C.textMuted }}>LBS</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Muscle frequency */}
      {workouts.length > 0 && (
        <>
          <span style={{ ...s.label, marginTop: "8px" }}>Muscle Frequency</span>
          <div style={s.card} data-testid="muscle-frequency">
            {(() => {
              const muscleCounts = {};
              workouts.forEach((w) => w.muscles?.forEach((m) => { muscleCounts[m] = (muscleCounts[m] || 0) + 1; }));
              const max = Math.max(...Object.values(muscleCounts), 1);
              return Object.entries(muscleCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([muscle, count]) => (
                  <div key={muscle} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                      <span>{muscle}</span>
                      <span style={{ color: C.accent }}>{count}x</span>
                    </div>
                    <div style={{ height: "4px", background: C.surfaceAlt, borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: C.accent, borderRadius: "2px", opacity: 0.8 }} />
                    </div>
                  </div>
                ));
            })()}
          </div>
        </>
      )}
    </div>
  );
}