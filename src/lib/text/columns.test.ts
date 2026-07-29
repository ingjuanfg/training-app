import { describe, expect, it } from "vitest";
import {
  shouldUseTwoColumns,
  splitLinesIntoColumns,
} from "@/lib/text/columns";

describe("splitLinesIntoColumns", () => {
  it("balances 10 lines into 5 and 5", () => {
    const text = Array.from({ length: 10 }, (_, i) => `L${i + 1}`).join("\n");
    const [left, right] = splitLinesIntoColumns(text, 2);
    expect(left).toHaveLength(5);
    expect(right).toHaveLength(5);
    expect(left[0]).toBe("L1");
    expect(right[0]).toBe("L6");
  });

  it("balances 11 lines into 6 and 5", () => {
    const text = Array.from({ length: 11 }, (_, i) => `L${i + 1}`).join("\n");
    const [left, right] = splitLinesIntoColumns(text, 2);
    expect(left).toHaveLength(6);
    expect(right).toHaveLength(5);
  });

  it("returns single column when columnCount < 2", () => {
    expect(splitLinesIntoColumns("a\nb", 1)).toEqual([["a", "b"]]);
  });
});

describe("shouldUseTwoColumns", () => {
  it("is false for short text", () => {
    expect(shouldUseTwoColumns("a\nb\nc")).toBe(false);
  });

  it("is true for long text", () => {
    const text = Array.from({ length: 8 }, (_, i) => `L${i}`).join("\n");
    expect(shouldUseTwoColumns(text)).toBe(true);
  });
});
