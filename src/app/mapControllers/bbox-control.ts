import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-bbox-control',
    template: `
        <mgl-geojson-source id="bboxSource" [data]="bboxGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="bboxPolygon"
            type="line"
            source="bboxSource"
            [filter]="polygonFilter"
            [paint]="bboxPaint"
        ></mgl-layer>
    `,
})
export class BBoxControlComponent implements OnInit, OnChanges {
    @Input() bbox: GeoJSON.FeatureCollection<any>;

    warningColor: string;

    bboxGeometry: GeoJSON.FeatureCollection<any> = {
        features: [],
        type: 'FeatureCollection'
    };

    bboxPaint: mapboxgl.LinePaint = {
        'line-opacity': 0.5,
        'line-width': 10,
        'line-dasharray': [2, 1]
    };

    polygonFilter: any[] = ['all', ['==', ['geometry-type'], 'Polygon']];


    constructor() {
        this.warningColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
    }

    ngOnInit(): void {
        this.bboxPaint = {
            ...this.bboxPaint,
            'line-color': this.warningColor
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.bbox) this.bboxGeometry = changes.bbox.currentValue;
    }
}