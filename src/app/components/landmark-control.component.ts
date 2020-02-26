import { Map as MapboxMap } from "mapbox-gl";


export class LandmarkControl {
    private map: MapboxMap;

    constructor(map: MapboxMap) {
        this.map = map;
    }

    public setLandmark(landmark: any) {
        if (this.map.getLayer('landmarks')) {
            this.map.removeLayer('landmarks')
        }
        this.map.addLayer({
            id: "landmarks",
            type: "fill-extrusion",
            source: {
                type: "geojson",
                data: landmark
            },
            paint: {
                "fill-extrusion-color": "#ffff00",
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 50
            }
        });
    }

    setQTLandmark(landmark: any) {
        if (this.map.getLayer('landmarks-qt-map')) {
            this.map.removeLayer('landmarks-qt-map')
        }
        this.map.addLayer({
            id: "landmarks-qt-map",
            type: "fill-extrusion",
            source: {
                type: "geojson",
                data: landmark
            },
            paint: {
                "fill-extrusion-color": "#3880ff",
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 20
            }
        });
    }

    public remove(): void {
        if (this.map.getLayer('landmarks')) {
            this.map.removeLayer('landmarks')
        }
        if (this.map.getLayer('landmarks-qt-map')) {
            this.map.removeLayer('landmarks-qt-map')
        }
    }
}