import { Map as MapboxMap } from "mapbox-gl";
import {
    DeviceOrientation,
    DeviceOrientationCompassHeading
} from "@ionic-native/device-orientation/ngx";
import { Subscription } from 'rxjs';

export enum ViewDirectionType {
    None,
    Continuous,
    Button,
    TaskStart
}

export class ViewDirectionControl {
    private deviceOrientationSubscription: Subscription;
    private deviceOrientation: DeviceOrientation
    private positionWatch: number;
    private viewDirectionType: ViewDirectionType = ViewDirectionType.None

    private map: MapboxMap;

    private isInitalized = false;

    constructor(map: MapboxMap, deviceOrientation: DeviceOrientation) {
        this.map = map;

        this.deviceOrientation = deviceOrientation;

        this.positionWatch = window.navigator.geolocation.watchPosition(
            position => {
                if (map != undefined && this.isInitalized) {
                    map.getSource('viewDirection').setData({
                        type: "Point",
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    });
                }
            }
        );
        this.map.loadImage(
            "/assets/icons/directionv2.png",
            (error, image) => {
                if (error) throw error;

                this.map.addImage("view-direction", image);

                this.map.addSource("viewDirection", {
                    type: "geojson",
                    data: {
                        type: "Point",
                        coordinates: [
                            0, 0
                        ]
                    }
                });
                this.map.addLayer({
                    id: "viewDirection",
                    source: "viewDirection",
                    type: "symbol",
                    layout: {
                        "icon-image": "view-direction",
                        "icon-size": 0.65,
                        "icon-offset": [0, -12.5]
                    }
                });
                this.map.setLayoutProperty('viewDirection', 'visibility', 'none');
                this.isInitalized = true;
            });
        this.update()
    }

    public setType(type: ViewDirectionType): void {
        if (this.map != undefined) {
            this.viewDirectionType = type
            this.reset();
            this.update();
        }
    }

    private reset(): void {
        if (this.deviceOrientationSubscription != undefined)
            this.deviceOrientationSubscription.unsubscribe();
        if (this.map.getStyle().layers.includes('viewDirection') && this.map.getLayoutProperty("viewDirection", "visibility") == 'visible')
            this.map.setLayoutProperty('viewDirection', 'visibility', 'none');

    }

    private update(): void {
        switch (this.viewDirectionType) {
            case ViewDirectionType.None:
                this.reset()
                break;
            case ViewDirectionType.Continuous:
                this.deviceOrientationSubscription = this.deviceOrientation
                    .watchHeading({
                        frequency: 300
                    })
                    .subscribe((data: DeviceOrientationCompassHeading) => {
                        if (this.map.getLayoutProperty("viewDirection", "visibility") == 'none')
                            this.map.setLayoutProperty('viewDirection', 'visibility', 'visible');
                        this.map.setLayoutProperty(
                            "viewDirection",
                            "icon-rotate",
                            data.magneticHeading
                        );
                    })
                break;
            case ViewDirectionType.Button:
                // TODO: implement
                break;
            case ViewDirectionType.TaskStart:
                // TODO: implement
                break;
        }
    }

    public remove(map: MapboxMap): void {
        this.deviceOrientationSubscription.unsubscribe();
        navigator.geolocation.clearWatch(this.positionWatch);
    }
}