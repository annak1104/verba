import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";

describe("review page composition", () => {
  it("does not render the listening practice block on the flashcard review screen", () => {
    const source = readFileSync("src/app/[locale]/(app)/review/page.tsx", "utf8");

    expect(source).not.toContain("ListeningExercise");
    expect(source).toContain("ReviewWorkspace");
  });
});
