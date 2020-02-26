import { Map as MapboxMap } from "mapbox-gl";
import { OsmService } from './../services/osm.service'
import osmtogeojson from "osmtogeojson";



export enum StreetSectionType {
  Enabled,
  Disabled
}

export class StreetSectionControl {
  private map: MapboxMap;
  private streetSectionType: StreetSectionType;
  private osm: OsmService
  private positionWatch: number;
  private primaryColor: string;

  constructor(map: MapboxMap, osm: OsmService) {
    this.map = map;
    this.osm = osm;
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');

  }

  public setType(type: StreetSectionType): void {
    if (this.map != undefined) {
      this.streetSectionType = type
      this.reset();
      this.update();
    }
  }

  private reset(): void {
    window.navigator.geolocation.clearWatch(this.positionWatch);
  }

  private update(): void {
    switch (this.streetSectionType) {
      case StreetSectionType.Enabled:
        this.positionWatch = window.navigator.geolocation.watchPosition(
          position => {
            if (this.map != undefined) {
              this.osm.getStreetCoordinates(
                position.coords.latitude,
                position.coords.longitude
              ).then(data => {
                const geometries = osmtogeojson(data);

                if (this.map.getSource("section") == undefined) {
                  this.map.addSource("section", {
                    type: "geojson",
                    data: geometries
                  });
                  this.map.addLayer({
                    id: "section",
                    type: "line",
                    source: "section",
                    paint: {
                      "line-color": this.primaryColor,
                      "line-opacity": 0.5,
                      "line-width": 10
                    },
                    layout: {
                      "line-cap": "round"
                    }
                  });
                } else {
                  this.map.getSource("section").setData(geometries);
                }
              }).catch(e => { console.log("error", e) })
            }
          },
          err => console.error(err),
          {
            enableHighAccuracy: true
          }
        );

        break;
      case StreetSectionType.Disabled:
        if (this.map.getLayer('section'))
          this.map.removeLayer('section');
        break;


    }
  }

  public remove(): void {
    window.navigator.geolocation.clearWatch(this.positionWatch);
    if (this.map.getLayer('section'))
      this.map.removeLayer('section');
  }
}