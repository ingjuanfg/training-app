import { describe, expect, it } from "vitest";
import {
  passwordLoginSchema,
  pinLoginSchema,
  workoutFormSchema,
} from "@/lib/validation";

describe("passwordLoginSchema", () => {
  it("accepts alphanumeric username", () => {
    const result = passwordLoginSchema.safeParse({
      username: "admin1",
      password: "admin123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects email-like username", () => {
    const result = passwordLoginSchema.safeParse({
      username: "a@b.com",
      password: "x",
    });
    expect(result.success).toBe(false);
  });
});

describe("pinLoginSchema", () => {
  it("accepts 4-8 digit pins", () => {
    expect(pinLoginSchema.safeParse({ pin: "1111" }).success).toBe(true);
    expect(pinLoginSchema.safeParse({ pin: "12345678" }).success).toBe(true);
  });

  it("rejects non-numeric pins", () => {
    expect(pinLoginSchema.safeParse({ pin: "11a1" }).success).toBe(false);
  });
});

describe("workoutFormSchema", () => {
  it("requires sedes and at least one section", () => {
    const ok = workoutFormSchema.safeParse({
      workoutDate: "2026-07-21",
      sedeIds: ["11111111-1111-4111-8111-111111111111"],
      sections: [{ section_type: "fuerza", content: "Back squat 5x5" }],
    });
    expect(ok.success).toBe(true);

    const noSede = workoutFormSchema.safeParse({
      workoutDate: "2026-07-21",
      sedeIds: [],
      sections: [{ section_type: "fuerza", content: "x" }],
    });
    expect(noSede.success).toBe(false);

    const empty = workoutFormSchema.safeParse({
      workoutDate: "2026-07-21",
      sedeIds: ["11111111-1111-4111-8111-111111111111"],
      sections: [],
    });
    expect(empty.success).toBe(false);
  });
});
