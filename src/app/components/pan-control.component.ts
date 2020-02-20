import { Map as MapboxMap } from "mapbox-gl";

export enum PanType {
    True,
    Center,
    Static,
}

export class PanControl {
    private positionWatch: number;
    private panType: PanType = PanType.True

    private map: MapboxMap;

    constructor(map: MapboxMap) {
        this.map = map;

        this.positionWatch = window.navigator.geolocation.watchPosition(
            position => {
                if (map != undefined && this.panType == PanType.Center) {
                    this.map.setCenter(position.coords);
                }
            },
            err => console.error(err),
            {
                enableHighAccuracy: true
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

    }

    private update(): void {
        switch (this.panType) {
            case PanType.True:
                this.reset()
                this.map.dragPan.enable();
                break;
            case PanType.Center:

                break;
            case PanType.Static:
                this.map.dragPan.disable();
                this.map.scrollZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable();
                break;
        }
    }

    public remove(map: MapboxMap): void {
        navigator.geolocation.clearWatch(this.positionWatch);
    }
}