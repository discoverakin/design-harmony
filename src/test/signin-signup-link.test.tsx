import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

/**
 * Sign-in previously had no path to account creation at all, so a user with
 * no account reached a dead end and had to find /signup on their own.
 */

const { signInMock, signUpMock } = vi.hoisted(() => ({
  signInMock: vi.fn().mockResolvedValue({ error: null }),
  signUpMock: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ signIn: signInMock, signUp: signUpMock, user: null }),
}));

vi.mock("@/hooks/use-theme", () => ({ useTheme: () => ({ theme: "light" }) }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: () => ({ update: () => ({ eq: async () => ({ error: null }) }) }),
  },
}));

const renderAt = (ui: React.ReactElement, path: string) =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

const signupLink = () => screen.getByRole("link", { name: /sign up/i });

describe("Sign-in offers a path to sign-up", () => {
  it("shows a sign-up link", () => {
    renderAt(<Login />, "/login");
    expect(signupLink()).toHaveAttribute("href", "/signup");
  });

  it("carries the typed email into the sign-up link", () => {
    renderAt(<Login />, "/login");
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "new@example.com" },
    });
    expect(signupLink().getAttribute("href")).toContain(
      "email=new%40example.com"
    );
  });

  it("carries redirect and type context into the sign-up link", () => {
    renderAt(<Login />, "/login?type=owner&redirect=%2Fevents%2F123");
    const href = signupLink().getAttribute("href")!;
    expect(href).toContain("type=owner");
    expect(href).toContain("redirect=%2Fevents%2F123");
  });

  it("does not add an empty email param when the field is blank", () => {
    renderAt(<Login />, "/login");
    expect(signupLink().getAttribute("href")).not.toContain("email=");
  });
});

describe("Signup accepts the carried email", () => {
  it("prefills the email from the URL", () => {
    renderAt(<Signup />, "/signup?type=seeker&email=new%40example.com");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue(
      "new@example.com"
    );
  });

  it("starts empty when no email is supplied", () => {
    renderAt(<Signup />, "/signup?type=seeker");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("");
  });
});
