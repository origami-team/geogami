import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum TrackType {
    Enabled,
    Disabled
}

export class TrackControl {
    private map: MapboxMap;
    private path: any;
    private trackType: TrackType;
    private positionSubscription: Subscription;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService) {
        this.map = map;
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        this.positionSubscription = this.geolocationService.geolocationSubscription
            .pipe(filter(p => p.coords.accuracy <= 5))
            .subscribe(position => {
                this.path.geometry.coordinates.push([
                    position.coords.longitude,
                    position.coords.latitude
                ]);
                if (this.map && this.map.getSource('track')) {
                    // this.map.getSource("track").setData(this.path);
                }
            });

        this.map.addSource('track', { type: 'geojson', data: this.path });
        this.map.addLayer({
            id: 'track',
            type: 'line',
            source: 'track',
            paint: {
                'line-color': dangerColor,
                'line-opacity': 0.5,
                'line-width': 5
            },
            layout: {
                'line-cap': 'round'
            }
        });
        this.map.setLayoutProperty('track', 'visibility', 'none');
    }

    public setType(type: TrackType): void {
        if (this.map != undefined) {
            this.trackType = type;
            this.reset();
            this.update();
        }
    }

    private reset(): void {
        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
    }

    private update(): void {
        switch (this.trackType) {
            case TrackType.Enabled:
                this.map.setLayoutProperty('track', 'visibility', 'visible');
                break;
            case TrackType.Disabled:
                this.map.setLayoutProperty('track', 'visibility', 'none');
                break;

        }
    }

    public remove(): void {
        if (this.map.getLayer('track')) {
            this.map.removeLayer('track');
        }
        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        this.positionSubscription.unsubscribe();
        // window.navigator.geolocation.clearWatch(this.trackPositionWatch);
    }
}