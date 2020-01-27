import { IControl, Map as MapboxMap } from "mapbox-gl";
import {
    DeviceOrientation,
    DeviceOrientationCompassHeading
} from "@ionic-native/device-orientation/ngx";
import { Subscription } from 'rxjs';

export enum RotationType {
    Manual,
    Auto,
    Button,
    North
}

export default class RotationControl {
    private deviceOrientationSubscription: Subscription;
    private deviceOrientation: DeviceOrientation
    private rotationType: RotationType = RotationType.Manual

    private map: MapboxMap;

    constructor(map: MapboxMap) {
        this.deviceOrientation = new DeviceOrientation()

        this.map = map;
        this.rotate();
    }

    public setType(type: RotationType): void {
        if (this.map != undefined) {
            this.rotationType = type
            this.reset();
            this.rotate();
        }
    }

    private reset(): void {
        if (this.deviceOrientationSubscription != undefined)
            this.deviceOrientationSubscription.unsubscribe();
    }

    private rotate(): void {
        switch (this.rotationType) {
            case RotationType.Manual:
                this.map.dragRotate.enable();
                this.map.touchZoomRotate.enableRotation();
                break;
            case RotationType.Auto:
                this.deviceOrientationSubscription = this.deviceOrientation
                    .watchHeading()
                    .subscribe((data: DeviceOrientationCompassHeading) => {
                        this.map.setBearing(data.magneticHeading);
                    })
                break;
            case RotationType.Button:

                break;
            case RotationType.North:
                this.map.rotateTo(0);
                this.map.dragRotate.disable();
                this.map.touchZoomRotate.disableRotation();
                break;
        }
    }

    public remove(map: MapboxMap): void {
        this.map.rotateTo(0);
        this.deviceOrientationSubscription.unsubscribe();
    }
}