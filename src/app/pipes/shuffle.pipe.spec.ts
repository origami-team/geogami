import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ShufflePipe } from "./shuffle.pipe";

// The answers of a multiple-choice task are shown through `keyvalue | shuffle`.
// What matters: every answer appears exactly once, the order is random per task,
// and it does NOT change while the task is on screen.

// The algorithm of the `shuffle` pipe of angular-pipes (Fisher–Yates on a copy),
// kept here as the reference the replacement has to agree with.
function referenceShuffle(input: any[]): any[] {
  const copy = [...input];
  for (let i = copy.length; i; --i) {
    const j = Math.floor(Math.random() * i);
    const x = copy[i - 1];
    copy[i - 1] = copy[j];
    copy[j] = x;
  }
  return copy;
}

// Deterministic "random" numbers: a fresh generator per call site, so two shuffles can be compared.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
}

describe("ShufflePipe", () => {
  let pipe: ShufflePipe;
  let random: jasmine.Spy;

  beforeEach(() => {
    pipe = new ShufflePipe();
    random = spyOn(Math, "random").and.callThrough();
  });

  it("gives the same permutation as the original algorithm for the same random numbers", () => {
    for (let length = 0; length < 12; length++) {
      for (let seed = 1; seed <= 25; seed++) {
        const input = Array.from({ length }, (_, i) => `item${i}`);
        random.and.callFake(seededRandom(seed));
        const expected = referenceShuffle(input);
        random.and.callFake(seededRandom(seed));
        expect(pipe.transform(input)).toEqual(expected);
      }
    }
  });

  it("keeps every element exactly once", () => {
    const input = ["a", "b", "c", "d", "e", "f"];
    random.and.callFake(seededRandom(3));
    expect([...pipe.transform(input)].sort()).toEqual([...input].sort());
  });

  it("does not modify its input and returns a new array", () => {
    const input = ["a", "b", "c", "d"];
    const copy = [...input];
    random.and.callFake(seededRandom(5));
    const output = pipe.transform(input);
    expect(input).toEqual(copy);
    expect(output).not.toBe(input);
  });

  it("really changes the order (it is not the identity)", () => {
    const input = ["a", "b", "c", "d", "e", "f"];
    const orders = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      random.and.callFake(seededRandom(seed));
      orders.add(pipe.transform(input).join(""));
    }
    expect(orders.size).toBeGreaterThan(10);
  });

  it("handles empty and single-element lists", () => {
    expect(pipe.transform([])).toEqual([]);
    expect(pipe.transform(["only"])).toEqual(["only"]);
  });

  it("returns anything that is not an array unchanged", () => {
    const object = { a: 1 };
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform("abc")).toBe("abc");
    expect(pipe.transform(42)).toBe(42);
    expect(pipe.transform(object)).toBe(object);
  });

  it("is declared as a pure pipe", () => {
    expect((ShufflePipe as any).ɵpipe.pure).toBe(true);
  });
});

@Component({
  template: `<p *ngFor="let item of choices | keyvalue | shuffle">{{ item.value }}</p>`,
})
class HostComponent {
  choices: { [key: string]: string } = { "0": "Correct", "1": "A", "2": "B", "3": "C", "4": "D" };
}

describe("ShufflePipe in a template (keyvalue | shuffle)", () => {
  let fixture: ComponentFixture<HostComponent>;
  let random: jasmine.Spy;

  const shown = () =>
    Array.from(fixture.nativeElement.querySelectorAll("p")).map((p: any) => p.textContent.trim());

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [HostComponent, ShufflePipe] });
    random = spyOn(Math, "random").and.callFake(seededRandom(11));
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it("shows every answer once", () => {
    expect(shown().sort()).toEqual(["A", "B", "C", "Correct", "D"]);
  });

  it("does not reshuffle on later change detection runs", () => {
    const first = shown();
    const callsAfterFirstRender = random.calls.count();
    for (let i = 0; i < 10; i++) {
      fixture.detectChanges();
    }
    expect(shown()).toEqual(first);
    expect(random.calls.count()).toBe(callsAfterFirstRender); // not even recomputed
  });

  it("shuffles again only when the answers themselves change", () => {
    const callsBefore = random.calls.count();
    fixture.componentInstance.choices["1"] = "A changed";
    fixture.detectChanges();
    expect(shown()).toContain("A changed");
    expect(random.calls.count()).toBeGreaterThan(callsBefore);

    const callsAfterChange = random.calls.count();
    fixture.detectChanges();
    fixture.detectChanges();
    expect(random.calls.count()).toBe(callsAfterChange);
  });
});
