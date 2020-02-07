import { Map as MapboxMap } from "mapbox-gl";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import MapboxCompare from "mapbox-gl-compare";
import { ElementRef, Injectable } from '@angular/core';
import {
    DeviceOrientation,
    DeviceOrientationCompassHeading
} from "@ionic-native/device-orientation/ngx";
import { Subscription } from 'rxjs';
import { AlertController, Platform } from '@ionic/angular';


export enum LayerType {
    Standard,
    Selection,
    Satellite,
    SatelliteButton,
    Swipe,
    ThreeDimension,
    ThreeDimensionButton
}

export class LayerControl {
    private map: MapboxMap;
    private alertController: AlertController;
    private platform: Platform;
    private layerType: LayerType;
    private styleSwitcherControl: MapboxStyleSwitcherControl = new MapboxStyleSwitcherControl();
    private swipeMapContainer: ElementRef;
    private deviceOrientationSubscription: Subscription;

    private tilt = (e: DeviceOrientationEvent) => {
        if (e.beta <= 60 && e.beta >= 0) {
            requestAnimationFrame(() => {
                this.map.setPitch(e.beta);
            })
        }
    }

    constructor(map: MapboxMap, private deviceOrientation: DeviceOrientation, alertController: AlertController, platform: Platform) {
        this.map = map;
        this.alertController = alertController;
        this.platform = platform;
    }

    public setType(type: LayerType, swipeMapContainer: ElementRef = undefined): void {
        if (this.map != undefined) {
            this.layerType = type
            this.reset();
            this.swipeMapContainer = swipeMapContainer
            this.update();
        }
    }

    private reset(): void {
        if (this.deviceOrientationSubscription != undefined)
            this.deviceOrientationSubscription.unsubscribe();
        removeEventListener('deviceorientation', this.tilt)
        if (this.map.getLayer('satellite')) {
            this.map.removeLayer('satellite')
        }
        if (this.map.getLayer('3d-buildings')) {
            this.map.removeLayer('3d-buildings')
        }
    }

    update = async () => {
        switch (this.layerType) {
            case LayerType.Standard:
                break;
            case LayerType.Selection:
                this.map.addControl(this.styleSwitcherControl);
                break;
            case LayerType.Satellite:
                //this.map.setStyle("mapbox://styles/mapbox/satellite-v9");
                this.map.addLayer({
                    id: "satellite",
                    source: {
                        type: "raster",
                        url: "mapbox://mapbox.satellite",
                        tileSize: 256
                    },
                    type: "raster"
                });
                break;
            case LayerType.SatelliteButton:
                // TODO: implement
                break;
            case LayerType.Swipe:
                const satMap = new MapboxMap({
                    container: this.swipeMapContainer.nativeElement,
                    style: "mapbox://styles/mapbox/satellite-v9",
                    center: [8, 51.8],
                    zoom: 2
                });
                new MapboxCompare(this.map, satMap);
                break;
            case LayerType.ThreeDimension:
                this._add3DBuildingsLayer()
                this.deviceOrientationSubscription = this.deviceOrientation
                    .watchHeading({ frequency: 10 })
                    .subscribe((data: DeviceOrientationCompassHeading) => {
                        requestAnimationFrame(() => {
                            this.map.setBearing(data.magneticHeading);
                        })
                    })
                if (this.platform.is('ios')) {
                    const alert = await this.alertController.create({
                        header: 'Neigungssensor nutzen?',
                        message: 'Bitte Bestätige die Nutzung des Neigungssensors',
                        buttons: [
                            {
                                text: 'Okay',
                                handler: () => {
                                    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                                        (DeviceOrientationEvent as any).requestPermission()
                                            .then(permissionState => {
                                                if (permissionState === 'granted') {
                                                    window.addEventListener('deviceorientation', this.tilt, false);
                                                }
                                            })
                                            .catch(console.error);
                                    } else {
                                        addEventListener("deviceorientation", this.tilt, false);
                                    }
                                }
                            }
                        ]
                    });
                    alert.present();
                } else {
                    addEventListener("deviceorientation", this.tilt, false);
                }
                break;
            case LayerType.ThreeDimensionButton:
                // TODO: implement
                break;
        }
    }

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
                source: "composite",
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
                        ["get", "height"]
                    ],
                    "fill-extrusion-base": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        15,
                        0,
                        15.05,
                        ["get", "min_height"]
                    ],
                    "fill-extrusion-opacity": 0.6
                }
            },
            // labelLayerId
        );
    }

    public remove(): void {
        if (this.deviceOrientationSubscription != undefined)
            this.deviceOrientationSubscription.unsubscribe();
    }
}