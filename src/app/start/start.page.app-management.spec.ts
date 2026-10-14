import { StartPage } from "./start.page";

// The admin card on the start page: only administrators get App management (users,
// editor visibility, audit log). A contentAdmin gets no admin card at all.
describe("StartPage App management card", () => {
  let navigateForward: jasmine.Spy;
  let unread: jasmine.Spy;

  function pageFor(roles: string[] | null): StartPage {
    const page = Object.create(StartPage.prototype) as any;
    navigateForward = jasmine.createSpy("navigateForward");
    unread = jasmine.createSpy("getAuditUnreadCount").and.returnValue(Promise.resolve({ count: 0, alertCount: 0 }));
    page.navCtrl = { navigateForward };
    page.authService = {
      hasAnyRole: (wanted: string[]) => !!roles && roles.some((r) => wanted.indexOf(r) !== -1),
      getAuditUnreadCount: unread,
    };
    page.auditUnread = 0; // class-field initialisers do not run on a prototype-built page
    page.auditAlerts = 0;
    return page;
  }

  describe("who gets it", () => {
    it("gives an administrator the card", () => {
      expect(pageFor(["admin"]).canOpenAppManagement).toBe(true);
    });

    it("finds the admin role wherever it is in the list (not only first)", () => {
      expect(pageFor(["user", "admin"]).canOpenAppManagement).toBe(true);
      expect(pageFor(["contentAdmin", "admin"]).canOpenAppManagement).toBe(true);
    });

    it("gives nobody else the card, a contentAdmin included", () => {
      for (const roles of [["contentAdmin"], ["scholar", "contentAdmin"], ["user"], ["scholar"], ["trackAccess", "user"], [], null]) {
        expect(pageFor(roles as string[] | null).canOpenAppManagement).toBe(false);
      }
    });

    it("has no separate Editor visibility card any more", () => {
      const page = pageFor(["admin"]) as any;
      expect(page.showEditorVisibilityCard).toBeUndefined();
      expect(page.canManageEditorVisibility).toBeUndefined();
    });

    it("opens the hub", () => {
      pageFor(["admin"]).navigateAppManagement();
      expect(navigateForward).toHaveBeenCalledWith("user/app-management");
    });
  });

  describe("the unread audit number", () => {
    it("is read for an administrator", async () => {
      const page = pageFor(["admin"]);
      unread.and.returnValue(Promise.resolve({ count: 4, alertCount: 1 }));
      page.loadAuditUnread();
      await Promise.resolve();
      await Promise.resolve();
      expect(page.auditUnread).toBe(4);
      expect(page.auditAlerts).toBe(1);
    });

    it("is not even requested for anyone else, and is cleared", () => {
      const page = pageFor(["contentAdmin"]);
      page.auditUnread = 3;
      page.auditAlerts = 1;
      page.loadAuditUnread();
      expect(unread).not.toHaveBeenCalled();
      expect(page.auditUnread).toBe(0);
      expect(page.auditAlerts).toBe(0);
    });

    it("refreshes each time the start page is shown", () => {
      const page = pageFor(["admin"]);
      page.ionViewWillEnter();
      page.ionViewWillEnter();
      expect(unread).toHaveBeenCalledTimes(2);
    });

    it("does not break the page when the number cannot be loaded", async () => {
      const page = pageFor(["admin"]);
      unread.and.returnValue(Promise.reject(new Error("offline")));
      page.loadAuditUnread();
      await Promise.resolve();
      await Promise.resolve();
      expect(page.auditUnread).toBe(0);
    });
  });
});
