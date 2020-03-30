import { Map as MapboxMap } from "mapbox-gl";
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';

export enum GeolocateType {
    None,
    Continuous,
    Button,
    TaskStart
}

export class GeolocateControl {
    private positionWatch: number;
    private geolocateType: GeolocateType = GeolocateType.None

    private map: MapboxMap;

    private isInitalized = false;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService) {
        this.map = map;

        this.geolocationService.geolocationSubscription.subscribe(
            position => {
                console.log(position)
                if (this.map && this.map.getLayer('geolocate')) {
                    this.map.getSource('geolocate').setData({
                        type: "Point",
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    });
                }
            }, err => console.error(err)
        );
        this.map.loadImage(
            "/assets/icons/position.png",
            (error, image) => {
                if (error) throw error;

                this.map.addImage("geolocate", image);

                this.map.addSource("geolocate", {
                    type: "geojson",
                    data: {
                        type: "Point",
                        coordinates: [
                            0, 0
                        ]
                    }
                });
                this.map.addLayer({
                    id: "geolocate",
                    source: "geolocate",
                    type: "symbol",
                    layout: {
                        "icon-image": "geolocate",
                        "icon-size": 0.4,
                        "icon-offset": [0, 0]
                    }
                });
                this.map.setLayoutProperty('geolocate', 'visibility', 'none');
                this.isInitalized = true;
            });
        this.update()
    }

    public setType(type: GeolocateType): void {
        if (this.map != undefined) {
            this.geolocateType = type
            this.reset();
            this.update();
        }
    }

    toggle() {
        if (this.map.getLayoutProperty("geolocate", "visibility") == 'none') {
            this.map.setLayoutProperty('geolocate', 'visibility', 'visible');
        } else {
            this.map.setLayoutProperty('geolocate', 'visibility', 'none');
        }

    }

    private reset(): void {
        if (this.map.getLayer('geolocate') && this.map.getLayoutProperty("geolocate", "visibility") == 'visible')
            this.map.setLayoutProperty('geolocate', 'visibility', 'none');

    }

    private update(): void {
        if (!this.isInitalized) {
            return
        }
        switch (this.geolocateType) {
            case GeolocateType.None:
                this.reset()
                break;
            case GeolocateType.Continuous:
                if (this.map.getLayoutProperty("geolocate", "visibility") == 'none')
                    this.map.setLayoutProperty('geolocate', 'visibility', 'visible');

                break;
            case GeolocateType.Button:
                // TODO: implement
                break;
            case GeolocateType.TaskStart:
                // TODO: implement
                break;
        }
    }

    public remove(): void {
        this.reset();
        // navigator.geolocation.clearWatch(this.positionWatch);
    }
}