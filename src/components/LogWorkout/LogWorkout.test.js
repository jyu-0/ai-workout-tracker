import { render, screen, fireEvent } from "@testing-library/react";
import LogWorkout, { validateWorkout, saveWorkoutToStorage, loadWorkoutsFromStorage } from "./LogWorkout";

// ── Mock localStorage ──────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  window.scrollTo = jest.fn();

});

// ── validateWorkout() unit tests ───────────────────────────────────────────
describe("validateWorkout()", () => {
  const baseWorkout = {
    name: "Push Day",
    muscles: ["Chest"],
    exercises: [{ id: 1, name: "Bench Press", sets: [{ reps: 8, weight: 185 }] }],
  };

  test("returns no errors for a valid workout", () => {
    const errors = validateWorkout(baseWorkout);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("returns error if session name is empty", () => {
    const errors = validateWorkout({ ...baseWorkout, name: "" });
    expect(errors.name).toBe("Session name is required");
  });

  test("returns error if session name is only whitespace", () => {
    const errors = validateWorkout({ ...baseWorkout, name: "   " });
    expect(errors.name).toBe("Session name is required");
  });

  test("returns error if no muscle groups selected", () => {
    const errors = validateWorkout({ ...baseWorkout, muscles: [] });
    expect(errors.muscles).toBe("Select at least one muscle group");
  });

  test("returns error if no exercises added", () => {
    const errors = validateWorkout({ ...baseWorkout, exercises: [] });
    expect(errors.exercises).toBe("Add at least one exercise");
  });

  test("returns error if exercise has no name selected", () => {
    const workout = { ...baseWorkout, exercises: [{ id: 1, name: "", sets: [{ reps: 8, weight: 0 }] }] };
    const errors = validateWorkout(workout);
    expect(errors["exercise_0_name"]).toBe("Select an exercise");
  });

  test("returns error if a set has no reps", () => {
    const workout = { ...baseWorkout, exercises: [{ id: 1, name: "Bench Press", sets: [{ reps: "", weight: 185 }] }] };
    const errors = validateWorkout(workout);
    expect(errors["exercise_0_set_0_reps"]).toBe("Enter valid reps");
  });

  test("returns error if reps is zero or negative", () => {
    const workout = { ...baseWorkout, exercises: [{ id: 1, name: "Bench Press", sets: [{ reps: 0, weight: 185 }] }] };
    const errors = validateWorkout(workout);
    expect(errors["exercise_0_set_0_reps"]).toBe("Enter valid reps");
  });
});

// ── localStorage helpers unit tests ───────────────────────────────────────
describe("saveWorkoutToStorage() and loadWorkoutsFromStorage()", () => {
  const mockWorkout = { id: "1", name: "Push Day", muscles: ["Chest"], exercises: [], date: "Mar 6, 2026" };

  test("saves a workout to localStorage", () => {
    saveWorkoutToStorage(mockWorkout);
    const stored = JSON.parse(localStorage.getItem("workouts"));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Push Day");
  });

  test("prepends new workout to existing workouts", () => {
    saveWorkoutToStorage({ ...mockWorkout, id: "1", name: "Push Day" });
    saveWorkoutToStorage({ ...mockWorkout, id: "2", name: "Pull Day" });
    const stored = loadWorkoutsFromStorage();
    expect(stored[0].name).toBe("Pull Day"); // most recent first
    expect(stored[1].name).toBe("Push Day");
  });

  test("loadWorkoutsFromStorage returns empty array when nothing saved", () => {
    const result = loadWorkoutsFromStorage();
    expect(result).toEqual([]);
  });

  test("loadWorkoutsFromStorage returns all saved workouts", () => {
    saveWorkoutToStorage(mockWorkout);
    const result = loadWorkoutsFromStorage();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

// ── LogWorkout UI tests ────────────────────────────────────────────────────
describe("LogWorkout component", () => {

  // US-01: User can enter a workout name
  test("US-01: renders session name input", () => {
    render(<LogWorkout />);
    const input = screen.getByTestId("workout-name");
    expect(input).toBeInTheDocument();
  });

  test("US-01: user can type a session name", () => {
    render(<LogWorkout />);
    const input = screen.getByTestId("workout-name");
    fireEvent.change(input, { target: { value: "Push Day" } });
    expect(input.value).toBe("Push Day");
  });

  // US-01: User can select muscle groups
  test("US-01: renders muscle group buttons", () => {
    render(<LogWorkout />);
    expect(screen.getByTestId("muscle-Chest")).toBeInTheDocument();
    expect(screen.getByTestId("muscle-Back")).toBeInTheDocument();
  });

  test("US-01: user can select a muscle group", () => {
    render(<LogWorkout />);
    const chestBtn = screen.getByTestId("muscle-Chest");
    fireEvent.click(chestBtn);
    expect(chestBtn).toHaveStyle({ color: "#e8ff00" });
  });

  // US-01: User can add an exercise
  test("US-01: renders at least one exercise card by default", () => {
    render(<LogWorkout />);
    expect(screen.getByTestId("exercise-card-0")).toBeInTheDocument();
  });

  test("US-01: user can add an exercise", () => {
    render(<LogWorkout />);
    const addBtn = screen.getByTestId("add-exercise");
    fireEvent.click(addBtn);
    expect(screen.getByTestId("exercise-card-1")).toBeInTheDocument();
  });

  test("US-01: user can remove an exercise when more than one exists", () => {
    render(<LogWorkout />);
    fireEvent.click(screen.getByTestId("add-exercise")); // now 2 exercises
    expect(screen.getByTestId("exercise-card-1")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("remove-exercise-0"));
    expect(screen.queryByTestId("exercise-card-1")).not.toBeInTheDocument();
  });

  // US-01: User can add sets with reps and weight
  test("US-01: user can enter reps for a set", () => {
    render(<LogWorkout />);
    const repsInput = screen.getByTestId("set-0-0-reps");
    fireEvent.change(repsInput, { target: { value: "8" } });
    expect(repsInput.value).toBe("8");
  });

  test("US-01: user can enter weight for a set", () => {
    render(<LogWorkout />);
    const weightInput = screen.getByTestId("set-0-0-weight");
    fireEvent.change(weightInput, { target: { value: "185" } });
    expect(weightInput.value).toBe("185");
  });

  test("US-01: user can add a set to an exercise", () => {
    render(<LogWorkout />);
    fireEvent.click(screen.getByTestId("add-set-0"));
    expect(screen.getByTestId("set-0-1-reps")).toBeInTheDocument();
  });

  // US-01: Validation errors shown on empty save
  test("US-01: shows error if saving with no session name", () => {
    render(<LogWorkout />);
    fireEvent.click(screen.getByTestId("save-workout"));
    expect(screen.getByText("Session name is required")).toBeInTheDocument();
  });

  test("US-01: shows error if saving with no muscles selected", () => {
    render(<LogWorkout />);
    fireEvent.change(screen.getByTestId("workout-name"), { target: { value: "Push Day" } });
    fireEvent.click(screen.getByTestId("save-workout"));
    expect(screen.getByText("Select at least one muscle group")).toBeInTheDocument();
  });

  // US-01: Saving stores the workout
  test("US-01: saves workout to localStorage on valid submit", () => {
    render(<LogWorkout />);

    fireEvent.change(screen.getByTestId("workout-name"), { target: { value: "Push Day" } });
    fireEvent.click(screen.getByTestId("muscle-Chest"));
    fireEvent.change(screen.getByTestId("exercise-name-0"), { target: { value: "Bench Press" } });
    fireEvent.change(screen.getByTestId("set-0-0-reps"), { target: { value: "8" } });
    fireEvent.change(screen.getByTestId("set-0-0-weight"), { target: { value: "185" } });
    fireEvent.click(screen.getByTestId("save-workout"));

    const saved = loadWorkoutsFromStorage();
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Push Day");
    expect(saved[0].muscles).toContain("Chest");
  });
});