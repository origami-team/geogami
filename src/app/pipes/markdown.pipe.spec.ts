import { TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { MarkdownPipe, trimIndentation } from "./markdown.pipe";

// What an author types is rendered for every player, so what the pipe produces
// — and what it removes — is pinned here (and, end to end, in
// tests-e2e/specs/markdown.spec.ts).
describe("MarkdownPipe", () => {
  let pipe: MarkdownPipe;

  const render = (markdown: string): HTMLElement => {
    const el = document.createElement("div");
    el.innerHTML = pipe.transform(markdown);
    return el;
  };

  beforeEach(() => {
    pipe = new MarkdownPipe(TestBed.inject(DomSanitizer));
  });

  it("renders headings, emphasis, inline code, lists, links and line breaks", () => {
    const el = render(
      "# Title\n\nSome **bold** and *italic* text with `code`.\n\n- one\n- two\n\n[GeoGami](https://example.org) line1  \nline2"
    );
    expect(el.querySelector("h1").textContent).toBe("Title");
    expect(el.querySelector("strong").textContent).toBe("bold");
    expect(el.querySelector("em").textContent).toBe("italic");
    expect(el.querySelector("code").textContent).toBe("code");
    expect(Array.from(el.querySelectorAll("li")).map((li) => li.textContent)).toEqual(["one", "two"]);
    expect(el.querySelector("a").getAttribute("href")).toBe("https://example.org");
    expect(el.querySelectorAll("br").length).toBe(1);
  });

  it("returns a plain string, not a trusted SafeHtml, so Angular still sanitizes it when bound", () => {
    expect(typeof pipe.transform("**x**")).toBe("string");
  });

  it("returns an empty string for null, undefined and empty input", () => {
    expect(pipe.transform(null)).toBe("");
    expect(pipe.transform(undefined)).toBe("");
    expect(pipe.transform("")).toBe("");
  });

  it("keeps harmless inline HTML", () => {
    expect(render("<b>raw</b>").querySelector("b").textContent).toBe("raw");
  });

  it("removes scripts, event handlers and javascript: links", () => {
    const el = render(
      '<img src="x" onerror="window.__pwned=1"> <script>window.__pwned=2</script> <a href="javascript:window.__pwned=3">x</a>'
    );
    expect(el.querySelector("script")).toBeNull();
    expect(el.querySelector("img").hasAttribute("onerror")).toBe(false);
    expect(el.querySelector("a").getAttribute("href")).not.toMatch(/^javascript:/i);
    expect((window as any).__pwned).toBeUndefined();
  });

  it("removes Ionic components typed by an author", () => {
    const el = render('Look: <ion-icon name="flag"></ion-icon> <ion-chip>chip</ion-chip>');
    expect(el.querySelector("ion-icon")).toBeNull();
    expect(el.querySelector("ion-chip")).toBeNull();
    expect(el.textContent).toContain("Look:");
  });

  it("escapes special characters and keeps them as typed", () => {
    expect(render("5 > 3 && 2 < 4 \"quoted\" it's").textContent.trim()).toBe("5 > 3 && 2 < 4 \"quoted\" it's");
  });

  it("does not throw on a non-string value", () => {
    expect(() => pipe.transform(42 as any)).not.toThrow();
    expect(render("42").textContent.trim()).toBe("42");
  });

  describe("indentation", () => {
    it("does not turn a text that is indented as a whole into a code block", () => {
      const el = render("    Walk to the church\n    then turn left");
      expect(el.querySelector("pre")).toBeNull();
      expect(el.querySelector("code")).toBeNull();
      expect(el.querySelectorAll("p").length).toBe(1);
      expect(el.textContent).toContain("Walk to the church");
    });

    it("still renders a list when the whole text is indented", () => {
      const el = render("    - item a\n    - item b");
      expect(Array.from(el.querySelectorAll("li")).map((li) => li.textContent)).toEqual(["item a", "item b"]);
      expect(el.querySelector("pre")).toBeNull();
    });

    it("keeps real indented code after unindented text", () => {
      const el = render("Text\n\n    code line");
      expect(el.querySelector("pre code").textContent).toContain("code line");
    });

    it("removes min(own indentation, the first non-empty line's indentation) from every line", () => {
      expect(trimIndentation("  a\n    b\n c")).toBe("a\n  b\nc");
      // tabs count as one character each: the first line indents 2, the second only 1
      expect(trimIndentation("\t\ta\n\tb")).toBe("a\nb");
    });

    it("leaves text whose first line is not indented untouched", () => {
      expect(trimIndentation("a\n  b\n    c")).toBe("a\n  b\n    c");
    });

    it("ignores empty lines before the first text line", () => {
      expect(trimIndentation("\n\n  a\n  b")).toBe("\n\na\nb");
    });

    it("returns an empty string for empty input", () => {
      expect(trimIndentation("")).toBe("");
      expect(trimIndentation(null)).toBe("");
      expect(trimIndentation(undefined)).toBe("");
    });
  });
});
