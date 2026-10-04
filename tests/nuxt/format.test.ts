import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatMetric,
  formatNumber,
  formatPercent,
  formatPeriod,
  formatRelative,
  initialsOf,
  rangeLabelFormatter,
} from "../../app/utils/format";

describe("number formats", () => {
  it("formats currency with cents, or without for whole dollars", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(1234.5, true)).toBe("$1,235");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats percentages, numbers and compact amounts", () => {
    expect(formatPercent(12.345)).toBe("12.3%");
    expect(formatPercent(-0.04)).toBe("-0.0%");
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatCompactCurrency(1500)).toBe("$1.5K");
    expect(formatCompactCurrency(2_500_000)).toBe("$2.5M");
  });

  it("formats metrics: dollars for money, whole numbers for counts", () => {
    expect(formatMetric("revenue", 12345.6)).toBe("$12,346");
    expect(formatMetric("revenue", 999.5)).toBe("$999.50");
    expect(formatMetric("averageOrder", 93.414)).toBe("$93.41");
    expect(formatMetric("orders", 12.6)).toBe("13");
    expect(formatMetric("customers", 1500)).toBe("1,500");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => vi.useRealTimers());

  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("says just now for under a minute", () => {
    expect(formatRelative(ago(20_000))).toBe("just now");
  });

  it("uses minutes, hours and days", () => {
    expect(formatRelative(ago(5 * 60_000))).toBe("5 minutes ago");
    expect(formatRelative(ago(3 * 3_600_000))).toBe("3 hours ago");
    expect(formatRelative(ago(86_400_000))).toBe("yesterday");
    expect(formatRelative(ago(4 * 86_400_000))).toBe("4 days ago");
  });

  it("also works for the future", () => {
    expect(formatRelative(new Date(now.getTime() + 2 * 3_600_000).toISOString())).toBe(
      "in 2 hours"
    );
  });
});

describe("dates", () => {
  it("formats a date", () => {
    expect(formatDate("2026-10-03T12:00:00Z")).toBe("Oct 3, 2026");
  });

  it("formats chart periods in UTC", () => {
    expect(formatPeriod("2026-09-29T00:00:00Z", "30d")).toBe("Sep 29");
    expect(formatPeriod("2026-09-29T00:00:00Z", "7d")).toBe("Sep 29");
    expect(formatPeriod("2026-09-01T00:00:00Z", "12m")).toBe("Sep 2026");
  });

  it("labels chart axes by range", () => {
    const day = new Date("2026-09-29T00:00:00Z");
    expect(rangeLabelFormatter("7d").format(day)).toBe("Tue");
    expect(rangeLabelFormatter("30d").format(day)).toBe("Sep 29");
    expect(rangeLabelFormatter("12m").format(day)).toBe("Sep");
  });
});

describe("initialsOf", () => {
  it("takes up to two initials, in capitals", () => {
    expect(initialsOf("Jane Doe")).toBe("JD");
    expect(initialsOf("madonna")).toBe("M");
    expect(initialsOf("ann marie smith")).toBe("AM");
  });

  it("copes with nothing", () => {
    expect(initialsOf()).toBe("");
    expect(initialsOf("")).toBe("");
  });
});
