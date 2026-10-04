import { describe, expect, it } from "vitest";
import { getNavPages } from "../../app/utils/navigation";
import { PLANS, getPlan } from "../../shared/utils/billing";
import { CHANGELOG, FAQ_TOPICS, GO_TO_SHORTCUTS, SHORTCUTS } from "../../shared/utils/help-content";

describe("help content", () => {
  it("has unique topic and question ids, and every topic has questions", () => {
    const topicIds = FAQ_TOPICS.map((topic) => topic.id);
    expect(new Set(topicIds).size).toBe(topicIds.length);
    const questionIds = FAQ_TOPICS.flatMap((topic) => topic.items.map((item) => item.id));
    expect(new Set(questionIds).size).toBe(questionIds.length);
    for (const topic of FAQ_TOPICS) expect(topic.items.length).toBeGreaterThan(0);
    for (const item of FAQ_TOPICS.flatMap((topic) => topic.items)) {
      expect(item.question.endsWith("?")).toBe(true);
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });

  it("sends every 'go to' shortcut to a real page", () => {
    const pages = getNavPages(() => true).map((page) => page.url);
    for (const [key, path] of Object.entries(GO_TO_SHORTCUTS)) {
      expect(key).toMatch(/^[a-z]$/);
      expect(pages, `G then ${key}`).toContain(path);
    }
  });

  it("lists every 'go to' shortcut, and nothing the code doesn't do", () => {
    const listed = SHORTCUTS.flatMap((group) => group.items)
      .filter((item) => item.keys[0] === "G")
      .map((item) => item.keys.at(-1)!.toLowerCase());
    expect(listed.sort()).toEqual(Object.keys(GO_TO_SHORTCUTS).sort());
  });

  it("has a changelog with the newest entry first", () => {
    expect(CHANGELOG.length).toBeGreaterThan(0);
    for (const entry of CHANGELOG) expect(entry.items.length).toBeGreaterThan(0);
  });
});

describe("billing plans", () => {
  it("has three plans that grow in price and limits", () => {
    expect(PLANS.map((plan) => plan.id)).toEqual(["starter", "growth", "scale"]);
    for (let i = 1; i < PLANS.length; i++) {
      const [smaller, bigger] = [PLANS[i - 1]!, PLANS[i]!];
      expect(bigger.price.monthly).toBeGreaterThan(smaller.price.monthly);
      expect(bigger.limits.products).toBeGreaterThan(smaller.limits.products);
      expect(bigger.limits.seats).toBeGreaterThan(smaller.limits.seats);
      expect(bigger.limits.orders).toBeGreaterThan(smaller.limits.orders);
    }
  });

  it("charges ten months for a year", () => {
    for (const plan of PLANS) expect(plan.price.yearly).toBe(plan.price.monthly * 10);
  });

  it("finds a plan by id, falling back to the first", () => {
    expect(getPlan("growth").name).toBe("Growth");
    expect(getPlan("nope" as never).id).toBe("starter");
  });
});
