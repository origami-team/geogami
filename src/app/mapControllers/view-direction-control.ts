import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { OrigamiOrientationService } from '../services/origami-orientation.service';

@Component({
    selector: 'app-view-direction-control',
    template: `
        <mgl-geojson-source id="viewDirectionSource" [data]="viewDirectionGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="viewDirectionLayer"
            type="symbol"
            source="viewDirectionSource"
            [layout]="viewDirectionLayout"
        ></mgl-layer>
    `,
})
export class ViewDirectionControlComponent implements OnDestroy, OnChanges {
    @Input() visible = true;
    @Input() map: mapboxgl.Map;

    private deviceOrientationSubscription: Subscription;
    private positionSubscription: Subscription;

    viewDirectionLayout = {
        'icon-image': 'view-direction',
        'icon-size': 0.65,
        'icon-offset': [0, -8],
        'icon-rotate': 0,
        visibility: 'visible'
    };

    viewDirectionGeometry: GeoJSON.Point = {
        type: 'Point',
        coordinates: [
            0, 0
        ]
    };

    constructor(private geolocationService: OrigamiGeolocationService, private orientationService: OrigamiOrientationService) {
        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(position => {
            this.viewDirectionGeometry = {
                ...this.viewDirectionGeometry,
                coordinates: [position.coords.longitude, position.coords.latitude]
            };
        }
        );
        this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe((heading: number) => {
            if (this.map) {
                this.viewDirectionLayout = {
                    ...this.viewDirectionLayout,
                    'icon-rotate': heading - this.map.getBearing()
                };
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.viewDirectionLayout = {
            ...this.viewDirectionLayout,
            visibility: changes.visible.currentValue ? 'visible' : 'none'
        };
    }

    ngOnDestroy(): void {
        this.positionSubscription.unsubscribe();
        this.deviceOrientationSubscription.unsubscribe();
    }
}