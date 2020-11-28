import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-landmark-control',
    template: `
        <mgl-geojson-source id="landmarksSource" [data]="landmarksGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="landmarksLayerPolygon"
            type="fill-extrusion"
            source="landmarksSource"
            [filter]="polygonFilter"
            [paint]="landmarksPolygonPaint"
        ></mgl-layer>
        <mgl-layer
            id="landmarksLayerLine"
            type="line"
            source="landmarksSource"
            [filter]="lineStringFilter"
            [paint]="landmarksLinePaint"
        ></mgl-layer>
        <mgl-layer
            id="landmarksLayerPoint"
            type="symbol"
            source="landmarksSource"
            [filter]="pointFilter"
            [layout]="landmarksPointLayout"
        ></mgl-layer>


        <mgl-geojson-source id="qtSource" [data]="qtGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="qtLayerPolygon"
            type="fill-extrusion"
            source="qtSource"
            [filter]="polygonFilter"
            [paint]="qtPolygonPaint"
        ></mgl-layer>
        <mgl-layer
            id="qtLayerLine"
            type="line"
            source="qtSource"
            [filter]="lineStringFilter"
            [paint]="qtLinePaint"
        ></mgl-layer>
        <mgl-layer
            id="qtLayerPoint"
            type="symbol"
            source="qtSource"
            [filter]="pointFilter"
            [layout]="qtPointLayout"
        ></mgl-layer>

        <mgl-geojson-source id="seachAreaSource" [data]="searchAreaGeometry">
        </mgl-geojson-source>
        <mgl-layer
            id="searchAreaLayer"
            type="line"
            source="seachAreaSource"
            [filter]="polygonFilter"
            [paint]="searchAreaPaint"
        ></mgl-layer>
    `,
})
export class LandmarkControlComponent implements OnInit, OnChanges {
    @Input() landmark: GeoJSON.FeatureCollection;
    @Input() qtLandmark: GeoJSON.FeatureCollection;
    @Input() searchArea: GeoJSON.FeatureCollection;

    private secondaryColor: string;
    private dangerColor;

    landmarksGeometry: GeoJSON.FeatureCollection = {
        features: [],
        type: 'FeatureCollection'
    };

    landmarksPolygonPaint: mapboxgl.FillExtrusionPaint = {
        'fill-extrusion-color': 'red',
        'fill-extrusion-opacity': 0.5,
        'fill-extrusion-height': 20,
    };

    landmarksLinePaint: mapboxgl.LinePaint = {
        'line-color': 'red',
        'line-opacity': 0.5,
        'line-width': 5,
    };


    landmarksPointLayout: mapboxgl.SymbolLayout = {
        'icon-image': 'landmark-marker',
        'icon-size': 1,
        'icon-anchor': 'bottom'
    };


    qtGeometry: GeoJSON.FeatureCollection = {
        features: [],
        type: 'FeatureCollection'
    };

    qtPolygonPaint: mapboxgl.FillExtrusionPaint = {
        'fill-extrusion-color': 'blue',
        'fill-extrusion-opacity': 0.5,
        'fill-extrusion-height': 20,
    };

    qtLinePaint: mapboxgl.LinePaint = {
        'line-color': 'blue',
        'line-opacity': 0.5,
        'line-width': 5,
    };

    qtPointLayout: mapboxgl.SymbolLayout = {
        'icon-image': 'marker-editor',
        'icon-size': .65,
        'icon-anchor': 'bottom'
    };

    searchAreaGeometry: GeoJSON.FeatureCollection = {
        features: [],
        type: 'FeatureCollection'
    };

    searchAreaPaint: mapboxgl.LinePaint = {
        'line-color': 'blue',
        'line-opacity': 0.5,
        'line-width': 5,
    };

    polygonFilter: any[] = ['all', ['==', ['geometry-type'], 'Polygon']];
    lineStringFilter: any[] = ['all', ['==', ['geometry-type'], 'LineString']];
    pointFilter: any[] = ['all', ['==', ['geometry-type'], 'Point']];


    constructor() {
        // this.warningColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
        this.secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
        this.dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');
        // this.tertiaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-tertiary');
    }

    ngOnInit(): void {
        this.landmarksPolygonPaint = {
            ...this.landmarksPolygonPaint,
            'fill-extrusion-color': this.dangerColor
        };
        this.landmarksLinePaint = {
            ...this.landmarksLinePaint,
            'line-color': this.dangerColor
        };
        this.qtPolygonPaint = {
            ...this.qtPolygonPaint,
            'fill-extrusion-color': this.secondaryColor
        };
        this.qtLinePaint = {
            ...this.qtLinePaint,
            'line-color': this.secondaryColor
        };
        this.searchAreaPaint = {
            ...this.searchAreaPaint,
            'line-color': this.secondaryColor
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.landmark) {
            if (changes.landmark.currentValue === undefined) {
                this.landmarksGeometry = {
                    ...this.landmarksGeometry,
                    features: []
                };
            } else {
                this.landmarksGeometry = changes.landmark.currentValue;
            }
        }
        if (changes.qtLandmark) {
            if (changes.qtLandmark.currentValue === undefined) {
                this.qtGeometry = {
                    ...this.qtGeometry,
                    features: []
                };
            } else {
                this.qtGeometry = changes.qtLandmark.currentValue;
            }
        }
        if (changes.searchArea) {
            if (changes.searchArea.currentValue === undefined) {
                this.searchAreaGeometry = {
                    ...this.searchAreaGeometry,
                    features: []
                };
            } else {
                this.searchAreaGeometry = changes.searchArea.currentValue;
            }
        }
    }
}