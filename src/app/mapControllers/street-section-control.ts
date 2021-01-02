import { Map as MapboxMap } from 'mapbox-gl';
import { OsmService } from '../services/osm.service';
import osmtogeojson from 'osmtogeojson';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { GeometryObject } from '@turf/helpers';

@Component({
  selector: 'app-street-section-control',
  template: `
      <mgl-geojson-source id="streetSectionSource" [data]="streetSectionGeometry">
      </mgl-geojson-source>
      <mgl-layer
          id="streetSection"
          type="line"
          source="streetSectionSource"
          [paint]="streetSectionPaint"
          [layout]="streetSectionLayout"
      ></mgl-layer>
  `,
})
export class StreetSectionControlComponent implements OnChanges, OnDestroy {
  private map: MapboxMap;
  private osm: OsmService;
  private positionSubscription: Subscription;
  private primaryColor: string;
  private dangerColor: string;

  @Input() visible = true;

  streetSectionGeometry: GeoJSON.FeatureCollection = {
    features: [],
    type: 'FeatureCollection'
  };

  streetSectionPaint: mapboxgl.LinePaint = {
    'line-color': 'red',
    'line-opacity': 0.5,
    'line-width': 10
  };

  streetSectionLayout: mapboxgl.LineLayout = {
    'line-cap': 'round'
  };

  constructor(osm: OsmService, private geolocationService: OrigamiGeolocationService) {
    this.osm = osm;
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    this.dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible.currentValue) {
      this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
        position => {
          if (this.map !== undefined) {
            this.osm.getStreetCoordinates(
              position.coords.latitude,
              position.coords.longitude
            ).then(data => {

              // tslint hacking idk
              osmtogeojson(data).features.forEach(f => {
                this.streetSectionGeometry.features.push(f as any);
              });
            }).catch(e => { console.log('error', e); });
          }
        }
      );
    } else {
      if (this.positionSubscription) {
        this.positionSubscription.unsubscribe();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.positionSubscription) {
      this.positionSubscription.unsubscribe();
    }
  }
}