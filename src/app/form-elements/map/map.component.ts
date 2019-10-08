import { Component, AfterViewInit, Input, forwardRef, ViewChild, HostBinding } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup } from '@angular/forms';

import mapboxgl from 'mapbox-gl';

import { Field } from '../../dynamic-form/models/field';
import { FieldConfig } from '../../dynamic-form/models/field-config';

// import MapboxDraw from '@mapbox/mapbox-gl-draw'
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => MapComponent),
  //     multi: true
  //   }
  // ]
})
export class MapComponent implements AfterViewInit, Field {

  // writeValue(obj: any): void {
  //   this.geometry = obj
  // }
  // registerOnChange(fn: any): void {
  //   this._onChange = fn
  // }
  // registerOnTouched(fn: any): void {
  //   this._onTouched = fn
  // }
  // setDisabledState?(isDisabled: boolean): void {
  //   throw new Error("Method not implemented.");
  // }

  @ViewChild('map') mapContainer;
  @ViewChild('hiddenInput') hiddenInput;

  marker: any;
  map: mapboxgl.Map;
  geometry: any = ''

  config: FieldConfig
  group: FormGroup

  constructor() { }

  ngAfterViewInit() {
    this.initMap();
  }

  _onChange = (geometry: any) => {
    if (geometry != null) {
      if (!this.marker) {
        this.marker = new mapboxgl.Marker({
          draggable: true,
        }).setLngLat(geometry.lngLat).addTo(this.map)
      } else {
        this.marker.setLngLat(geometry.lngLat)
      }
    }
    console.log(geometry.lngLat)
    this.geometry = geometry.lngLat
    this.group.patchValue({ [this.config.name]: this.geometry });
  }

  initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    this.map.on('click', e => {
      this._onChange(e)
    });
  }

}
