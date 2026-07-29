import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/login/LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  it("toggles between password and PIN modes", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Clave")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ingresar con PIN" }));

    expect(screen.getByLabelText("PIN")).toBeInTheDocument();
    expect(screen.queryByLabelText("Usuario")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ingresar con usuario y clave" }),
    ).toBeInTheDocument();
  });
});
