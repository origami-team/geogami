import { Injectable } from "@angular/core";
import mapboxgl from "mapbox-gl";
import { virEnvLayers } from "src/app/models/virEnvsLayers";

@Injectable({
  providedIn: "root",
})
export class VEBuildingUtilService {
  currentFloor: string;
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

  checkVEBuilding(virEnvType: string) {
    return virEnvLayers[virEnvType].isVEBuilding ?? false;
  }

  setInitialFloor(virEnvType: string) {
    let selectedEnv = virEnvLayers[virEnvType];
    let defaultFloor = selectedEnv.defaultFloor;
    return selectedEnv.floors[defaultFloor].tag;
  }

  updateMapViewBasedOnFloorHeight(virEnvType, avatarPosition_y, map) {
    // if (virEnvType == "VirEnv_40") {
    // Floor 0 / library
    if (
      this.isAvatarInGroundFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[0].height + 1
      )
    ) {
      this.currentFloor = "f-1";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f-1.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[1].height
      )
    ) {
      this.currentFloor = "f0";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f0.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[2].height
      )
    ) {
      this.currentFloor = "f1";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f1.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[3].height
      )
    ) {
      this.currentFloor = "f2";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f2.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[4].height
      )
    ) {
      this.currentFloor = "f3";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f3.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[5].height
      )
    ) {
      this.currentFloor = "f4";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f4.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarWithinFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[6].height
      )
    ) {
      this.currentFloor = "f5";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f5.png",
        map,
        virEnvType
      );
    } else if (
      this.isAvatarInLastFloor(
        avatarPosition_y,
        virEnvLayers[virEnvType].floors[7].height
      )
    ) {
      this.currentFloor = "f6";
      this.updateMapStyleOverlayLayer(
        "assets/vir_envs_layers/VirEnv_40_f6.png",
        map,
        virEnvType
      );
    }
    // }
  }

  /* (V.E.): to load view dir. marker after changing style */
  // ToDo: update it to include all markers and layers- maybe find a way to copy all layers form one ma style to another
  async updateMapStyleOverlayLayer(styleOverlayUrlPath, map, virEnvType) {
    let newStyle = map.getStyle();

    //* update layer dimensions
    newStyle.sources.overlay.coordinates =
      virEnvLayers[virEnvType].overlayCoords;
    //* update maxBounds
    map.setMaxBounds(virEnvLayers[virEnvType].bounds);
    //* update zoom level of the env.
    map.setZoom(virEnvLayers[virEnvType].zoom);
    //* update map center
    map.setCenter(virEnvLayers[virEnvType].center);

    //* update layer image
    newStyle.sources.overlay.url = styleOverlayUrlPath;
    map.setStyle(newStyle);
  }

  setCurrentFloor(val){
    this.currentFloor = val;
  }

  getCurrentFloor(){
    return this.currentFloor;
  }

  isAvatartInDestinationFloor(taskFloor){
    return this.currentFloor === taskFloor;
  }

  checkFloorChange(floorNo_floor){
    return this.currentFloor !== floorNo_floor;
  } 
}
