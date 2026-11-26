import { describe, expect, test } from "bun:test";

import {
  addDays,
  addMonths,
  combineInputValues,
  endOfDay,
  isSameDay,
  monthGrid,
  startOfDay,
  startOfWeek,
  toDateInputValue,
  toTimeInputValue,
  weekdayLabels,
} from "./date-utils";

describe("startOfWeek", () => {
  test("returns the Monday of the week", () => {
    // 2026-01-17 is a Saturday; its week starts Monday 2026-01-12.
    const saturday = new Date(2026, 0, 17);
    expect(startOfWeek(saturday).toDateString()).toBe(
      new Date(2026, 0, 12).toDateString()
    );
  });

  test("keeps a Monday in place", () => {
    const monday = new Date(2026, 0, 12);
    expect(isSameDay(startOfWeek(monday), monday)).toBe(true);
  });
});

describe("addDays", () => {
  test("crosses month boundaries", () => {
    const january31 = new Date(2026, 0, 31);
    expect(isSameDay(addDays(january31, 1), new Date(2026, 1, 1))).toBe(true);
  });
});

describe("addMonths", () => {
  test("clamps to the target month's length", () => {
    const march31 = new Date(2026, 2, 31);
    expect(isSameDay(addMonths(march31, 1), new Date(2026, 3, 30))).toBe(true);
  });
});

describe("monthGrid", () => {
  test("covers every day of the month from its first Monday", () => {
    const grid = monthGrid(new Date(2026, 0, 15));
    expect(grid).toHaveLength(42);
    expect(isSameDay(grid[0], new Date(2025, 11, 29))).toBe(true);
    expect(isSameDay(grid[41], new Date(2026, 1, 8))).toBe(true);
  });
});

describe("input values", () => {
  test("round-trip a local date and time", () => {
    const date = new Date(2026, 0, 17, 14, 30);
    expect(toDateInputValue(date)).toBe("2026-01-17");
    expect(toTimeInputValue(date)).toBe("14:30");
    expect(
      combineInputValues(toDateInputValue(date), toTimeInputValue(date))?.getTime()
    ).toBe(date.getTime());
  });

  test("refuse an incomplete pair", () => {
    expect(combineInputValues("2026-01-17", "")).toBeNull();
    expect(combineInputValues("", "14:30")).toBeNull();
  });
});

describe("endOfDay", () => {
  test("is the next midnight, exclusive bound of the day", () => {
    const day = new Date(2026, 0, 17);
    expect(isSameDay(endOfDay(day), new Date(2026, 0, 18))).toBe(true);
    expect(startOfDay(endOfDay(day)).getTime()).toBe(endOfDay(day).getTime());
  });
});

describe("weekdayLabels", () => {
  test("starts the week on Monday", () => {
    expect(weekdayLabels()[0].toLowerCase()).toBe("lun.");
  });
});
