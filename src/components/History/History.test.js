import { render, screen, fireEvent } from "@testing-library/react";
import History from "./History";
import { saveWorkoutToStorage } from "../LogWorkout/LogWorkout";

// ── Mock localStorage ──────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
});

// ── Mock workout data ──────────────────────────────────────────────────────
const mockWorkout1 = {
  id: "1",
  name: "Push Day",
  date: "Mar 4, 2026",
  muscles: ["Chest", "Shoulders", "Triceps"],
  exercises: [
    { id: "e1", name: "Bench Press", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }] },
    { id: "e2", name: "Overhead Press", sets: [{ reps: 10, weight: 115 }] },
  ],
  sleep: 7,
  diet: "Clean",
  notes: "Felt strong today",
};

const mockWorkout2 = {
  id: "2",
  name: "Pull Day",
  date: "Mar 2, 2026",
  muscles: ["Back", "Biceps"],
  exercises: [
    { id: "e3", name: "Deadlift", sets: [{ reps: 5, weight: 315 }] },
  ],
  sleep: 6,
  diet: "Junk food",
  notes: "",
};

// ── Tests ──────────────────────────────────────────────────────────────────
describe("History component", () => {

  // US-02: Shows empty state when no workouts logged
  test("US-02: shows empty state when no workouts exist", () => {
    render(<History />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO SESSIONS YET")).toBeInTheDocument();
  });

  // US-02: Loads workouts from localStorage
  test("US-02: loads and displays workouts from localStorage", () => {
    saveWorkoutToStorage(mockWorkout2);
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    expect(screen.getByTestId("workout-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("workout-card-1")).toBeInTheDocument();
  });

  // US-02: Most recent workout appears first
  test("US-02: most recent workout appears first", () => {
    saveWorkoutToStorage(mockWorkout2); // saved first = older
    saveWorkoutToStorage(mockWorkout1); // saved second = newer
    render(<History />);
    expect(screen.getByTestId("workout-name-0").textContent).toBe("Push Day");
    expect(screen.getByTestId("workout-name-1").textContent).toBe("Pull Day");
  });

  // US-02: Each workout shows name
  test("US-02: each workout shows the session name", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    expect(screen.getByText("Push Day")).toBeInTheDocument();
  });

  // US-02: Each workout shows date
  test("US-02: each workout shows the date", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    expect(screen.getByTestId("workout-date-0").textContent).toBe("Mar 4, 2026");
  });

  // US-02: Each workout shows muscles hit
  test("US-02: each workout shows muscles targeted", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    const musclesEl = screen.getByTestId("workout-muscles-0");
    expect(musclesEl).toBeInTheDocument();
    expect(musclesEl.textContent).toContain("Chest");
    expect(musclesEl.textContent).toContain("Shoulders");
  });

  // US-02: Workout detail is hidden by default
  test("US-02: exercise detail is hidden by default", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    expect(screen.queryByTestId("workout-detail-0")).not.toBeInTheDocument();
  });

  // US-02: User can expand a workout to see exercises
  test("US-02: user can expand a workout to see exercise detail", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    fireEvent.click(screen.getByTestId("workout-card-0"));
    expect(screen.getByTestId("workout-detail-0")).toBeInTheDocument();
  });

  // US-02: Expanded workout shows exercise names
  test("US-02: expanded workout shows exercise names", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    fireEvent.click(screen.getByTestId("workout-card-0"));
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Overhead Press")).toBeInTheDocument();
  });

  // US-02: Expanded workout shows sets, reps and weight
  test("US-02: expanded workout shows reps and weight for each set", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    fireEvent.click(screen.getByTestId("workout-card-0"));
    const detail = screen.getByTestId("workout-detail-0");
    expect(detail.textContent).toContain("8");   // reps
    expect(detail.textContent).toContain("185"); // weight
  });

  // US-02: User can collapse an expanded workout
  test("US-02: user can collapse an expanded workout", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    fireEvent.click(screen.getByTestId("workout-card-0")); // expand
    fireEvent.click(screen.getByTestId("workout-card-0")); // collapse
    expect(screen.queryByTestId("workout-detail-0")).not.toBeInTheDocument();
  });

  // US-02: Session count is displayed
  test("US-02: shows correct session count", () => {
    saveWorkoutToStorage(mockWorkout1);
    saveWorkoutToStorage(mockWorkout2);
    render(<History />);
    expect(screen.getByText("2 sessions logged")).toBeInTheDocument();
  });

  // US-02: Singular session count
  test("US-02: shows singular 'session' when only one workout", () => {
    saveWorkoutToStorage(mockWorkout1);
    render(<History />);
    expect(screen.getByText("1 session logged")).toBeInTheDocument();
  });
});