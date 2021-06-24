import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-track-control',
    template: `
        <mgl-geojson-source id="trackSource" [data]="trackGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="trackLineString"
            type="line"
            source="trackSource"
            [paint]="trackLinePaint"
            [layout]="trackLineLayout"
        ></mgl-layer>
    `,
})

export class TrackControlComponent implements OnChanges, OnDestroy {
    @Input() visible = true;

    trackGeometry: GeoJSON.LineString = {
        type: 'LineString',
        coordinates: []
    };

    trackLinePaint: mapboxgl.LinePaint = {
        'line-color': 'red',
        'line-opacity': 0.5,
        'line-width': 5
    };

    trackLineLayout: mapboxgl.LineLayout = {
        'line-cap': 'round'
    };


    private positionSubscription: Subscription;

    constructor(private geolocationService: OrigamiGeolocationService) {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

        this.positionSubscription = this.geolocationService.geolocationSubscription
            .pipe(filter(p => p.coords.accuracy <= 5))
            .subscribe(position => {
                this.trackGeometry.coordinates.push([
                    position.coords.longitude,
                    position.coords.latitude
                ]);
            });
    }


    ngOnChanges(changes: SimpleChanges): void {
        this.trackLineLayout = {
            ...this.trackLineLayout,
            visibility: changes.visible.currentValue ? 'visible' : 'none'
        };
    }

    ngOnDestroy(): void {
        this.positionSubscription.unsubscribe();
    }
}