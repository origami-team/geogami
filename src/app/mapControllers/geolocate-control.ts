import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-geolocate-control',
    template: `
        <mgl-geojson-source id="geolocateSource" [data]="geolocateGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="geolocateLayer"
            type="symbol"
            source="geolocateSource"
            [layout]="geolocateLayout"
        ></mgl-layer>
    `,
})
export class GeolocateControlComponent implements OnDestroy, OnChanges {
    @Input() visible = true;

    private positionSubscription: Subscription;

    geolocateLayout = {
        'icon-image': 'geolocate',
        'icon-size': 0.4,
        'icon-offset': [0, 0],
        visibility: 'visible'
    };

    geolocateGeometry: GeoJSON.Point = {
        type: 'Point',
        coordinates: [
            0, 0
        ]
    };

    constructor(private geolocationService: OrigamiGeolocationService) {

        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(position => {
            {
                this.geolocateGeometry = {
                    ...this.geolocateGeometry,
                    coordinates: [position.coords.longitude, position.coords.latitude]
                };
            }
        });
    }

    ngOnDestroy(): void {
        this.positionSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.geolocateLayout = {
            ...this.geolocateLayout,
            visibility: changes.visible.currentValue ? 'visible' : 'none'
        };
    }
}