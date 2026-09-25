import { describe, it, expect, beforeEach } from "vitest";
import { markLessonComplete, resetSectionProgress } from "./curriculum-progress";

describe("markLessonComplete", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks a lesson complete when no prior progress exists", () => {
    markLessonComplete("lesson-1");

    const stored = JSON.parse(localStorage.getItem("progress")!);
    expect(stored).toEqual(["lesson-1"]);
  });

  it("appends to existing progress", () => {
    localStorage.setItem("progress", JSON.stringify(["lesson-1"]));

    markLessonComplete("lesson-2");

    const stored = JSON.parse(localStorage.getItem("progress")!);
    expect(stored).toEqual(["lesson-1", "lesson-2"]);
  });

  it("does not add a duplicate entry", () => {
    localStorage.setItem("progress", JSON.stringify(["lesson-1"]));

    markLessonComplete("lesson-1");

    const stored = JSON.parse(localStorage.getItem("progress")!);
    expect(stored).toEqual(["lesson-1"]);
  });

  it("handles corrupted non-JSON localStorage value", () => {
    localStorage.setItem("progress", "not-json]");

    markLessonComplete("lesson-1");

    const stored = JSON.parse(localStorage.getItem("progress")!);
    expect(stored).toEqual(["lesson-1"]);
  });

  it("handles non-array stored value", () => {
    localStorage.setItem("progress", JSON.stringify({ key: "value" }));

    markLessonComplete("lesson-1");

    const stored = JSON.parse(localStorage.getItem("progress")!);
    expect(stored).toEqual(["lesson-1"]);
  });
});

describe("resetSectionProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes completed lessons from the selected section only", () => {
    localStorage.setItem(
      "progress",
      JSON.stringify(["section-one-a", "section-two-a", "section-one-b"]),
    );

    const updated = resetSectionProgress(["section-one-a", "section-one-b"]);

    expect(updated).toEqual(["section-two-a"]);
    expect(JSON.parse(localStorage.getItem("progress")!)).toEqual(["section-two-a"]);
  });

  it("keeps existing progress when the section has no completed lessons", () => {
    localStorage.setItem("progress", JSON.stringify(["section-two-a"]));

    const updated = resetSectionProgress(["section-one-a", "section-one-b"]);

    expect(updated).toEqual(["section-two-a"]);
    expect(JSON.parse(localStorage.getItem("progress")!)).toEqual(["section-two-a"]);
  });

  it("handles corrupted stored progress", () => {
    localStorage.setItem("progress", "not-json]");

    const updated = resetSectionProgress(["section-one-a"]);

    expect(updated).toEqual([]);
    expect(JSON.parse(localStorage.getItem("progress")!)).toEqual([]);
  });
});
