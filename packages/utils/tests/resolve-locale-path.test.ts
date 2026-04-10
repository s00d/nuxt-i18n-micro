import { describe, expect, it } from "vitest";
import { resolveLocalePrefixedPath } from "../src";

describe("@i18n-micro/utils resolveLocalePrefixedPath", () => {
  const localeCodes = ["en", "de", "ru"];

  it("keeps default locale without prefix", () => {
    expect(resolveLocalePrefixedPath("/de/about", "en", localeCodes, "en")).toBe("/about");
  });

  it("adds locale prefix for non-default locale", () => {
    expect(resolveLocalePrefixedPath("/about", "de", localeCodes, "en")).toBe("/de/about");
  });

  it("works with object input and root path", () => {
    expect(resolveLocalePrefixedPath({ path: "/" }, "ru", localeCodes, "en")).toBe("/ru");
  });
});
