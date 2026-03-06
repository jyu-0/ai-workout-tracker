import { useState } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const EXERCISES = [
  "Bench Press", "Incline Press", "Overhead Press", "Squat", "Deadlift",
  "Romanian Deadlift", "Barbell Row", "Pull-ups", "Lat Pulldown",
  "Tricep Pushdown", "Dumbbell Curl", "Leg Press", "Hip Thrust", "Plank",
];

const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Quads", "Hamstrings", "Glutes", "Core", "Calves",
];

const DIET_OPTIONS = ["Clean", "Moderate", "Junk food", "Fasted"];

// ── STYLES ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", surface: "#111111", surfaceAlt: "#1a1a1a",
  border: "#222222", accent: "#e8ff00", text: "#f0f0f0",
  textMuted: "#666666", textDim: "#999999", red: "#ff3b3b", green: "#00e676",
};

const s = {
  page: { padding: "24px 20px 100px", fontFamily: "'DM Mono', 'Courier New', monospace", color: C.text, background: C.bg, minHeight: "100vh" },
  label: { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, marginBottom: "6px", display: "block" },
  accentBar: { width: "32px", height: "3px", background: C.accent, marginBottom: "20px" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: "2px", padding: "16px", marginBottom: "10px" },
  input: { background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "2px", color: C.text, fontFamily: "'DM Mono', monospace", fontSize: "14px", padding: "10px 12px", width: "100%", outline: "none", boxSizing: "border-box" },
  inputError: { border: `1px solid ${C.red}` },
  btn: (v = "primary") => ({ background: v === "primary" ? C.accent : "transparent", color: v === "primary" ? "#000" : C.accent, border: v === "primary" ? "none" : `1px solid ${C.accent}`, borderRadius: "2px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer", fontWeight: "700" }),
  tag: (active) => ({ background: active ? `${C.accent}20` : "transparent", color: active ? C.accent : C.textMuted, border: `1px solid ${active ? C.accent : C.border}`, borderRadius: "2px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }),
  error: { color: C.red, fontSize: "10px", letterSpacing: "0.08em", marginTop: "4px", display: "block" },
};

// ── HELPERS ────────────────────────────────────────────────────────────────

// Save a new workout to localStorage, merging with existing workouts
export const saveWorkoutToStorage = (workout) => {
  const existing = JSON.parse(localStorage.getItem("workouts") || "[]");
  const updated = [workout, ...existing];
  localStorage.setItem("workouts", JSON.stringify(updated));
  return updated;
};

// Load all workouts from localStorage
export const loadWorkoutsFromStorage = () => {
  return JSON.parse(localStorage.getItem("workouts") || "[]");
};

// Validate the workout form — returns an errors object
export const validateWorkout = (workout) => {
  const errors = {};

  if (!workout.name.trim()) {
    errors.name = "Session name is required";
  }

  if (workout.muscles.length === 0) {
    errors.muscles = "Select at least one muscle group";
  }

  if (workout.exercises.length === 0) {
    errors.exercises = "Add at least one exercise";
  }

  workout.exercises.forEach((ex, i) => {
    if (!ex.name) {
      errors[`exercise_${i}_name`] = "Select an exercise";
    }
    ex.sets.forEach((set, j) => {
      if (!set.reps || isNaN(set.reps) || Number(set.reps) <= 0) {
        errors[`exercise_${i}_set_${j}_reps`] = "Enter valid reps";
      }
    });
  });

  return errors;
};

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function LogWorkout({ onComplete }) {
  const [workout, setWorkout] = useState({
    name: "",
    muscles: [],
    exercises: [{ id: Date.now(), name: "", sets: [{ reps: "", weight: "" }] }],
    sleep: "",
    diet: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // ── State updaters ──────────────────────────────────────────────────────

  const setName = (val) => {
    setWorkout((w) => ({ ...w, name: val }));
    if (errors.name) setErrors((e) => ({ ...e, name: null }));
  };

  const toggleMuscle = (muscle) => {
    setWorkout((w) => ({
      ...w,
      muscles: w.muscles.includes(muscle)
        ? w.muscles.filter((m) => m !== muscle)
        : [...w.muscles, muscle],
    }));
    if (errors.muscles) setErrors((e) => ({ ...e, muscles: null }));
  };

  const addExercise = () => {
    setWorkout((w) => ({
      ...w,
      exercises: [...w.exercises, { id: Date.now(), name: "", sets: [{ reps: "", weight: "" }] }],
    }));
    if (errors.exercises) setErrors((e) => ({ ...e, exercises: null }));
  };

  const removeExercise = (id) => {
    setWorkout((w) => ({ ...w, exercises: w.exercises.filter((ex) => ex.id !== id) }));
  };

  const updateExerciseName = (id, name) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) => ex.id === id ? { ...ex, name } : ex),
    }));
  };

  const addSet = (id) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) =>
        ex.id === id ? { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] } : ex
      ),
    }));
  };

  const removeSet = (exId, setIdx) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) } : ex
      ),
    }));
  };

  const updateSet = (exId, setIdx, field, val) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.map((s, i) => i === setIdx ? { ...s, [field]: val } : s) }
          : ex
      ),
    }));
  };

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const validationErrors = validateWorkout(workout);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sleep: workout.sleep ? Number(workout.sleep) : null,
    };

    saveWorkoutToStorage(newWorkout);
    setSaved(true);
    setTimeout(() => onComplete && onComplete(), 1500);
  };

  // ── Success screen ──────────────────────────────────────────────────────

  if (saved) {
    return (
      <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>💪</div>
        <div style={{ fontSize: "20px", fontWeight: "700", color: C.accent, letterSpacing: "0.05em" }}>SESSION LOGGED</div>
        <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>Saved to your history. Rest up.</div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <span style={s.label}>New Session</span>
      <div style={s.accentBar} />

      {/* Global error summary */}
      {Object.keys(errors).length > 0 && (
        <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, borderRadius: "2px", padding: "12px 16px", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", color: C.red, letterSpacing: "0.08em" }}>
            ⚠ Please fix the errors below before saving
          </span>
        </div>
      )}

      {/* Session Name */}
      <div style={{ marginBottom: "16px" }}>
        <span style={s.label}>Session Name *</span>
        <input
          data-testid="workout-name"
          style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
          placeholder="e.g. Push Day, Leg Day..."
          value={workout.name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span style={s.error}>{errors.name}</span>}
      </div>

      {/* Muscle Groups */}
      <div style={{ marginBottom: "20px" }}>
        <span style={s.label}>Muscles Targeted *</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m}
              data-testid={`muscle-${m}`}
              onClick={() => toggleMuscle(m)}
              style={s.tag(workout.muscles.includes(m))}
            >
              {m}
            </button>
          ))}
        </div>
        {errors.muscles && <span style={s.error}>{errors.muscles}</span>}
      </div>

      {/* Exercises */}
      <span style={s.label}>Exercises *</span>
      {errors.exercises && <span style={{ ...s.error, marginBottom: "8px" }}>{errors.exercises}</span>}

      {workout.exercises.map((ex, exIdx) => (
        <div key={ex.id} style={s.card} data-testid={`exercise-card-${exIdx}`}>
          {/* Exercise name + remove */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
            <select
              data-testid={`exercise-name-${exIdx}`}
              style={{ ...s.input, flex: 1, ...(errors[`exercise_${exIdx}_name`] ? s.inputError : {}) }}
              value={ex.name}
              onChange={(e) => updateExerciseName(ex.id, e.target.value)}
            >
              <option value="">Select exercise...</option>
              {EXERCISES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {workout.exercises.length > 1 && (
              <button
                data-testid={`remove-exercise-${exIdx}`}
                onClick={() => removeExercise(ex.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: "4px", fontSize: "16px" }}
              >
                ✕
              </button>
            )}
          </div>
          {errors[`exercise_${exIdx}_name`] && <span style={s.error}>{errors[`exercise_${exIdx}_name`]}</span>}

          {/* Set headers */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 28px", gap: "6px", marginBottom: "6px" }}>
            {["SET", "REPS *", "WEIGHT (LBS)", ""].map((h) => (
              <div key={h} style={{ fontSize: "8px", color: C.textMuted, textAlign: "center" }}>{h}</div>
            ))}
          </div>

          {/* Sets */}
          {ex.sets.map((set, setIdx) => (
            <div key={setIdx} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 28px", gap: "6px", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: C.accent, fontWeight: "700" }}>
                {setIdx + 1}
              </div>
              <input
                type="number"
                data-testid={`set-${exIdx}-${setIdx}-reps`}
                style={{ ...s.input, textAlign: "center", ...(errors[`exercise_${exIdx}_set_${setIdx}_reps`] ? s.inputError : {}) }}
                placeholder="—"
                value={set.reps}
                onChange={(e) => updateSet(ex.id, setIdx, "reps", e.target.value)}
              />
              <input
                type="number"
                data-testid={`set-${exIdx}-${setIdx}-weight`}
                style={{ ...s.input, textAlign: "center" }}
                placeholder="—"
                value={set.weight}
                onChange={(e) => updateSet(ex.id, setIdx, "weight", e.target.value)}
              />
              <button
                onClick={() => ex.sets.length > 1 && removeSet(ex.id, setIdx)}
                style={{ background: "none", border: "none", cursor: ex.sets.length > 1 ? "pointer" : "default", color: ex.sets.length > 1 ? C.textMuted : "transparent", fontSize: "12px" }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            data-testid={`add-set-${exIdx}`}
            onClick={() => addSet(ex.id)}
            style={{ ...s.btn("outline"), width: "100%", marginTop: "8px", fontSize: "10px", padding: "7px" }}
          >
            + ADD SET
          </button>
        </div>
      ))}

      <button
        data-testid="add-exercise"
        onClick={addExercise}
        style={{ ...s.btn("outline"), width: "100%", marginBottom: "24px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
      >
        + ADD EXERCISE
      </button>

      {/* Recovery Inputs */}
      <span style={s.label}>Recovery Factors</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div>
          <span style={s.label}>Sleep (hrs)</span>
          <input
            type="number"
            data-testid="sleep-input"
            style={s.input}
            placeholder="7"
            min="0" max="24"
            value={workout.sleep}
            onChange={(e) => setWorkout((w) => ({ ...w, sleep: e.target.value }))}
          />
        </div>
        <div>
          <span style={s.label}>Diet Quality</span>
          <select
            data-testid="diet-input"
            style={s.input}
            value={workout.diet}
            onChange={(e) => setWorkout((w) => ({ ...w, diet: e.target.value }))}
          >
            <option value="">Select...</option>
            {DIET_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <span style={s.label}>Notes / How you felt</span>
        <textarea
          data-testid="notes-input"
          style={{ ...s.input, minHeight: "70px", resize: "vertical" }}
          placeholder="Felt strong today, PR on bench..."
          value={workout.notes}
          onChange={(e) => setWorkout((w) => ({ ...w, notes: e.target.value }))}
        />
      </div>

      <button
        data-testid="save-workout"
        onClick={handleSave}
        style={{ ...s.btn("primary"), width: "100%", padding: "16px", fontSize: "13px" }}
      >
        FINISH & LOG SESSION
      </button>
    </div>
  );
}