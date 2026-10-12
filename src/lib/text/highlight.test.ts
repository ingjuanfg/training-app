import { describe, expect, it } from "vitest";
import { parseWorkoutLine, splitSectionContent } from "@/lib/text/highlight";

function roles(line: string) {
  return parseWorkoutLine(line).map((part) => [part.role, part.text]);
}

describe("parseWorkoutLine", () => {
  it("marks modality lines", () => {
    for (const line of [
      "2 Rondas",
      "2-3 Rondas",
      "2 Rounds",
      "EMON 8 Min",
      "EMOM 10 Min",
      "FOR TIME 12 Min",
      "For time - Time cap 18 min",
      "AMRAP 10 Min",
    ]) {
      expect(parseWorkoutLine(line)[0]?.role).toBe("modality");
    }
  });

  it("highlights the leading rep count and leaves the exercise", () => {
    expect(roles("10 cal machine progresivo")).toEqual([
      ["reps", "10"],
      ["body", " cal machine progresivo"],
    ]);
    expect(roles("8/lado 90/90 Hip Switch")).toEqual([
      ["reps", "8/lado"],
      ["body", " 90/90 Hip Switch"],
    ]);
    expect(roles("10/lado Banded Lateral Walk")[0]).toEqual([
      "reps",
      "10/lado",
    ]);
    expect(roles("8/lado Cossack Squat")[0]).toEqual(["reps", "8/lado"]);
    expect(roles("10 back squat (barra vacia)")).toEqual([
      ["reps", "10"],
      ["body", " back squat (barra vacia)"],
    ]);
  });

  it("does not treat a modality line as reps", () => {
    expect(parseWorkoutLine("2 Rondas").some((part) => part.role === "reps")).toBe(
      false,
    );
  });

  it("colors both numbers in 5 x 5 and leaves the x plain", () => {
    expect(roles("5 x 5")).toEqual([
      ["reps", "5"],
      ["body", " x "],
      ["reps", "5"],
    ]);
    expect(roles("5x5 Back squat")).toEqual([
      ["reps", "5"],
      ["body", "x"],
      ["reps", "5"],
      ["body", " Back squat"],
    ]);
  });

  it("colors both numbers in a leading 15/10 load", () => {
    expect(roles("15/10 kg Reverse Lunge")).toEqual([
      ["reps", "15"],
      ["body", "/"],
      ["reps", "10"],
      ["body", " kg Reverse Lunge"],
    ]);
  });

  it("does not recolor 90/90 inside an exercise name", () => {
    expect(roles("8/lado 90/90 Hip Switch")).toEqual([
      ["reps", "8/lado"],
      ["body", " 90/90 Hip Switch"],
    ]);
  });

  it("keeps modality lines like 2 - 3 rondas", () => {
    expect(parseWorkoutLine("2 - 3 rondas")[0]?.role).toBe("modality");
  });
});

describe("splitSectionContent", () => {
  it("lifts modality lines and drops blanks before the body", () => {
    const text = [
      "EMOM 20 min",
      "",
      "Min 1: 15 Wall Balls",
      "Min 2: 12 KB Swings",
      "Min 3: 10 cal machine",
      "Min 4: Descanso",
    ].join("\n");

    expect(splitSectionContent(text)).toEqual({
      banners: ["EMOM 20 min"],
      body: [
        "Min 1: 15 Wall Balls",
        "Min 2: 12 KB Swings",
        "Min 3: 10 cal machine",
        "Min 4: Descanso",
      ],
    });
  });
});
