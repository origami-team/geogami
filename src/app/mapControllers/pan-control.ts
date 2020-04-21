import { Map as MapboxMap } from "mapbox-gl";
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';

import { Plugins } from '@capacitor/core'


export enum PanType {
    True,
    Center,
    Static,
}

export class PanControl {
    private positionSubscription: Subscription;
    private panType: PanType = PanType.True

    private map: MapboxMap;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService) {
        this.map = map;
        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
            position => {
                if (this.map != undefined && this.panType == PanType.Center) {
                    this.map.setCenter([position.coords.longitude, position.coords.latitude])
                    // this.map.panTo([position.coords.longitude, position.coords.latitude]);
                }
            }
        );
    }

    public setType(type: PanType): void {
        if (this.map != undefined) {
            this.panType = type
            this.reset();
            this.update();
        }
    }

    private reset(): void {
        this.map.dragPan.enable();
    }

    private update(): void {
        switch (this.panType) {
            case PanType.True:
                break;
            case PanType.Center:
                this.map.dragPan.disable();
                break;
            case PanType.Static:
                this.map.dragPan.disable();
                break;
        }
    }

    public remove(): void {
        this.positionSubscription.unsubscribe();
    }
}