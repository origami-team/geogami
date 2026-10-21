import { TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { SecurityContext } from "@angular/core";
import { KeywordPipe } from "./keyword.pipe";

describe("KeywordPipe", () => {
  let pipe: KeywordPipe;
  let sanitizer: DomSanitizer;

  const html = (value: any) => sanitizer.sanitize(SecurityContext.HTML, value);

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new KeywordPipe(sanitizer);
  });

  it("adds the flag chip after Flag, Fahne and bandeira, whatever the case", () => {
    for (const word of ["Flag", "flag", "Fahne", "bandeira"]) {
      const out = html(pipe.transform(`<p>Find the ${word}.</p>`));
      expect(out).toContain("ion-chip");
      expect(out).toContain("ion-icon");
      expect(out).toContain("Find the");
    }
  });

  it("leaves text without keywords unchanged", () => {
    expect(html(pipe.transform("<p>Walk to the church.</p>"))).toBe("<p>Walk to the church.</p>");
  });

  it("returns an empty result for empty input", () => {
    expect(html(pipe.transform(""))).toBe("");
  });
});
