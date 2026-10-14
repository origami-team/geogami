import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { EditorModeService } from "./editor-mode.service";

describe("EditorModeService", () => {
  const PREFIX = "geogami.editorMode.v1:";
  let user$: BehaviorSubject<any>;
  let created: EditorModeService[];

  const key = (userId: string) => `${PREFIX}${environment.apiURL}:${userId}`;
  const clearStored = () =>
    Object.keys(localStorage)
      .filter((k) => k.indexOf("geogami.editorMode") === 0)
      .forEach((k) => localStorage.removeItem(k));

  function service(): EditorModeService {
    const instance = new EditorModeService({ getUser: () => user$.asObservable() } as any);
    created.push(instance);
    return instance;
  }

  beforeEach(() => {
    clearStored();
    user$ = new BehaviorSubject<any>(null);
    created = [];
  });
  afterEach(clearStored);

  it("starts in Simple when nothing is stored", () => {
    user$.next({ _id: "u1" });
    const modes = service();
    expect(modes.mode).toBe("simple");
    expect(modes.isAdvanced).toBe(false);
  });

  it("remembers the choice for a user, across reloads", () => {
    user$.next({ _id: "u1" });
    service().setMode("advanced");
    expect(localStorage.getItem(key("u1"))).toBe("advanced");

    // a reload creates a new service; the user is restored shortly after start-up
    user$ = new BehaviorSubject<any>(null);
    const reloaded = service();
    expect(reloaded.mode).toBe("simple");
    user$.next({ _id: "u1" });
    expect(reloaded.mode).toBe("advanced");
  });

  it("stores the choice per API environment and user", () => {
    user$.next({ _id: "u1" });
    service().setMode("advanced");
    expect(key("u1")).toContain(environment.apiURL);
    expect(key("u1")).toContain("u1");
    expect(localStorage.getItem(key("u1"))).toBe("advanced");
    expect(localStorage.getItem(`${PREFIX}https://another-api.example:u1`)).toBeNull();
  });

  it("does not carry one account's choice over to another account", () => {
    user$.next({ _id: "alice" });
    const modes = service();
    modes.setMode("advanced");

    user$.next({ _id: "bob" });
    expect(modes.mode).toBe("simple");
    modes.setMode("advanced");
    modes.setMode("simple");
    expect(localStorage.getItem(key("bob"))).toBe("simple");

    user$.next({ _id: "alice" });
    expect(modes.mode).toBe("advanced");
  });

  it("forgets the in-memory choice when the user signs out", () => {
    user$.next({ _id: "u1" });
    const modes = service();
    modes.setMode("advanced");
    user$.next(undefined);
    expect(modes.mode).toBe("simple");
    // ...without touching what is stored for the account
    expect(localStorage.getItem(key("u1"))).toBe("advanced");
    user$.next({ _id: "u1" });
    expect(modes.mode).toBe("advanced");
  });

  it("keeps the choice when the same account's profile is refreshed", () => {
    user$.next({ _id: "u1", name: "Old" });
    const modes = service();
    modes.setMode("advanced");
    user$.next({ _id: "u1", name: "New" });
    expect(modes.mode).toBe("advanced");
  });

  it("does not persist a choice made without a signed-in user", () => {
    const modes = service();
    modes.setMode("advanced");
    expect(modes.mode).toBe("advanced");
    expect(Object.keys(localStorage).filter((k) => k.indexOf(PREFIX) === 0)).toEqual([]);
  });

  it("ignores values it does not know, in storage and when set", () => {
    localStorage.setItem(key("u1"), "expert");
    user$.next({ _id: "u1" });
    const modes = service();
    expect(modes.mode).toBe("simple");
    modes.setMode("expert" as any);
    expect(modes.mode).toBe("simple");
  });

  it("tells subscribers about every change, and only real changes", () => {
    user$.next({ _id: "u1" });
    const modes = service();
    const seen: string[] = [];
    modes.mode$.subscribe((mode) => seen.push(mode));
    modes.setMode("advanced");
    modes.setMode("advanced");
    modes.setMode("simple");
    expect(seen).toEqual(["simple", "advanced", "simple"]);
  });

  describe("when browser storage is unavailable", () => {
    it("still works for the session when reading and writing throw", () => {
      user$.next({ _id: "u1" });
      const getter = spyOnProperty(window, "localStorage", "get").and.throwError("denied");
      const modes = service();
      expect(modes.mode).toBe("simple");
      expect(() => modes.setMode("advanced")).not.toThrow();
      expect(modes.mode).toBe("advanced");
      expect(getter).toHaveBeenCalled();
      getter.and.callThrough(); // the clean-up below needs working storage
    });

    it("falls back to Simple when a stored value cannot be read", () => {
      spyOn(Storage.prototype, "getItem").and.throwError("denied");
      user$.next({ _id: "u1" });
      expect(service().mode).toBe("simple");
    });

    it("keeps the choice for the session when writing fails", () => {
      spyOn(Storage.prototype, "setItem").and.throwError("quota");
      user$.next({ _id: "u1" });
      const modes = service();
      expect(() => modes.setMode("advanced")).not.toThrow();
      expect(modes.mode).toBe("advanced");
    });
  });
});
