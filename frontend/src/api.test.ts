import { describe, it, expect } from "vitest";
import { getUploadsUrl } from "./api";

describe("getUploadsUrl", () => {
  it("returns URL containing /uploads/ and the filename", () => {
    const url = getUploadsUrl("photo.jpg");
    expect(url).toContain("/uploads/");
    expect(url).toContain("photo.jpg");
    expect(url).toMatch(/^https?:\/\//);
  });
});
