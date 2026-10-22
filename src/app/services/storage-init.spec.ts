import { initializeStorage } from "./storage-init";

describe("initializeStorage (APP_INITIALIZER)", () => {
  let create: jasmine.Spy;
  let storage: any;

  beforeEach(() => {
    create = jasmine.createSpy("create").and.returnValue(Promise.resolve());
    storage = { create };
  });

  it("does nothing until the app asks for it, and then opens the storage exactly once", async () => {
    const initializer = initializeStorage(storage);
    expect(create).not.toHaveBeenCalled();
    await initializer();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("only finishes when the storage is open, so the app does not start before that", async () => {
    let open!: () => void;
    create.and.returnValue(new Promise<void>((resolve) => (open = resolve)));
    let finished = false;
    const done = initializeStorage(storage)().then(() => (finished = true));
    await Promise.resolve();
    expect(finished).toBe(false);
    open();
    await done;
    expect(finished).toBe(true);
  });

  it("lets the app start anyway when the browser refuses to open its storage", async () => {
    spyOn(console, "warn");
    create.and.returnValue(Promise.reject(new Error("blocked")));
    await expectAsync(initializeStorage(storage)()).toBeResolved();
    expect(console.warn).toHaveBeenCalled();
  });
});
