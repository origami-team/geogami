import { Marker, Map as MapboxMap } from "mapbox-gl";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import MapboxCompare from "mapbox-gl-compare";
import { ElementRef } from "@angular/core";
import { Subscription, Observable, fromEvent } from "rxjs";
import { AlertController, Platform } from "@ionic/angular";

export enum LayerType {
  Standard,
  Selection,
  Satellite,
  SatelliteButton,
  Swipe,
  ThreeDimension,
  ThreeDimensionButton,
  Blank,
  BlankSwipe,
}

export class LayerControl {
  constructor(
    map: MapboxMap,
    mapWrapper: ElementRef,
    alertController: AlertController,
    platform: Platform
  ) {
    this.map = map;
    this.alertController = alertController;
    this.platform = platform;
    this.mapWrapper = mapWrapper;

    this.map.addSource("satellite", {
      type: "raster",
      url: "mapbox://mapbox.satellite",
      tileSize: 256,
    });
  }
  private map: MapboxMap;
  private alertController: AlertController;
  private platform: Platform;
  private layerType: LayerType;
  private styleSwitcherControl: MapboxStyleSwitcherControl =
    new MapboxStyleSwitcherControl();
  private swipeMapContainer: ElementRef;
  private deviceOrientationSubscription: Subscription;
  private mapWrapper: ElementRef;

  private compare: MapboxCompare;

  private interval: NodeJS.Timeout;
  private satMap: MapboxMap;

  private isIosTiltRequested = false;

  public swipeClickSubscription: Observable<any> = null;

  private tilt = (e: DeviceOrientationEvent) => {
    if (e.beta <= 60 && e.beta >= 0) {
      requestAnimationFrame(() => {
        this.map.setPitch(e.beta);
      });
    }
  };

  public setType(
    type: LayerType,
    swipeMapContainer: ElementRef = undefined
  ): void {
    if (this.map != undefined) {
      if (this.satMap) {
        this.satMap.remove();
        this.satMap = null;
      }
      this.layerType = type;
      this.reset();
      this.swipeMapContainer = swipeMapContainer;
      this.update();
    }
  }

  public toggleSat() {
    if (this.map.getLayer("satellite")) {
      this.map.removeLayer("satellite");
    } else {
      this.map.addLayer({
        id: "satellite",
        source: "satellite",
        type: "raster",
      });
    }
  }

  public toggle3D() {
    if (this.layerType != LayerType.ThreeDimension) {
      this.setType(LayerType.ThreeDimension);
    } else {
      this.setType(LayerType.Standard);
    }
  }

  private reset(): void {
    if (this.deviceOrientationSubscription != undefined)
      this.deviceOrientationSubscription.unsubscribe();
    removeEventListener("deviceorientation", this.tilt);
    if (this.map.getLayer("satellite")) {
      this.map.removeLayer("satellite");
    }
    if (this.map.getLayer("3d-buildings")) {
      this.map.removeLayer("3d-buildings");
    }
    if (this.map.getLayer("blank")) {
      this.map.removeLayer("blank");
    }
    try {
      this.map.removeControl(this.styleSwitcherControl);
    } catch (e) {
      console.log(e);
    }
    if (this.compare != null) {
      this.compare.remove();
      this.compare = null;
    }
    clearInterval(this.interval);
  }

  update = async () => {
    switch (this.layerType) {
      case LayerType.Standard:
        setTimeout(() => {
          this.map.resetNorthPitch();
        }, 100);
        break;
      case LayerType.Selection:
        this.map.addControl(this.styleSwitcherControl);
        break;
      case LayerType.Satellite:
        // this.map.setStyle("mapbox://styles/mapbox/satellite-v9");
        this.map.addLayer(
          {
            id: "satellite",
            source: "satellite",
            type: "raster",
          },
          "building"
        );
        break;
      case LayerType.SatelliteButton:
        // TODO: implement
        break;
      case LayerType.Swipe:
        this.satMap = new MapboxMap({
          container: this.swipeMapContainer.nativeElement,
          style: "mapbox://styles/mapbox/satellite-v9",
          center: this.map.getCenter(),
          zoom: this.map.getZoom(),
          dragRotate: this.map.dragRotate.isEnabled(),
          dragPan: this.map.dragPan.isEnabled(),
          scrollZoom: this.map.scrollZoom.isEnabled(),
          doubleClickZoom: this.map.doubleClickZoom.isEnabled(),
          touchZoomRotate: this.map.touchZoomRotate.isEnabled(),
          maxZoom: this.map.getMaxZoom(),
        });

        this.satMap.loadImage("/assets/icons/position.png", (error, image) => {
          if (error) throw error;

          this.satMap.addImage("geolocate", image);
          this.satMap.addImage("view-direction-click-geolocate", image);
        });

        this.satMap.loadImage(
          "/assets/icons/directionv2.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("view-direction", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/directionv2-richtung.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("view-direction-task", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/marker-editor.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("marker-editor", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/landmark-marker.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("landmark-marker", image);
          }
        );

        this.satMap.on("load", () => {
          if (!this.map.dragRotate.isEnabled()) {
            this.satMap.touchZoomRotate.disableRotation();
          }
          this.syncMaps();
        });
        this.map.on("styledata", () => this.syncMaps());
        this.map.on("sourcedata", () => this.syncMaps());

        this.swipeClickSubscription = fromEvent(this.satMap, "click");

        this.compare = new MapboxCompare(
          this.map,
          this.satMap,
          this.mapWrapper.nativeElement
        );
        break;
      case LayerType.ThreeDimension:
        this._add3DBuildingsLayer();

        if (this.platform.is("ios") && !this.isIosTiltRequested) {
          const alert = await this.alertController.create({
            header: "Neigungssensor nutzen?",
            message: "Bitte Bestätige die Nutzung des Neigungssensors",
            buttons: [
              {
                text: "Okay",
                handler: () => {
                  this.isIosTiltRequested = true;
                  if (
                    typeof (DeviceOrientationEvent as any).requestPermission ===
                    "function"
                  ) {
                    (DeviceOrientationEvent as any)
                      .requestPermission()
                      .then((permissionState) => {
                        if (permissionState === "granted") {
                          window.addEventListener(
                            "deviceorientation",
                            this.tilt,
                            false
                          );
                        }
                      })
                      .catch(console.error);
                  } else {
                    addEventListener("deviceorientation", this.tilt, false);
                  }
                },
              },
            ],
          });
          alert.present();
        } else {
          addEventListener("deviceorientation", this.tilt, false);
        }
        break;
      case LayerType.ThreeDimensionButton:
        // TODO: implement
        break;
      case LayerType.Blank:
        this.map.addLayer({
          id: "blank",
          type: "background",
          paint: {
            "background-color": "#fff",
          },
        });
        break;
      case LayerType.BlankSwipe:
        this.map.addLayer({
          id: "blank",
          type: "background",
          paint: {
            "background-color": "#fff",
          },
        });

        this.satMap = new MapboxMap({
          container: this.swipeMapContainer.nativeElement,
          style: "mapbox://styles/mapbox/satellite-v9",
          center: this.map.getCenter(),
          zoom: this.map.getZoom(),
          dragRotate: this.map.dragRotate.isEnabled(),
          dragPan: this.map.dragPan.isEnabled(),
          scrollZoom: this.map.scrollZoom.isEnabled(),
          doubleClickZoom: this.map.doubleClickZoom.isEnabled(),
          touchZoomRotate: this.map.touchZoomRotate.isEnabled(),
          maxZoom: this.map.getMaxZoom(),
        });

        this.satMap.loadImage("/assets/icons/position.png", (error, image) => {
          if (error) throw error;

          this.satMap.addImage("geolocate", image);
          this.satMap.addImage("view-direction-click-geolocate", image);
        });

        this.satMap.loadImage(
          "/assets/icons/directionv2.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("view-direction", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/directionv2-richtung.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("view-direction-task", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/marker-editor.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("marker-editor", image);
          }
        );

        this.satMap.loadImage(
          "/assets/icons/landmark-marker.png",
          (error, image) => {
            if (error) throw error;

            this.satMap.addImage("landmark-marker", image);
          }
        );

        this.satMap.on("load", () => {
          if (!this.map.dragRotate.isEnabled()) {
            this.satMap.touchZoomRotate.disableRotation();
          }
          this.syncMaps();
        });
        this.map.on("styledata", () => this.syncMaps());
        this.map.on("sourcedata", () => this.syncMaps());

        this.swipeClickSubscription = fromEvent(this.satMap, "click");

        this.compare = new MapboxCompare(
          this.map,
          this.satMap,
          this.mapWrapper.nativeElement
        );
        break;
    }
  };

  private _add3DBuildingsLayer(): void {
    // Add 3D buildungs
    // Insert the layer beneath any symbol layer.
    // var layers = this.map.getStyle().layers;

    // var labelLayerId;
    // for (var i = 0; i < layers.length; i++) {
    //     if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
    //         labelLayerId = layers[i].id;
    //         break;
    //     }
    // }

    this.map.addLayer(
      {
        id: "3d-buildings",
        source: "mapbox",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      }
      // labelLayerId
    );
  }

  public remove(): void {
    if (this.deviceOrientationSubscription != undefined)
      this.deviceOrientationSubscription.unsubscribe();

    if (this.swipeClickSubscription != undefined)
      this.swipeClickSubscription = null;
  }

  private syncMaps(): void {
    if (this.satMap && this.satMap.loaded()) {
      const defaultMapSources = this.map.getStyle().sources;
      const { mapbox, satellite, ...sources } = defaultMapSources;
      delete sources["raster-tiles"];

      const layers = this.map
        .getStyle()
        .layers.filter(
          (l) =>
            l.id !== "simple-tiles" && l.id !== "building" && l.id !== "blank"
        );

      Object.entries(sources).forEach((s: any) => {
        if (s.length > 0) {
          const source = this.satMap.getSource(s[0]);
          if (source != undefined) {
            source.setData(s[1].data);
          } else {
            this.satMap.addSource(s[0], s[1]);
          }
        }
      });

      layers.forEach((l) => {
        if (this.satMap.getLayer(l.id)) {
          if (
            l.id == "viewDirection" ||
            l.id == "viewDirectionTask" ||
            l.id == "viewDirectionClick"
          ) {
            const bearing = this.map.getLayoutProperty(l.id, "icon-rotate");
            this.satMap.setLayoutProperty(l.id, "icon-rotate", bearing);
          }
        } else {
          this.satMap.addLayer(l);
        }
      });
    }
  }

  public passMarkers(markers) {
    setTimeout(() => {
      if (this.layerType == LayerType.Swipe) {
        const { waypointMarker } = markers;
        if (waypointMarker) {
          waypointMarker.addTo(this.satMap);
        }
        const { waypointMarkerDuplicate } = markers;
        if (waypointMarkerDuplicate) {
          // waypointMarkerDuplicate.addTo(this.satMap)
          const elDuplicate = document.createElement("div");
          elDuplicate.className = "waypoint-marker-disabled";

          new Marker(elDuplicate, {
            anchor: "bottom",
            offset: [15, 0],
          })
            .setLngLat(waypointMarkerDuplicate._lngLat)
            .addTo(this.satMap);
        }
      }
    }, 500);
  }

  private _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> =>
    JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`);
}
