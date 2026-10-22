import { DeviceOrientation } from "@awesome-cordova-plugins/device-orientation/ngx";
import { Network } from "@awesome-cordova-plugins/network/ngx";

// The app talks to two Cordova plugins through the Ionic Native / Awesome Cordova Plugins wrappers:
// the compass (DeviceOrientation.watchHeading) and the connection status (Network.onConnect /
// onDisconnect). These tests run the REAL wrapper classes against a fake native plugin object, so
// they pin exactly what the app relies on, whichever wrapper library is installed:
// argument order, what is emitted, how errors arrive and what unsubscribing does.

type Handlers = { ok: (heading: any) => void; fail: (error: any) => void; options: any; argCount: number };

function installCompass() {
  const watches: Handlers[] = [];
  const compass = {
    watchHeading: jasmine.createSpy("watchHeading").and.callFake((...args: any[]) => {
      watches.push({ ok: args[0], fail: args[1], options: args[2], argCount: args.length });
      return "watch-" + watches.length;
    }),
    clearWatch: jasmine.createSpy("clearWatch"),
    getCurrentHeading: jasmine.createSpy("getCurrentHeading"),
  };
  (window as any).cordova = {};
  (navigator as any).compass = compass;
  return { compass, watches };
}

function removeNative() {
  delete (window as any).cordova;
  delete (navigator as any).compass;
}

describe("DeviceOrientation wrapper (Cordova compass plugin)", () => {
  let deviceOrientation: DeviceOrientation;

  beforeEach(() => {
    deviceOrientation = new DeviceOrientation();
  });
  afterEach(removeNative);

  it("starts the native watch with (success, error, options) in that order", () => {
    const { compass, watches } = installCompass();
    const options = { frequency: 10 };

    deviceOrientation.watchHeading(options).subscribe();

    expect(compass.watchHeading).toHaveBeenCalledTimes(1);
    expect(typeof watches[0].ok).toBe("function");
    expect(typeof watches[0].fail).toBe("function");
    expect(watches[0].options).toBe(options);
    expect(watches[0].argCount).toBe(3);
  });

  it("passes the iOS filter option through unchanged", () => {
    const { watches } = installCompass();

    deviceOrientation.watchHeading({ filter: 1 }).subscribe();

    expect(watches[0].options).toEqual({ filter: 1 });
  });

  it("without options only the two callbacks are passed (map showroom)", () => {
    const { watches } = installCompass();

    deviceOrientation.watchHeading().subscribe();

    expect(watches[0].argCount).toBe(2);
  });

  it("does nothing natively until somebody subscribes", () => {
    const { compass } = installCompass();

    deviceOrientation.watchHeading({ frequency: 10 });

    expect(compass.watchHeading).not.toHaveBeenCalled();
  });

  it("emits every reading the plugin reports, as the same object", () => {
    const { watches } = installCompass();
    const received: any[] = [];
    deviceOrientation.watchHeading({ frequency: 10 }).subscribe((heading) => received.push(heading));

    const first = { magneticHeading: 12.5, trueHeading: 14, headingAccuracy: 5, timestamp: 1 };
    const second = { magneticHeading: 359, trueHeading: 1, headingAccuracy: 5, timestamp: 2 };
    watches[0].ok(first);
    watches[0].ok(second);

    expect(received).toEqual([first, second]);
    expect(received[0]).toBe(first);
  });

  it("a failure of the plugin arrives as an error of the observable", () => {
    const { watches } = installCompass();
    let error: any = null;
    deviceOrientation.watchHeading().subscribe({ error: (e) => (error = e) });

    watches[0].fail({ code: 20 });

    expect(error).toEqual({ code: 20 });
  });

  it("each subscription starts its own native watch", () => {
    const { compass } = installCompass();
    const observable = deviceOrientation.watchHeading({ frequency: 10 });

    observable.subscribe();
    observable.subscribe();

    expect(compass.watchHeading).toHaveBeenCalledTimes(2);
  });

  it("unsubscribing asks the plugin to clear the watch once", () => {
    const { compass } = installCompass();
    const subscription = deviceOrientation.watchHeading({ frequency: 10 }).subscribe();
    expect(compass.clearWatch).not.toHaveBeenCalled();

    subscription.unsubscribe();

    expect(compass.clearWatch).toHaveBeenCalledTimes(1);
  });

  it("without Cordova (a plain browser) the observable fails with 'cordova_not_available' instead of throwing", () => {
    spyOn(console, "warn"); // the library warns once per call
    let error: any = null;

    expect(() => deviceOrientation.watchHeading({ frequency: 10 }).subscribe({ error: (e) => (error = e) })).not.toThrow();

    expect(error).toBe("cordova_not_available");
  });

  it("with Cordova but without the plugin it fails with 'plugin_not_installed'", () => {
    spyOn(console, "warn");
    (window as any).cordova = {};
    let error: any = null;

    deviceOrientation.watchHeading({ frequency: 10 }).subscribe({ error: (e) => (error = e) });

    expect(error).toBe("plugin_not_installed");
  });
});

describe("Network wrapper (Cordova network-information plugin)", () => {
  let network: Network;

  beforeEach(() => {
    network = new Network();
  });

  it("onDisconnect emits when the document gets 'offline', and only then", () => {
    const events: any[] = [];
    const subscription = network.onDisconnect().subscribe((e) => events.push(e));

    document.dispatchEvent(new Event("online"));
    expect(events.length).toBe(0);

    document.dispatchEvent(new Event("offline"));
    document.dispatchEvent(new Event("offline"));
    expect(events.length).toBe(2);
    expect(events[0].type).toBe("offline");

    subscription.unsubscribe();
    document.dispatchEvent(new Event("offline"));
    expect(events.length).toBe(2);
  });

  it("onConnect emits when the document gets 'online', and only then", () => {
    const events: any[] = [];
    const subscription = network.onConnect().subscribe((e) => events.push(e));

    document.dispatchEvent(new Event("offline"));
    expect(events.length).toBe(0);

    document.dispatchEvent(new Event("online"));
    expect(events.length).toBe(1);
    expect(events[0].type).toBe("online");

    subscription.unsubscribe();
    document.dispatchEvent(new Event("online"));
    expect(events.length).toBe(1);
  });

  it("works in a plain browser: no Cordova object is needed to watch the events", () => {
    expect((window as any).cordova).toBeUndefined();
    let offline = 0;
    const subscription = network.onDisconnect().subscribe(() => offline++);

    document.dispatchEvent(new Event("offline"));

    expect(offline).toBe(1);
    subscription.unsubscribe();
  });

  it("the window-level events of a browser are not the plugin's events", () => {
    let count = 0;
    const subscription = network.onDisconnect().subscribe(() => count++);

    window.dispatchEvent(new Event("offline"));

    expect(count).toBe(0); // only the document is watched, as the native plugin fires there
    subscription.unsubscribe();
  });

  it("two subscribers are both told", () => {
    let a = 0;
    let b = 0;
    const first = network.onDisconnect().subscribe(() => a++);
    const second = network.onDisconnect().subscribe(() => b++);

    document.dispatchEvent(new Event("offline"));

    expect([a, b]).toEqual([1, 1]);
    first.unsubscribe();
    second.unsubscribe();
  });

  it("reports the connection type the plugin exposes", () => {
    (window as any).cordova = {};
    // `navigator.connection` is a read-only getter in Chrome, so define an own property over it
    Object.defineProperty(navigator, "connection", { value: { type: "wifi" }, configurable: true });
    try {
      expect(network.type).toBe("wifi");
    } finally {
      delete (navigator as any).connection;
      delete (window as any).cordova;
    }
  });
});
