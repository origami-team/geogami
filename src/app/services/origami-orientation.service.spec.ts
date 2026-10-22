import { NgZone } from "@angular/core";
import { DeviceOrientation } from "@awesome-cordova-plugins/device-orientation/ngx";
import { OrigamiOrientationService } from "./origami-orientation.service";

// The compass arrow on the playing page. On a device (Capacitor) the heading comes from the
// Cordova compass plugin through the DeviceOrientation wrapper; this spec runs the REAL wrapper
// against a fake native plugin, so it pins what the service needs from it: the watch options per
// platform, one native watch only, throttled delivery, failures reported, and the watch surviving clear().

type Watch = { ok: (heading: any) => void; fail: (error: any) => void; options: any };

describe("OrigamiOrientationService (native compass)", () => {
  let watches: Watch[];
  let compass: { watchHeading: jasmine.Spy; clearWatch: jasmine.Spy };
  let platforms: string[];
  let service: OrigamiOrientationService;

  const heading = (value: number) => ({ magneticHeading: value, trueHeading: value, headingAccuracy: 5, timestamp: 0 });

  const alertController = { create: () => Promise.resolve({ present: () => Promise.resolve() }) };

  function create() {
    const platform: any = { is: (name: string) => platforms.includes(name) };
    return new OrigamiOrientationService(
      platform,
      new DeviceOrientation(),
      {} as any, // Socket: only used in virtual worlds
      alertController as any, // only used to ask for the sensor permission in a browser
      { instant: (key: string) => key } as any,
      new NgZone({ enableLongStackTrace: false })
    );
  }

  /** the throttle timer of the service is 50 ms */
  const flush = () => jasmine.clock().tick(60);

  beforeEach(() => {
    jasmine.clock().install();
    watches = [];
    compass = {
      watchHeading: jasmine.createSpy("watchHeading").and.callFake((ok: any, fail: any, options: any) => {
        watches.push({ ok, fail, options });
        return "watch-" + watches.length;
      }),
      clearWatch: jasmine.createSpy("clearWatch"),
    };
    (window as any).cordova = {};
    (navigator as any).compass = compass;
    platforms = ["capacitor", "android"];
    service = create();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    delete (window as any).cordova;
    delete (navigator as any).compass;
  });

  it("on Android it polls the sensor: frequency 10", async () => {
    await service.init(false);

    expect(compass.watchHeading).toHaveBeenCalledTimes(1);
    expect(watches[0].options).toEqual({ frequency: 10 });
  });

  it("on iOS it asks for a filter of one degree instead", async () => {
    platforms = ["capacitor", "ios"];
    service = create();

    await service.init(false);

    expect(watches[0].options).toEqual({ filter: 1 });
  });

  it("does not touch the native plugin in the browser, even when Cordova objects exist", async () => {
    platforms = ["mobileweb", "android", "capacitor"]; // a Capacitor shell opened as a mobile web page
    service = create();
    spyOn(window, "addEventListener");

    await service.init(false);

    expect(compass.watchHeading).not.toHaveBeenCalled();
  });

  it("does not touch the native plugin for a virtual-world game", async () => {
    const socket: any = { on: () => {} };
    service = new OrigamiOrientationService(
      { is: (n: string) => platforms.includes(n) } as any,
      new DeviceOrientation(),
      socket,
      alertController as any,
      {} as any,
      new NgZone({ enableLongStackTrace: false })
    );

    await service.init(true);

    expect(compass.watchHeading).not.toHaveBeenCalled();
  });

  it("delivers the magnetic heading of a reading", async () => {
    const received: number[] = [];
    service.orientationSubscription.subscribe((value) => received.push(value));
    await service.init(false);

    watches[0].ok(heading(123));
    flush();

    expect(received).toEqual([123]);
  });

  it("readings that arrive within one throttle interval are merged: the last one wins", async () => {
    const received: number[] = [];
    service.orientationSubscription.subscribe((value) => received.push(value));
    await service.init(false);

    watches[0].ok(heading(10));
    watches[0].ok(heading(20));
    watches[0].ok(heading(30));
    flush();
    watches[0].ok(heading(40));
    flush();

    expect(received).toEqual([30, 40]);
  });

  it("a late subscriber still gets the latest heading (replay of one)", async () => {
    await service.init(false);
    watches[0].ok(heading(77));
    flush();

    const received: number[] = [];
    service.orientationSubscription.subscribe((value) => received.push(value));

    expect(received).toEqual([77]);
  });

  it("reports a failing sensor instead of swallowing it", async () => {
    const error = spyOn(console, "error");
    await service.init(false);

    watches[0].fail({ code: 20 });

    expect(error).toHaveBeenCalledWith("[compass] watchHeading failed", { code: 20 });
  });

  it("an init call while the watch is running does not start a second native watch", async () => {
    await service.init(false);
    await service.init(false);

    expect(compass.watchHeading).toHaveBeenCalledTimes(1);
  });

  it("clear() completes the heading stream but leaves the native watch running (it cannot be stopped reliably)", async () => {
    let completed = false;
    service.orientationSubscription.subscribe({ complete: () => (completed = true) });
    await service.init(false);

    service.clear();

    expect(completed).toBe(true);
    expect(compass.clearWatch).not.toHaveBeenCalled();
  });

  it("the next game reuses the running watch: new stream, no second watch, headings arrive again", async () => {
    await service.init(false);
    service.clear();

    await service.init(false); // next game
    const received: number[] = [];
    service.orientationSubscription.subscribe((value) => received.push(value));
    watches[0].ok(heading(200));
    flush();

    expect(compass.watchHeading).toHaveBeenCalledTimes(1);
    expect(received).toEqual([200]);
  });

  it("readings that come in after the game is over are dropped", async () => {
    const received: number[] = [];
    service.orientationSubscription.subscribe((value) => received.push(value));
    await service.init(false);
    service.clear();

    watches[0].ok(heading(5));
    flush();

    expect(received).toEqual([]);
  });
});
