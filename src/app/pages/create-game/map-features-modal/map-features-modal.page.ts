import {
  Component,
  OnInit,
  ViewChild,
  OnChanges,
  ChangeDetectorRef,
  AfterViewInit,
  Input,
} from "@angular/core";
import { ModalController, PopoverController } from "@ionic/angular";

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { environment } from "src/environments/environment";

import { Plugins } from "@capacitor/core";

import { cloneDeep } from "lodash";
import { standardMapFeatures } from "../../../models/standardMapFeatures";
import { TranslateService } from "@ngx-translate/core";
import { PopoverComponent } from "src/app/popover/popover.component";

@Component({
  selector: "app-map-features-modal",
  templateUrl: "./map-features-modal.page.html",
  styleUrls: ["./map-features-modal.page.scss"],
})
export class MapFeaturesModalPage implements OnInit, AfterViewInit {
  @ViewChild("map") mapContainer;

  private draw: MapboxDraw;
  private map: mapboxgl.Map;

  @Input() features: any = cloneDeep(standardMapFeatures);

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;
  @Input() virEnvType: string;

  constructor(
    public modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    public popoverController: PopoverController
  ) { }

  ngOnInit() {
    if (this.features == undefined) {
      this.features = cloneDeep(standardMapFeatures);

      if (this.isVirtualWorld) {
        this.features.rotation = "north";
      }
    }

    this.onZoomChange();

    this.changeDetectorRef.detectChanges();
    mapboxgl.accessToken = environment.mapboxAccessToken;

    ////////Temp
    // Set bounds of VR world
    var bounds = [
      [0.0002307207207 - 0.002, 0.0003628597122 - 0.002], // Southwest coordinates
      [0.003717027207 + 0.002, 0.004459082914 + 0.002], // Northeast coordinates
    ];
    ///

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      /* style: (this.isVirtualWorld ?
        (this.isVRMirrored ? environment.mapStyle + 'virtualEnv_2.json' : environment.mapStyle + 'virtualEnv_1.json') :
        environment.mapStyle + 'realWorld.json'), */
      style: environment.mapStyle + this.virEnvType+".json",
      center: this.isVirtualWorld
        ? [0.005810510811 / 2, 0.006827038669 / 2]
        : [8, 51.8],
      zoom: this.isVirtualWorld ? 16.5 : 2,
      maxBounds: this.isVirtualWorld ? bounds : null, // Sets bounds as max
    });

    const landmarkColor = "orange";

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
      styles: [
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "fill-color": landmarkColor,
            "fill-outline-color": landmarkColor,
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": landmarkColor,
            "fill-outline-color": landmarkColor,
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-radius": 3,
            "circle-color": landmarkColor,
          },
        },
        {
          id: "gl-draw-polygon-stroke-inactive",
          type: "line",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-line-inactive",
          type: "line",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-line-active",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["==", "active", "true"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
          },
        },
        {
          id: "gl-draw-polygon-and-line-vertex-inactive",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 3,
            "circle-color": landmarkColor,
          },
        },
        {
          id: "gl-draw-point-inactive",
          type: "symbol",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Point"],
            ["==", "meta", "feature"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "icon-image": "landmark-marker",
            "icon-size": 1,
            "icon-anchor": "bottom",
            "icon-allow-overlap": true,
          },
        },
        {
          id: "gl-draw-point-active",
          type: "symbol",
          filter: [
            "all",
            ["==", "$type", "Point"],
            ["!=", "meta", "midpoint"],
            ["==", "active", "true"],
          ],
          layout: {
            "icon-image": "landmark-marker",
            "icon-size": 1.1,
            "icon-anchor": "bottom",
            "icon-allow-overlap": true,
          },
        },
        {
          id: "gl-draw-polygon-fill-static",
          type: "fill",
          filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": landmarkColor,
            "fill-outline-color": landmarkColor,
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-polygon-stroke-static",
          type: "line",
          filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-line-static",
          type: "line",
          filter: [
            "all",
            ["==", "mode", "static"],
            ["==", "$type", "LineString"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": landmarkColor,
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-point-static",
          type: "symbol",
          filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
          layout: {
            "icon-image": "landmark-marker",
            "icon-size": 1,
            "icon-anchor": "bottom",
            "icon-allow-overlap": true,
          },
        },
      ],
    });
    this.map.addControl(this.draw, "top-left");

    this.map.on("load", () => {
      this.map.resize();

      this.map.loadImage(
        "/assets/icons/landmark-marker.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("landmark-marker", image);
        }
      );

      // disable zoom to current position in VR world
      if (!this.isVirtualWorld) {
        Plugins.Geolocation.getCurrentPosition().then((position) => {
          this.map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 13,
            speed: 3,
          });

          this.map.loadImage("/assets/icons/position.png", (error, image) => {
            if (error) throw error;

            this.map.addImage("geolocate", image);

            this.map.addSource("geolocate", {
              type: "geojson",
              data: {
                type: "Point",
                coordinates: [
                  position.coords.longitude,
                  position.coords.latitude,
                ],
              },
            });
            this.map.addLayer({
              id: "geolocate",
              source: "geolocate",
              type: "symbol",
              layout: {
                "icon-image": "geolocate",
                "icon-size": 0.4,
                "icon-offset": [0, 0],
              },
            });
          });
        });
      }

      if (this.features.landmarkFeatures != undefined) {
      // console.log("adding feature", this.features.landmarkFeatures);
        if (this.features.landmarkFeatures.type == "FeatureCollection") {
          this.features.landmarkFeatures.features.forEach((element) => {
            this.draw.add({ properties: {}, ...element });
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    this.map.resize();
  }

  onZoomChange() {
    if (
      this.features.pan == "center" &&
      (this.features.zoombar == "task" || this.features.zoombar == "game")
    ) {
      this.features.pan = "true";
    }
  }

  dismissModal(dismissType: string = "null") {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true,
      data: {
        ...this.features,
        landmarkFeatures: this.draw.getAll(),
      },
    });
  }

  async showPopover(ev: any, key: string) {
    let text = this.translate.instant(key);

    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text },
    });
    return await popover.present();
  }
}
