import { describe, expect, it } from "vitest";
import {
  sectionLabels,
  sectionsFingerprint,
} from "@/lib/workouts/fingerprint";

describe("sectionsFingerprint", () => {
  it("is equal for same content regardless of array order", () => {
    const a = sectionsFingerprint([
      { section_type: "fuerza", content: "Squat", sort_order: 2 },
      { section_type: "calentamiento", content: "Row", sort_order: 1 },
    ]);
    const b = sectionsFingerprint([
      { section_type: "calentamiento", content: "Row", sort_order: 1 },
      { section_type: "fuerza", content: "Squat", sort_order: 2 },
    ]);
    expect(a).toBe(b);
  });

  it("differs when content differs", () => {
    const a = sectionsFingerprint([
      { section_type: "skills", content: "HSPU", sort_order: 5 },
    ]);
    const b = sectionsFingerprint([
      { section_type: "skills", content: "MU", sort_order: 5 },
    ]);
    expect(a).not.toBe(b);
  });
});

describe("sectionLabels", () => {
  it("returns labels in sort order", () => {
    expect(
      sectionLabels([
        { section_type: "skills", sort_order: 5 },
        { section_type: "calentamiento", sort_order: 1 },
      ]),
    ).toEqual(["Calentamiento", "Skills"]);
  });
});
