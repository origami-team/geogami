import { Injectable } from "@angular/core";
import mapboxgl from "mapbox-gl";
import { virEnvLayers } from "src/app/models/virEnvsLayers";

@Injectable({
  providedIn: "root",
})
export class VEBuildingUtilService {
  constructor() {}

  /**
   * To chec whether value is in between a range of two values
   * @param h
   * @param min
   * @param max
   * @returns true if h value is in between min and max
   */
  valueBetween(h, min, max) {
    return h >= min && h <= max;
  }

  isAvatarWithinFloor(h, floorHeight) {
    return (
      this.valueBetween(h, floorHeight - 1, floorHeight - 0.3) ||
      this.valueBetween(h, floorHeight + 0.3, floorHeight + 1)
    );
  }

  isAvatarInGroundFloor(h, max) {
    return h <= max;
  }

  isAvatarInLastFloor(h, floorHeight) {
    return h >= floorHeight - 1;
  }

  updateMapLayer(map: mapboxgl.Map, virEnvType: string, selectedFloor: string) {
    let newStyle = map.getStyle();
    //* update layer image based on floor no
    newStyle.sources.overlay.url = `assets/vir_envs_layers/${virEnvType}_${selectedFloor}.png`;
    //* update layer dimensions
    newStyle.sources.overlay.coordinates =
      virEnvLayers[virEnvType].overlayCoords;
    //* apply new style on map
    map.setStyle(newStyle);
    //* update map max bounds
    map.setMaxBounds(virEnvLayers[virEnvType].bounds);
  }

  checkVEBuilding(virEnvType: string){
    return virEnvLayers[virEnvType].isVEBuilding ?? false;
  }

  setInitialFloor(virEnvType: string){
    let selectedEnv = virEnvLayers[virEnvType];
    let defaultFloor = selectedEnv.defaultFloor;
    return selectedEnv.floors[defaultFloor].tag;
  }
}