import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "@/pages/Signup";

/**
 * Regression tests for the stale password error bug: an error raised on submit
 * stayed on screen after the user corrected the password, clearing only on a
 * second submit. See validatePassword() in src/pages/Signup.tsx.
 */

const { signUpMock } = vi.hoisted(() => ({ signUpMock: vi.fn() }));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ signUp: signUpMock, user: null }),
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: () => ({ update: () => ({ eq: async () => ({ error: null }) }) }),
  },
}));

const TOO_SHORT = /at least 6 characters/i;
const NO_MATCH = /passwords do not match/i;

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={["/signup?type=seeker"]}>
      <Signup />
    </MemoryRouter>
  );
}

const passwordInput = () => screen.getByPlaceholderText("At least 6 characters");
const confirmInput = () => screen.getByPlaceholderText("Re-enter your password");
const emailInput = () => screen.getByPlaceholderText("you@example.com");
const submit = () => screen.getByRole("button", { name: /create account/i });

const type = (el: HTMLElement, value: string) =>
  fireEvent.change(el, { target: { value } });

beforeEach(() => {
  signUpMock.mockReset();
  signUpMock.mockResolvedValue({ error: null });
});

describe("Signup password validation", () => {
  it("shows no error before the first submit", () => {
    renderSignup();
    type(passwordInput(), "a");
    expect(screen.queryByText(TOO_SHORT)).not.toBeInTheDocument();
  });

  it("shows an error when submitting a too-short password", async () => {
    renderSignup();
    type(emailInput(), "test@example.com");
    type(passwordInput(), "abc");
    type(confirmInput(), "abc");
    fireEvent.click(submit());

    expect(await screen.findByText(TOO_SHORT)).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  // The reported bug: this previously stayed on screen until a second submit.
  it("clears the error as soon as the password becomes valid, without resubmitting", async () => {
    renderSignup();
    type(emailInput(), "test@example.com");
    type(passwordInput(), "abc");
    type(confirmInput(), "abc");
    fireEvent.click(submit());
    expect(await screen.findByText(TOO_SHORT)).toBeInTheDocument();

    type(passwordInput(), "abcd");
    expect(screen.getByText(TOO_SHORT)).toBeInTheDocument();

    type(passwordInput(), "abc");
    type(confirmInput(), "abc");
    type(passwordInput(), "abcdef");
    type(confirmInput(), "abcdef");

    await waitFor(() =>
      expect(screen.queryByText(TOO_SHORT)).not.toBeInTheDocument()
    );
  });

  it("updates the message to the mismatch error when the length is fixed but confirm differs", async () => {
    renderSignup();
    type(emailInput(), "test@example.com");
    type(passwordInput(), "abc");
    type(confirmInput(), "xyz");
    fireEvent.click(submit());
    expect(await screen.findByText(TOO_SHORT)).toBeInTheDocument();

    type(passwordInput(), "abcdef");

    await waitFor(() => expect(screen.getByText(NO_MATCH)).toBeInTheDocument());
    expect(screen.queryByText(TOO_SHORT)).not.toBeInTheDocument();
  });

  it("re-shows the error if a valid password is broken again", async () => {
    renderSignup();
    type(emailInput(), "test@example.com");
    type(passwordInput(), "abc");
    type(confirmInput(), "abc");
    fireEvent.click(submit());
    expect(await screen.findByText(TOO_SHORT)).toBeInTheDocument();

    type(passwordInput(), "abcdef");
    type(confirmInput(), "abcdef");
    await waitFor(() =>
      expect(screen.queryByText(TOO_SHORT)).not.toBeInTheDocument()
    );

    type(passwordInput(), "abc");
    await waitFor(() => expect(screen.getByText(TOO_SHORT)).toBeInTheDocument());
  });

  // Without this, clearing on input would also wipe unrelated server errors.
  it("keeps a server error visible while the user edits the password", async () => {
    signUpMock.mockResolvedValue({ error: "User already registered" });
    renderSignup();
    type(emailInput(), "taken@example.com");
    type(passwordInput(), "abcdef");
    type(confirmInput(), "abcdef");
    fireEvent.click(submit());

    expect(await screen.findByText(/user already registered/i)).toBeInTheDocument();

    type(passwordInput(), "abcdefg");

    expect(screen.getByText(/user already registered/i)).toBeInTheDocument();
  });
});
