import { BehaviorSubject } from "rxjs";
import { RoleGuard } from "./auth-gard.service";
import { AuthService } from "./auth-service.service";

describe("AuthService.hasAnyRole", () => {
  const withUser = (user: any) => {
    const auth: any = Object.create(AuthService.prototype);
    auth.user$ = new BehaviorSubject(user);
    return auth as AuthService;
  };

  it("checks every role, not just the first one", () => {
    expect(withUser({ roles: ["user", "admin"] }).hasAnyRole(["admin", "contentAdmin"])).toBe(true);
    expect(withUser({ roles: ["scholar", "contentAdmin"] }).hasAnyRole(["admin", "contentAdmin"])).toBe(true);
  });

  it("is false for everyone else", () => {
    expect(withUser({ roles: ["user"] }).hasAnyRole(["admin", "contentAdmin"])).toBe(false);
    expect(withUser({ roles: ["trackAccess", "scholar"] }).hasAnyRole(["admin", "contentAdmin"])).toBe(false);
    expect(withUser({ roles: [] }).hasAnyRole(["admin"])).toBe(false);
    expect(withUser({}).hasAnyRole(["admin"])).toBe(false);
    expect(withUser(null).hasAnyRole(["admin"])).toBe(false);
    expect(withUser(undefined).hasAnyRole(["admin"])).toBe(false);
  });
});

describe("RoleGuard", () => {
  const route: any = { data: { roles: ["admin", "contentAdmin"] } };
  let roles: string[] | null;
  let refreshing$: BehaviorSubject<boolean>;
  let router: any;
  let guard: RoleGuard;

  beforeEach(() => {
    roles = null;
    refreshing$ = new BehaviorSubject<boolean>(false);
    router = { parseUrl: (url: string) => ({ redirectTo: url }) };
    const auth: any = {
      hasAnyRole: (wanted: string[]) => !!roles && roles.some((r) => wanted.indexOf(r) !== -1),
      getRefreshTokenInProgressValue: () => refreshing$.getValue(),
      getRefreshTokenInProgress: () => refreshing$.asObservable(),
    };
    guard = new RoleGuard(auth, router);
  });

  it("lets a user through whose admin role is not their first role", () => {
    roles = ["user", "admin"];
    expect(guard.canActivate(route)).toBe(true);
    roles = ["scholar", "contentAdmin"];
    expect(guard.canActivate(route)).toBe(true);
  });

  it("sends everyone else to the start page", () => {
    roles = ["user"];
    expect(guard.canActivate(route)).toEqual({ redirectTo: "/" } as any);
    roles = ["trackAccess", "scholar"];
    expect(guard.canActivate(route)).toEqual({ redirectTo: "/" } as any);
    roles = null;
    expect(guard.canActivate(route)).toEqual({ redirectTo: "/" } as any);
  });

  it("lets nobody through a route that names no roles", () => {
    roles = ["admin"];
    expect(guard.canActivate({ data: {} } as any)).toEqual({ redirectTo: "/" } as any);
  });

  it("waits for a page reload to restore the session before deciding", () => {
    refreshing$.next(true);
    roles = null; // the user is not restored yet
    let decision: any = "pending";
    (guard.canActivate(route) as any).subscribe((value: any) => (decision = value));
    expect(decision).toBe("pending");

    roles = ["user", "admin"]; // the session comes back...
    refreshing$.next(false); // ...and the restore finishes
    expect(decision).toBe(true);
  });

  it("turns away a restored session that has no matching role", () => {
    refreshing$.next(true);
    let decision: any = "pending";
    (guard.canActivate(route) as any).subscribe((value: any) => (decision = value));
    roles = ["user"];
    refreshing$.next(false);
    expect(decision).toEqual({ redirectTo: "/" });
  });
});
