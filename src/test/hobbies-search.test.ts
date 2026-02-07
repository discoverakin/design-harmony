import { describe, it, expect } from "vitest";
import { hobbies } from "@/data/hobbies";

const filterHobbies = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return hobbies;
  return hobbies.filter(
    (h) =>
      h.label.toLowerCase().includes(q) ||
      h.slug.toLowerCase().includes(q) ||
      h.tags.some((tag) => tag.toLowerCase().includes(q))
  );
};

describe("Hobby search with tags", () => {
  it("should have 25 hobbies total", () => {
    expect(hobbies.length).toBe(25);
  });

  it("should find Yoga & Meditation when searching 'yoga'", () => {
    const results = filterHobbies("yoga");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.slug === "yoga")).toBe(true);
  });

  it("should find Music when searching 'guitar'", () => {
    const results = filterHobbies("guitar");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.slug === "music")).toBe(true);
  });

  it("should find Pottery & Ceramics when searching 'clay'", () => {
    const results = filterHobbies("clay");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.slug === "pottery")).toBe(true);
  });

  it("should find Martial Arts when searching 'boxing'", () => {
    const results = filterHobbies("boxing");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.slug === "martial-arts")).toBe(true);
  });

  it("should find Coding & Tech when searching 'python'", () => {
    const results = filterHobbies("python");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.slug === "coding")).toBe(true);
  });

  it("should return all hobbies for empty search", () => {
    const results = filterHobbies("");
    expect(results.length).toBe(25);
  });

  it("should return no results for gibberish", () => {
    const results = filterHobbies("xyzzy123");
    expect(results.length).toBe(0);
  });

  it("every hobby has tags array", () => {
    hobbies.forEach((h) => {
      expect(Array.isArray(h.tags)).toBe(true);
      expect(h.tags.length).toBeGreaterThan(0);
    });
  });
});
