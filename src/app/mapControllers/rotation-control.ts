import { Map as MapboxMap } from "mapbox-gl";
import { Subscription } from 'rxjs';
import { OrigamiOrientationService } from '../services/origami-orientation.service';

export enum RotationType {
    Manual,
    Auto,
    Button,
    North
}

export class RotationControl {
    private deviceOrientationSubscription: Subscription;
    private rotationType: RotationType = RotationType.Manual

    private map: MapboxMap;

    constructor(map: MapboxMap, private orientationService: OrigamiOrientationService) {
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

    public toggle() {
        if (this.rotationType != RotationType.Auto) {
            this.setType(RotationType.Auto)
        } else {
            this.setType(RotationType.North)
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
                this.map.dragRotate.disable();
                this.map.touchZoomRotate.disableRotation();

                this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe((heading: number) => {
                    requestAnimationFrame(() => {
                        this.map.rotateTo(heading, { duration: 20 });
                    })
                })
                break;
            case RotationType.Button:

                break;
            case RotationType.North:
                setTimeout(() => {
                    this.map.resetNorth({ duration: 50 });
                    this.map.dragRotate.disable();
                    this.map.touchZoomRotate.disableRotation();
                }, 100)
                break;
        }
    }

    public remove(): void {
        if (this.deviceOrientationSubscription != undefined) {
            this.deviceOrientationSubscription.unsubscribe();
        }
    }
}