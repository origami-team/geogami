import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Subscription } from 'rxjs';


export enum GeolocateType {
    None,
    Continuous,
    Button,
    TaskStart
}

export class GeolocateControl {
    private positionSubscription: Subscription;
    private geolocateType: GeolocateType = GeolocateType.None;

    private map: MapboxMap;

    private isInitalized = false;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService) {
        this.map = map;

        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(position => {
            if (this.map && this.map.getLayer('geolocate')) {
                this.map.getSource('geolocate').setData({
                    type: 'Point',
                    coordinates: [position.coords.longitude, position.coords.latitude]
                });
            }
        });
        this.map.loadImage(
            '/assets/icons/position.png',
            (error, image) => {
                if (error) throw error;

                this.map.addImage('geolocate', image);

                this.map.addSource('geolocate', {
                    type: 'geojson',
                    data: {
                        type: 'Point',
                        coordinates: [
                            0, 0
                        ]
                    }
                });
                this.map.addLayer({
                    id: 'geolocate',
                    source: 'geolocate',
                    type: 'symbol',
                    layout: {
                        'icon-image': 'geolocate',
                        'icon-size': 0.4,
                        'icon-offset': [0, 0]
                    }
                });
                this.map.setLayoutProperty('geolocate', 'visibility', 'none');
                this.isInitalized = true;
                this.update();
            });
    }

    public setType(type: GeolocateType): void {
        if (this.map != undefined) {
            this.geolocateType = type;
            this.reset();
            this.update();
        }
    }

    toggle() {
        if (this.map.getLayoutProperty('geolocate', 'visibility') == 'none') {
            this.map.setLayoutProperty('geolocate', 'visibility', 'visible');
        } else {
            this.map.setLayoutProperty('geolocate', 'visibility', 'none');
        }

    }

    private reset(): void {
        if (this.map.getLayer('geolocate') && this.map.getLayoutProperty('geolocate', 'visibility') == 'visible')
            this.map.setLayoutProperty('geolocate', 'visibility', 'none');

    }

    private update(): void {
        if (!this.isInitalized) {
            return;
        }
        switch (this.geolocateType) {
            case GeolocateType.None:
                this.reset();
                break;
            case GeolocateType.Continuous:
                if (this.map.getLayoutProperty('geolocate', 'visibility') == 'none')
                    this.map.setLayoutProperty('geolocate', 'visibility', 'visible');

                break;
            case GeolocateType.Button:
                // TODO: implement
                break;
            case GeolocateType.TaskStart:
                if (this.map.getLayoutProperty('geolocate', 'visibility') == 'none')
                    this.map.setLayoutProperty('geolocate', 'visibility', 'visible');

                setTimeout(() => {
                    this.map.setLayoutProperty('geolocate', 'visibility', 'none');
                }, 10000);
                break;
        }
    }

    public remove(): void {
        this.reset();
        this.positionSubscription.unsubscribe();
    }
}