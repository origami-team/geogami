import { AuditLogPage } from "./audit-log.page";

// How the new entries read in the list: a label for the action and a one-line summary.
describe("AuditLogPage labels and summaries", () => {
  const page = Object.create(AuditLogPage.prototype) as AuditLogPage;

  describe("actionLabel", () => {
    it("names account creation, game creation and game edits", () => {
      expect(page.actionLabel("account.create.self")).toBe("Account created (self-registration)");
      expect(page.actionLabel("account.create.admin")).toBe("Account created (by admin)");
      expect(page.actionLabel("game.create")).toBe("Game created");
      expect(page.actionLabel("game.update")).toBe("Game edited");
    });

    it("keeps the existing labels and falls back to the code for unknown actions", () => {
      expect(page.actionLabel("account.delete.self")).toBe("Account deleted (by owner)");
      expect(page.actionLabel("editorVisibility.update")).toBe("Editor visibility changed");
      expect(page.actionLabel("something.new")).toBe("something.new");
    });
  });

  describe("metaSummary", () => {
    it("shows the role of an account an administrator created", () => {
      expect(page.metaSummary({ action: "account.create.admin", meta: { roles: ["scholar"] } })).toBe("role: scholar");
      expect(page.metaSummary({ action: "account.create.admin", meta: {} })).toBe("");
    });

    it("says nothing for a self-registration (the account is already named)", () => {
      expect(page.metaSummary({ action: "account.create.self", meta: {} })).toBe("");
    });

    it("shows the name of a created game and its number of tasks", () => {
      expect(page.metaSummary({ action: "game.create", meta: { name: "Campus walk", tasks: 3 } })).toBe("Campus walk · 3 tasks");
      expect(page.metaSummary({ action: "game.create", meta: { name: "Campus walk", tasks: 1 } })).toBe("Campus walk · 1 task");
      expect(page.metaSummary({ action: "game.create", meta: { name: "Campus walk" } })).toBe("Campus walk");
    });

    it("shows the name of an edited game and which fields changed", () => {
      expect(
        page.metaSummary({ action: "game.update", meta: { name: "Campus walk", changedFields: ["name", "tasks"] } })
      ).toBe("Campus walk · changed: name, tasks");
      expect(page.metaSummary({ action: "game.update", meta: { name: "Campus walk" } })).toBe("Campus walk");
    });

    it("copes with entries that have no meta", () => {
      expect(page.metaSummary({ action: "game.update" })).toBe("?");
      expect(page.metaSummary({ action: "game.create" })).toBe("?");
    });
  });
});
