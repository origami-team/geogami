import { Map as MapboxMap } from "mapbox-gl";


export class LandmarkControl {
    private map: MapboxMap;
    private warningColor: string;
    private secondaryColor: string;
    private dangerColor: string;
    private tertiaryColor: string;


    constructor(map: MapboxMap) {
        this.map = map;
        this.warningColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
        this.secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
        this.dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');
        this.tertiaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-tertiary');
    }

    public setLandmark(landmark: any) {
        this.remove();

        this.map.addSource('landmarksSource', {
            type: "geojson",
            data: landmark
        })
        this.map.addLayer({
            id: "landmarksLayerPolygon",
            type: "fill-extrusion",
            source: 'landmarksSource',
            filter: ['all', ["==", ["geometry-type"], "Polygon"]],
            paint: {
                "fill-extrusion-color": this.dangerColor,
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 20,
            }
        });
        this.map.addLayer({
            id: "landmarksLayerLine",
            type: "line",
            source: 'landmarksSource',
            filter: ['all', ["==", ["geometry-type"], "LineString"]],
            paint: {
                "line-color": this.dangerColor,
                "line-opacity": 0.5,
                "line-width": 5,
            }
        });
        this.map.addLayer({
            id: "landmarksLayerPoint",
            source: 'landmarksSource',
            filter: ['all', ["==", ["geometry-type"], "Point"]],
            type: 'symbol',
            layout: {
                "icon-image": "landmark-marker",
                "icon-size": 1,
                "icon-anchor": 'bottom'
            }
        });
    }

    setQTLandmark(landmark: any) {
        this.removeQT();

        this.map.addSource('qtSource', {
            type: "geojson",
            data: landmark
        })
        this.map.addLayer({
            id: "qtLayerPolygon",
            type: "fill-extrusion",
            source: 'qtSource',
            filter: ['all', ["==", ["geometry-type"], "Polygon"]],
            paint: {
                "fill-extrusion-color": this.secondaryColor,
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 20,
            }
        });
        this.map.addLayer({
            id: "qtLayerLine",
            type: "line",
            source: 'qtSource',
            filter: ['all', ["==", ["geometry-type"], "LineString"]],
            paint: {
                "line-color": this.secondaryColor,
                "line-opacity": 0.5,
                "line-width": 5,
            }
        });
        this.map.addLayer({
            id: "qtLayerPoint",
            type: "circle",
            source: 'qtSource',
            filter: ['all', ["==", ["geometry-type"], "Point"]],
            paint: {
                "circle-color": this.secondaryColor,
                "circle-radius": 5,
            }
        });
    }

    public removeQT(): void {
        if (this.map.getLayer('qtLayerPolygon')) {
            this.map.removeLayer('qtLayerPolygon')
        }
        if (this.map.getLayer('qtLayerLine')) {
            this.map.removeLayer('qtLayerLine')
        }
        if (this.map.getLayer('qtLayerPoint')) {
            this.map.removeLayer('qtLayerPoint')
        }
        if (this.map.getSource('qtSource')) {
            this.map.removeSource('qtSource')
        }
    }

    public remove(): void {
        if (this.map.getLayer('landmarksLayerPolygon')) {
            this.map.removeLayer('landmarksLayerPolygon')
        }
        if (this.map.getLayer('landmarksLayerLine')) {
            this.map.removeLayer('landmarksLayerLine')
        }
        if (this.map.getLayer('landmarksLayerPoint')) {
            this.map.removeLayer('landmarksLayerPoint')
        }
        if (this.map.getSource('landmarksSource')) {
            this.map.removeSource('landmarksSource')
        }
    }
}