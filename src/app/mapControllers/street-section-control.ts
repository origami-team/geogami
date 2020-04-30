import { Map as MapboxMap } from "mapbox-gl";
import { OsmService } from '../services/osm.service'
import osmtogeojson from "osmtogeojson";
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';




export enum StreetSectionType {
  Enabled,
  Disabled
}

export class StreetSectionControl {
  private map: MapboxMap;
  private streetSectionType: StreetSectionType;
  private osm: OsmService
  private positionSubscription: Subscription;
  private primaryColor: string;
  private dangerColor: string;

  constructor(map: MapboxMap, osm: OsmService, private geolocationService: OrigamiGeolocationService) {
    this.map = map;
    this.osm = osm;
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    this.dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

  }

  public setType(type: StreetSectionType): void {
    if (this.map != undefined) {
      this.streetSectionType = type
      this.reset();
      this.update();
    }
  }

  private reset(): void {
    if (this.positionSubscription) {
      this.positionSubscription.unsubscribe();
    }
    if (this.map.getLayer('section'))
      this.map.removeLayer('section');
  }

  private update(): void {
    switch (this.streetSectionType) {
      case StreetSectionType.Enabled:
        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
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
                      "line-color": this.dangerColor,
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
    if (this.map.getLayer('section'))
      this.map.removeLayer('section');
  }
}