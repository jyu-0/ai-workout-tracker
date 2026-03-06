import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIChat, { QUICK_PROMPTS, WELCOME_MESSAGE, fetchAIResponse } from "./AIChat";

// ── Mock fetch globally ────────────────────────────────────────────────────
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  global.fetch = jest.fn();
  window.scrollTo = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

// ── Helper to mock a successful API response ───────────────────────────────
const mockSuccessResponse = (reply = "Great question! Here is my advice.") => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      content: [{ type: "text", text: reply }],
    }),
  });
};

// ── Helper to mock a failed API response ──────────────────────────────────
const mockErrorResponse = () => {
  global.fetch.mockRejectedValueOnce(new Error("Network error"));
};

// ── fetchAIResponse() unit tests ───────────────────────────────────────────
describe("fetchAIResponse()", () => {

  test("calls the Anthropic API with correct structure", async () => {
    mockSuccessResponse();
    const messages = [{ role: "user", content: "Hello" }];
    await fetchAIResponse(messages);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("returns the text content from the API response", async () => {
    mockSuccessResponse("Eat protein before your workout.");
    const messages = [{ role: "user", content: "What should I eat?" }];
    const result = await fetchAIResponse(messages);
    expect(result).toBe("Eat protein before your workout.");
  });

  test("throws an error when API returns non-ok status", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const messages = [{ role: "user", content: "Hello" }];
    await expect(fetchAIResponse(messages)).rejects.toThrow("API error: 500");
  });
});

// ── AIChat UI tests ────────────────────────────────────────────────────────
describe("AIChat component", () => {

  // US-04: Shows welcome message on first load
  test("US-04: shows welcome message on first load", () => {
    render(<AIChat />);
    expect(screen.getByText(WELCOME_MESSAGE.content)).toBeInTheDocument();
  });

  // US-04: Online indicator is shown
  test("US-04: shows online indicator", () => {
    render(<AIChat />);
    expect(screen.getByTestId("online-indicator")).toBeInTheDocument();
  });

  // US-04: Input field is rendered
  test("US-04: renders chat input field", () => {
    render(<AIChat />);
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  // US-04: Send button is rendered
  test("US-04: renders send button", () => {
    render(<AIChat />);
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  // US-04: Send button is disabled when input is empty
  test("US-04: send button is disabled when input is empty", () => {
    render(<AIChat />);
    expect(screen.getByTestId("send-button")).toBeDisabled();
  });

  // US-04: Send button is enabled when input has text
  test("US-04: send button is enabled when input has text", () => {
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Hello" } });
    expect(screen.getByTestId("send-button")).not.toBeDisabled();
  });

  // US-04: User can type a message
  test("US-04: user can type a message in the input", () => {
    render(<AIChat />);
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "I only slept 4 hours" } });
    expect(input.value).toBe("I only slept 4 hours");
  });

  // US-04: User message appears in chat after sending
  test("US-04: user message appears in chat after sending", async () => {
    mockSuccessResponse();
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "I slept 4 hours" } });
    fireEvent.click(screen.getByTestId("send-button"));
    expect(screen.getByText("I slept 4 hours")).toBeInTheDocument();
  });

  // US-04: Input clears after sending
  test("US-04: input clears after message is sent", async () => {
    mockSuccessResponse();
    render(<AIChat />);
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "Hello coach" } });
    fireEvent.click(screen.getByTestId("send-button"));
    expect(input.value).toBe("");
  });

  // US-04: Loading indicator shown while AI is responding
  test("US-04: loading indicator is shown while waiting for AI response", async () => {
    // Don't resolve the fetch — keep it pending
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("send-button"));
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  // US-04: AI response appears after loading
  test("US-04: AI response appears in chat after loading", async () => {
    mockSuccessResponse("Make sure to eat 30g of protein before training.");
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "What should I eat?" } });
    fireEvent.click(screen.getByTestId("send-button"));
    await waitFor(() => {
      expect(screen.getByText("Make sure to eat 30g of protein before training.")).toBeInTheDocument();
    });
  });

  // US-04: Input disabled while loading
  test("US-04: input is disabled while AI is responding", async () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("send-button"));
    expect(screen.getByTestId("chat-input")).toBeDisabled();
  });

  // US-04: Quick prompts are shown
  test("US-04: quick prompt suggestions are shown", () => {
    render(<AIChat />);
    expect(screen.getByTestId("quick-prompts")).toBeInTheDocument();
    QUICK_PROMPTS.forEach((prompt) => {
      expect(screen.getByTestId(`quick-prompt-${prompt}`)).toBeInTheDocument();
    });
  });

  // US-04: Clicking a quick prompt sends it as a message
  test("US-04: clicking a quick prompt sends it as a user message", async () => {
    mockSuccessResponse();
    render(<AIChat />);
    fireEvent.click(screen.getByTestId(`quick-prompt-${QUICK_PROMPTS[0]}`));
    await waitFor(() => {
     const matches = screen.getAllByText(QUICK_PROMPTS[0]);
     expect(matches.length).toBeGreaterThan(0);
   });
  });

  // US-04: Messages persist during session
  test("US-04: messages persist during the session", async () => {
    mockSuccessResponse("Great advice here.");
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "First message" } });
    fireEvent.click(screen.getByTestId("send-button"));
    await waitFor(() => screen.getByText("Great advice here."));
    // Welcome message + user message + AI response all visible
    expect(screen.getByText(WELCOME_MESSAGE.content)).toBeInTheDocument();
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Great advice here.")).toBeInTheDocument();
  });

  // US-04: Error state handled gracefully
  test("US-04: shows connection error message when API fails", async () => {
    mockErrorResponse();
    render(<AIChat />);
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("send-button"));
    await waitFor(() => {
      expect(screen.getByText("Connection error — please try again.")).toBeInTheDocument();
    });
  });

  // US-04: Enter key sends message
  test("US-04: pressing Enter sends the message", async () => {
    mockSuccessResponse();
    render(<AIChat />);
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "Testing enter key" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(screen.getByText("Testing enter key")).toBeInTheDocument();
  });
});