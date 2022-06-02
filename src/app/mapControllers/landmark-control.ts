import { Map as MapboxMap } from "mapbox-gl";

export class LandmarkControl {
  private map: MapboxMap;
  private warningColor: string;
  private secondaryColor: string;
  private dangerColor: string;
  private tertiaryColor: string;

  private landmarkColor = "orange";

  constructor(map: MapboxMap) {
    this.map = map;
    this.warningColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-warning");
    this.secondaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-secondary");
    this.dangerColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-danger");
    this.tertiaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-tertiary");
  }

  public setLandmark(landmark: any) {
    this.remove();

    this.map.addSource("landmarksSource", {
      type: "geojson",
      data: landmark,
    });
    this.map.addLayer({
      id: "landmarksLayerPolygon",
      type: "fill-extrusion",
      source: "landmarksSource",
      filter: ["all", ["==", ["geometry-type"], "Polygon"]],
      paint: {
        "fill-extrusion-color": this.landmarkColor,
        "fill-extrusion-opacity": 0.5,
        "fill-extrusion-height": 20,
      },
    });
    this.map.addLayer({
      id: "landmarksLayerLine",
      type: "line",
      source: "landmarksSource",
      filter: ["all", ["==", ["geometry-type"], "LineString"]],
      paint: {
        "line-color": this.landmarkColor,
        "line-opacity": 0.5,
        "line-width": 5,
      },
    });
    this.map.addLayer({
      id: "landmarksLayerPoint",
      source: "landmarksSource",
      filter: ["all", ["==", ["geometry-type"], "Point"]],
      type: "symbol",
      layout: {
        "icon-image": "landmark-marker",
        "icon-size": 1,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
    });
  }

  setQTLandmark(landmark: any) {
    this.removeQT();

    this.map.addSource("qtSource", {
      type: "geojson",
      data: landmark,
    });
    this.map.addLayer({
      id: "qtLayerPolygon",
      type: "fill-extrusion",
      source: "qtSource",
      filter: ["all", ["==", ["geometry-type"], "Polygon"]],
      paint: {
        "fill-extrusion-color": this.secondaryColor,
        "fill-extrusion-opacity": 0.5,
        "fill-extrusion-height": 20,
      },
    });
    this.map.addLayer({
      id: "qtLayerLine",
      type: "line",
      source: "qtSource",
      filter: ["all", ["==", ["geometry-type"], "LineString"]],
      paint: {
        "line-color": this.secondaryColor,
        "line-opacity": 0.5,
        "line-width": 5,
      },
    });
    this.map.addLayer({
      id: "qtLayerPoint",
      source: "qtSource",
      filter: ["all", ["==", ["geometry-type"], "Point"]],
      type: "symbol",
      layout: {
        "icon-image": "marker-editor",
        "icon-size": 0.65,
        "icon-anchor": "bottom",
      },
    });
  }

  setSearchArea(landmark: any) {
    this.removeSearchArea();

    this.map.addSource("searchAreaSource", {
      type: "geojson",
      data: landmark,
    });
    this.map.addLayer({
      id: "searchAreaLayerPolygon",
      type: "line",
      source: "searchAreaSource",
      filter: ["all", ["==", ["geometry-type"], "Polygon"]],
      paint: {
        "line-color": this.secondaryColor,
        "line-opacity": 0.5,
        "line-width": 5,
      },
    });
  }

  addPermanentDrawing(drawing, taskId) {
    this.removeDrawing(taskId);
    this.map.addSource(`drawing${taskId}`, {
      type: "geojson",
      data: drawing,
    });
    this.map.addLayer({
      id: `drawingPolygon${taskId}`,
      type: "fill",
      source: `drawing${taskId}`,
      filter: ["all", ["==", ["geometry-type"], "Polygon"]],
      paint: {
        "fill-opacity": 0.5,
        "fill-color": this.secondaryColor,
        "fill-outline-color": this.secondaryColor,
      },
    });
    this.map.addLayer({
      id: `drawingLine${taskId}`,
      type: "line",
      source: `drawing${taskId}`,
      filter: ["all", ["==", ["geometry-type"], "LineString"]],
      paint: {
        "line-color": this.secondaryColor,
        "line-opacity": 0.5,
        "line-width": 5,
      },
    });
    this.map.addLayer({
      id: `drawingPoint${taskId}`,
      type: "circle",
      source: `drawing${taskId}`,
      filter: ["all", ["==", ["geometry-type"], "Point"]],
      paint: {
        "circle-radius": 8,
        "circle-color": this.secondaryColor,
        "circle-stroke-width": 4,
        "circle-stroke-color": "#fff",
      },
    });
  }

  removeDrawing(taskId = "") {
    if (this.map.getLayer(`drawingPolygon${taskId}`)) {
      this.map.removeLayer(`drawingPolygon${taskId}`);
    }
    if (this.map.getLayer(`drawingLine${taskId}`)) {
      this.map.removeLayer(`drawingLine${taskId}`);
    }
    if (this.map.getLayer(`drawingPoint${taskId}`)) {
      this.map.removeLayer(`drawingPoint${taskId}`);
    }
    if (this.map.getSource(`drawing${taskId}`)) {
      this.map.removeSource(`drawing${taskId}`);
    }
  }

  addTemporaryDrawing(drawing) {
    this.removeDrawing();
    this.map.addSource("drawing", {
      type: "geojson",
      data: drawing,
    });
    this.map.addLayer({
      id: "drawingPolygon",
      type: "fill",
      source: "drawing",
      filter: ["all", ["==", ["geometry-type"], "Polygon"]],
      paint: {
        "fill-opacity": 0.5,
        "fill-color": this.secondaryColor,
        "fill-outline-color": this.secondaryColor,
      },
    });
    this.map.addLayer({
      id: "drawingLine",
      type: "line",
      source: "drawing",
      filter: ["all", ["==", ["geometry-type"], "LineString"]],
      paint: {
        "line-color": this.secondaryColor,
        "line-opacity": 0.5,
        "line-width": 5,
      },
    });
    this.map.addLayer({
      id: "drawingPoint",
      type: "circle",
      source: "drawing",
      filter: ["all", ["==", ["geometry-type"], "Point"]],
      paint: {
        "circle-radius": 8,
        "circle-color": this.secondaryColor,
        "circle-stroke-width": 4,
        "circle-stroke-color": "#fff",
      },
    });
  }

  public removeQT(): void {
    if (this.map.getLayer("qtLayerPolygon")) {
      this.map.removeLayer("qtLayerPolygon");
    }
    if (this.map.getLayer("qtLayerLine")) {
      this.map.removeLayer("qtLayerLine");
    }
    if (this.map.getLayer("qtLayerPoint")) {
      this.map.removeLayer("qtLayerPoint");
    }
    if (this.map.getSource("qtSource")) {
      this.map.removeSource("qtSource");
    }
  }

  public removeSearchArea() {
    if (this.map.getLayer("searchAreaLayerPolygon")) {
      this.map.removeLayer("searchAreaLayerPolygon");
    }
    if (this.map.getSource("searchAreaSource")) {
      this.map.removeSource("searchAreaSource");
    }
  }

  public remove(): void {
    if (this.map.getLayer("landmarksLayerPolygon")) {
      this.map.removeLayer("landmarksLayerPolygon");
    }
    if (this.map.getLayer("landmarksLayerLine")) {
      this.map.removeLayer("landmarksLayerLine");
    }
    if (this.map.getLayer("landmarksLayerPoint")) {
      this.map.removeLayer("landmarksLayerPoint");
    }
    if (this.map.getSource("landmarksSource")) {
      this.map.removeSource("landmarksSource");
    }
  }
}
