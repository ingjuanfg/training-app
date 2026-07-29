import { describe, expect, it } from "vitest";
import {
  todayInBogota,
  yesterdayInBogota,
  formatDisplayDate,
  isPastDate,
} from "@/lib/dates/bogota";

describe("todayInBogota", () => {
  it("returns YYYY-MM-DD for a fixed UTC instant", () => {
    // 2026-07-22 02:30 UTC = 2026-07-21 21:30 in Bogotá (UTC-5)
    const date = new Date("2026-07-22T02:30:00.000Z");
    expect(todayInBogota(date)).toBe("2026-07-21");
  });

  it("rolls to next day after midnight Bogotá", () => {
    // 2026-07-22 05:00 UTC = 2026-07-22 00:00 Bogotá
    const date = new Date("2026-07-22T05:00:00.000Z");
    expect(todayInBogota(date)).toBe("2026-07-22");
  });
});

describe("yesterdayInBogota", () => {
  it("returns the previous Bogotá calendar day", () => {
    const date = new Date("2026-07-22T05:00:00.000Z");
    expect(yesterdayInBogota(date)).toBe("2026-07-21");
  });
});

describe("isPastDate", () => {
  it("marks dates before today as past", () => {
    const now = new Date("2026-07-22T05:00:00.000Z");
    expect(isPastDate("2026-07-21", now)).toBe(true);
    expect(isPastDate("2026-07-22", now)).toBe(false);
  });
});

describe("formatDisplayDate", () => {
  it("formats as dd/MM/yyyy", () => {
    expect(formatDisplayDate("2026-07-21")).toBe("21/07/2026");
  });
});
