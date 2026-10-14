import { environment } from "../../../../environments/environment";
import { MapFeaturesModalPage } from "./map-features-modal.page";

// The landmark map of the Map features dialog needs a style for the kind of world the task is in.
describe("MapFeaturesModalPage map style", () => {
  const pageFor = (props: Partial<MapFeaturesModalPage>) =>
    Object.assign(Object.create(MapFeaturesModalPage.prototype), props) as MapFeaturesModalPage;

  it("uses the real-world style for a real-world task, which has no virtual environment type", () => {
    const style = pageFor({ isVirtualWorld: false, virEnvType: undefined }).mapStyleUrl();
    expect(style).toBe(environment.mapStyle + "realWorld.json");
    expect(style).not.toContain("undefined");
  });

  it("uses the real-world style when the flag is simply not set", () => {
    expect(pageFor({}).mapStyleUrl()).toBe(environment.mapStyle + "realWorld.json");
  });

  it("ignores a stray environment type in the real world", () => {
    expect(pageFor({ isVirtualWorld: false, virEnvType: "someWorld" }).mapStyleUrl()).toBe(environment.mapStyle + "realWorld.json");
  });

  it("uses the chosen virtual environment's style for a virtual task", () => {
    expect(pageFor({ isVirtualWorld: true, virEnvType: "virtualEnv_1" }).mapStyleUrl()).toBe(
      environment.mapStyle + "virtualEnv_1.json"
    );
  });
});
