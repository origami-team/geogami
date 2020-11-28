import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OsmService {
  private lastRequest: number;
  private maxRequestInterval = 10000;

  constructor(private http: HttpClient) { }

  getStreetCoordinates(lat: number, lng: number, radius: number = 30) {
    console.log(this.lastRequest - Date.now());
    if (this.lastRequest == undefined || Date.now() - this.lastRequest > this.maxRequestInterval) {
      this.lastRequest = Date.now();
      console.log('doing request');
      return this.http.get(`
          https://overpass-api.de/api/interpreter?data=[out:json];(way[highway~"^(primary|secondary|tertiary|residential)$"][name](around:${radius},${lat},${lng});>;);out;
        `).toPromise();
    } else {
      return new Promise((resolve, reject) => {
        reject('Last request to overpass-api was done in less than 10 seconds');
      });
    }

  }
}
