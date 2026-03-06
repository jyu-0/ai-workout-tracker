import { render, screen, fireEvent } from "@testing-library/react";
import Progress, { calculatePRs, calculateWeeklyVolume } from "./Progress";
import { saveWorkoutToStorage } from "../LogWorkout/LogWorkout";

// ── Mock localStorage ──────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
});

// ── Mock workout data ──────────────────────────────────────────────────────
const workoutA = {
  id: "1",
  name: "Push Day",
  date: "Mar 4, 2026",
  muscles: ["Chest", "Shoulders"],
  exercises: [
    { id: "e1", name: "Bench Press", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }] },
    { id: "e2", name: "Overhead Press", sets: [{ reps: 10, weight: 115 }] },
  ],
};

const workoutB = {
  id: "2",
  name: "Push Day 2",
  date: "Mar 6, 2026",
  muscles: ["Chest", "Triceps"],
  exercises: [
    // Bench Press with a new PR — heavier than workoutA
    { id: "e3", name: "Bench Press", sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 205 }] },
    { id: "e4", name: "Tricep Pushdown", sets: [{ reps: 12, weight: 60 }] },
  ],
};

const workoutBodyweight = {
  id: "3",
  name: "Bodyweight Day",
  date: "Mar 5, 2026",
  muscles: ["Back"],
  exercises: [
    // Pull-ups with no weight — should not appear in PRs
    { id: "e5", name: "Pull-ups", sets: [{ reps: 10, weight: "" }, { reps: 8, weight: "" }] },
  ],
};

// ── calculatePRs() unit tests ──────────────────────────────────────────────
describe("calculatePRs()", () => {

  test("returns empty array when no workouts", () => {
    expect(calculatePRs([])).toEqual([]);
  });

  test("returns a PR for each weighted exercise", () => {
    const prs = calculatePRs([workoutA]);
    expect(prs).toHaveLength(2);
  });

  test("PR weight is the heaviest set across all workouts", () => {
    const prs = calculatePRs([workoutA, workoutB]);
    const benchPR = prs.find((p) => p.exercise === "Bench Press");
    expect(benchPR.weight).toBe(225); // workoutB has 225, higher than workoutA's 185
  });

  test("PR date reflects the workout where the PR was set", () => {
    const prs = calculatePRs([workoutA, workoutB]);
    const benchPR = prs.find((p) => p.exercise === "Bench Press");
    expect(benchPR.date).toBe("Mar 6, 2026"); // workoutB's date
  });

  test("ignores bodyweight exercises with no weight", () => {
    const prs = calculatePRs([workoutBodyweight]);
    expect(prs).toHaveLength(0);
  });

  test("returns PRs sorted alphabetically by exercise name", () => {
    const prs = calculatePRs([workoutA, workoutB]);
    const names = prs.map((p) => p.exercise);
    expect(names).toEqual([...names].sort());
  });

  test("handles multiple exercises across multiple workouts", () => {
    const prs = calculatePRs([workoutA, workoutB]);
    const exerciseNames = prs.map((p) => p.exercise);
    expect(exerciseNames).toContain("Bench Press");
    expect(exerciseNames).toContain("Overhead Press");
    expect(exerciseNames).toContain("Tricep Pushdown");
  });

  test("correctly identifies PR when earlier workout had heavier weight", () => {
    const prs = calculatePRs([workoutB, workoutA]); // reversed order
    const benchPR = prs.find((p) => p.exercise === "Bench Press");
    expect(benchPR.weight).toBe(225); // still 225 regardless of order
  });
});

// ── calculateWeeklyVolume() unit tests ────────────────────────────────────
describe("calculateWeeklyVolume()", () => {

  test("returns empty array for no workouts", () => {
    expect(calculateWeeklyVolume([])).toEqual([]);
  });

  test("calculates volume as sets x reps x weight", () => {
    const data = calculateWeeklyVolume([workoutA]);
    // Bench: 8x185 + 8x185 = 2960, OHP: 10x115 = 1150, total = 4110
    expect(data[0].volume).toBe(4110);
  });

  test("returns max 6 sessions", () => {
    const manyWorkouts = Array.from({ length: 10 }, (_, i) => ({
      ...workoutA,
      id: String(i),
      date: `Mar ${i + 1}, 2026`,
    }));
    const data = calculateWeeklyVolume(manyWorkouts);
    expect(data.length).toBeLessThanOrEqual(6);
  });

  test("labels sessions as S1, S2, S3...", () => {
    const data = calculateWeeklyVolume([workoutA, workoutB]);
    expect(data[0].label).toBe("S1");
    expect(data[1].label).toBe("S2");
  });
});

// ── Progress UI tests ──────────────────────────────────────────────────────
describe("Progress component", () => {

  // US-03: Empty state when no workouts
  test("US-03: shows empty state when no workouts exist", () => {
    render(<Progress />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO DATA YET")).toBeInTheDocument();
  });

  // US-03: Shows PRs calculated from real data
    test("US-03: shows the date the PR was set", () => {
    saveWorkoutToStorage(workoutA);
    render(<Progress />);
    const dates = screen.getAllByText("Mar 4, 2026");
    expect(dates.length).toBeGreaterThan(0);
    });

  // US-03: Shows correct PR weight for each exercise
  test("US-03: shows correct PR weight for bench press", () => {
    saveWorkoutToStorage(workoutA);
    saveWorkoutToStorage(workoutB);
    render(<Progress />);
    const benchWeight = screen.getByTestId("pr-weight-bench-press");
    expect(benchWeight.textContent).toBe("225");
  });

  // US-03: Shows the date the PR was set
  test("US-03: shows the date the PR was set", () => {
    saveWorkoutToStorage(workoutA);
    render(<Progress />);
    const dates = screen.getAllByText("Mar 4, 2026");
    expect(dates.length).toBeGreaterThan(0);
});

  // US-03: PRs update when new heavier workout is added
  test("US-03: PR updates when a heavier workout is logged", () => {
    saveWorkoutToStorage(workoutB); // has 225 bench
    saveWorkoutToStorage(workoutA); // has 185 bench — older, lower
    render(<Progress />);
    const benchWeight = screen.getByTestId("pr-weight-bench-press");
    expect(benchWeight.textContent).toBe("225"); // should still show 225
  });

  // US-03: Bodyweight exercises don't appear in PRs
  test("US-03: bodyweight exercises do not appear in PR list", () => {
    saveWorkoutToStorage(workoutBodyweight);
    render(<Progress />);
    expect(screen.getByTestId("no-prs")).toBeInTheDocument();
  });

  // US-03: Volume chart renders
  test("US-03: renders volume chart when workouts exist", () => {
    saveWorkoutToStorage(workoutA);
    render(<Progress />);
    expect(screen.getByTestId("volume-chart")).toBeInTheDocument();
  });

  // US-03: Muscle frequency renders
  test("US-03: renders muscle frequency section", () => {
    saveWorkoutToStorage(workoutA);
    render(<Progress />);
    expect(screen.getByTestId("muscle-frequency")).toBeInTheDocument();
  });
});