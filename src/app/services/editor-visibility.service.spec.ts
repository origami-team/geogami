import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { compiledDefaultFeatures } from "../helpers/editor-visibility";
import { AuthService } from "./auth-service.service";
import { EditorModeService } from "./editor-mode.service";
import { EditorVisibilityService } from "./editor-visibility.service";

describe("EditorVisibilityService", () => {
  const URL = `${environment.apiURL}/editor-visibility`;
  const CACHE_KEY = `geogami.editorPolicy.v1:${environment.apiURL}`;
  let http: HttpTestingController;
  let service: EditorVisibilityService;
  let modes: EditorModeService;
  let user$: BehaviorSubject<any>;

  const serverPolicy = (revision: number, overrides: { [id: string]: string } = {}) => ({
    revision,
    updatedAt: "2026-10-13T10:00:00.000Z",
    catalogue: null,
    features: { ...compiledDefaultFeatures(), ...overrides },
  });
  const clearStored = () =>
    Object.keys(localStorage)
      .filter((k) => k.indexOf("geogami.editor") === 0)
      .forEach((k) => localStorage.removeItem(k));

  function create() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getUser: () => user$.asObservable(),
            createHeaders: () => ({}),
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    modes = TestBed.inject(EditorModeService);
    service = TestBed.inject(EditorVisibilityService);
  }

  beforeEach(() => {
    clearStored();
    user$ = new BehaviorSubject<any>({ _id: "u1" });
    create();
  });
  afterEach(() => {
    http.verify();
    clearStored();
  });

  describe("decisions", () => {
    it("hides Advanced-only controls in Simple and shows everything in Advanced", () => {
      expect(service.mode).toBe("simple");
      expect(service.isVisible("map.zoom")).toBe(false);
      expect(service.isHiddenInSimple("map.zoom")).toBe(true);
      expect(service.isVisible("task.feedback")).toBe(true);
      modes.setMode("advanced");
      expect(service.isVisible("map.zoom")).toBe(true);
      // "hidden in Simple" is a statement about the policy, whatever mode is active
      expect(service.isHiddenInSimple("map.zoom")).toBe(true);
    });

    it("keeps a hidden control while the current selection needs it", () => {
      expect(service.isVisible("navigation.type.text", true)).toBe(true);
    });

    it("tells subscribers when the mode changes", () => {
      let emissions = 0;
      const subscription = service.changes$.subscribe(() => emissions++);
      const initial = emissions;
      modes.setMode("advanced");
      expect(emissions).toBe(initial + 1);
      subscription.unsubscribe();
    });
  });

  describe("loading the policy", () => {
    it("loads the saved policy from the server, authenticated", async () => {
      const loaded = service.fetchPolicy();
      const request = http.expectOne(URL);
      expect(request.request.method).toBe("GET");
      request.flush(serverPolicy(4, { "map.zoom": "both" }));
      const policy = await loaded;
      expect(policy.revision).toBe(4);
      expect(policy.source).toBe("server");
      expect(service.isVisible("map.zoom")).toBe(true);
    });

    it("rejects — and keeps what it had — when the response is malformed", async () => {
      const loaded = service.fetchPolicy();
      http.expectOne(URL).flush({ nonsense: true });
      await expectAsync(loaded).toBeRejected();
      expect(service.policy.source).toBe("defaults");
      expect(service.isVisible("map.zoom")).toBe(false);
    });

    it("rejects when the server cannot be reached", async () => {
      const loaded = service.fetchPolicy();
      http.expectOne(URL).flush("down", { status: 500, statusText: "Server Error" });
      await expectAsync(loaded).toBeRejected();
    });

    it("caches the last valid policy for the next start", async () => {
      const loaded = service.fetchPolicy();
      http.expectOne(URL).flush(serverPolicy(2, { "map.pan": "both" }));
      await loaded;
      expect(JSON.parse(localStorage.getItem(CACHE_KEY)).revision).toBe(2);

      create();
      expect(service.policy.source).toBe("cache");
      expect(service.isVisible("map.pan")).toBe(true);
    });

    it("ignores a damaged cache", () => {
      localStorage.setItem(CACHE_KEY, "{not json");
      create();
      expect(service.policy.source).toBe("defaults");
      localStorage.setItem(CACHE_KEY, JSON.stringify({ revision: -3, features: {} }));
      create();
      expect(service.policy.source).toBe("defaults");
    });
  });

  describe("authoring sessions", () => {
    it("works on the policy it had at the start, however the server changes", async () => {
      const started = service.startSession();
      http.expectOne(URL).flush(serverPolicy(1, { "map.zoom": "both" }));
      await started;
      expect(service.isVisible("map.zoom")).toBe(true);

      // an admin saves a new policy while the author is working
      const refreshed = service.fetchPolicy();
      http.expectOne(URL).flush(serverPolicy(2, { "map.zoom": "advanced" }));
      await refreshed;
      expect(service.policy.revision).toBe(1);
      expect(service.isVisible("map.zoom")).toBe(true);
    });

    it("takes the latest policy when the next session starts", async () => {
      const first = service.startSession();
      http.expectOne(URL).flush(serverPolicy(1, { "map.zoom": "both" }));
      await first;

      const second = service.startSession();
      http.expectOne(URL).flush(serverPolicy(2, { "map.zoom": "advanced" }));
      await second;
      expect(service.policy.revision).toBe(2);
      expect(service.isVisible("map.zoom")).toBe(false);
    });

    it("joins a running session instead of fetching again", async () => {
      const first = service.startSession();
      http.expectOne(URL).flush(serverPolicy(1));
      await first;
      await service.startSession(false);
      http.expectNone(URL);
      expect(service.policy.revision).toBe(1);
    });

    it("starts a session when none is running, even for a page that joins", async () => {
      const joined = service.startSession(false);
      http.expectOne(URL).flush(serverPolicy(3));
      await joined;
      expect(service.policy.revision).toBe(3);
    });

    it("carries on with the last known policy when the server cannot be reached", async () => {
      const started = service.startSession();
      http.expectOne(URL).error(new ErrorEvent("offline"));
      await started;
      expect(service.policy.source).toBe("defaults");
      expect(service.isVisible("task.feedback")).toBe(true);
      // Advanced stays reachable
      modes.setMode("advanced");
      expect(service.isVisible("map.zoom")).toBe(true);
    });

    it("carries on with the cached policy when the server cannot be reached", async () => {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ revision: 5, features: { ...compiledDefaultFeatures(), "map.zoom": "both" } }));
      create();
      const started = service.startSession();
      http.expectOne(URL).flush("down", { status: 503, statusText: "Unavailable" });
      await started;
      expect(service.policy.source).toBe("cache");
      expect(service.isVisible("map.zoom")).toBe(true);
    });

    it("does not wait forever for a slow server", fakeAsync(() => {
      let done = false;
      service.startSession().then(() => (done = true));
      http.expectOne(URL); // never answered
      tick(3999);
      expect(done).toBe(false);
      tick(2);
      expect(done).toBe(true);
      expect(service.policy.source).toBe("defaults");
    }));
  });

  describe("saving", () => {
    it("sends the revision it read and the classifications, and remembers the result", async () => {
      const saved = service.savePolicy(4, { "map.zoom": "both" });
      const request = http.expectOne(URL);
      expect(request.request.method).toBe("PUT");
      expect(request.request.body).toEqual({ expectedRevision: 4, features: { "map.zoom": "both" } });
      request.flush(serverPolicy(5, { "map.zoom": "both" }));
      const policy = await saved;
      expect(policy.revision).toBe(5);
      expect(service.isVisible("map.zoom")).toBe(true);
    });

    it("reports a conflict without changing what it knows", async () => {
      const saved = service.savePolicy(1, { "map.zoom": "both" });
      http.expectOne(URL).flush({ message: "stale", current: serverPolicy(2) }, { status: 409, statusText: "Conflict" });
      await expectAsync(saved).toBeRejectedWith(jasmine.objectContaining({ status: 409 }));
      expect(service.policy.revision).toBe(0);
    });

    it("does not report success for a failed save", async () => {
      const saved = service.savePolicy(0, { "map.zoom": "both" });
      http.expectOne(URL).flush("denied", { status: 401, statusText: "Unauthorized" });
      await expectAsync(saved).toBeRejected();
      expect(service.isVisible("map.zoom")).toBe(false);
    });
  });
});
