import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SectionPager } from "@/components/display/SectionPager";
import type { WorkoutSection } from "@/lib/types";

const sections: WorkoutSection[] = [
  {
    id: "1",
    section_type: "calentamiento",
    content: "Row 500m",
    sort_order: 1,
  },
  {
    id: "2",
    section_type: "fuerza",
    content: "Squat 5x5",
    sort_order: 2,
  },
];

describe("SectionPager", () => {
  it("navigates between sections and shows active count", async () => {
    const user = userEvent.setup();
    render(
      <SectionPager
        sections={sections}
        dateLabel="21/07/2026"
      />,
    );

    expect(screen.getByText("Calentamiento")).toBeInTheDocument();
    expect(screen.getByText("Secciones activas")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sección siguiente" }));
    expect(screen.getByText("Fuerza")).toBeInTheDocument();
  });
});
