import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OsmService {

  constructor(private http: HttpClient) { }

  getStreetCoordinates(lat: number, lng: number, radius: number = 20) {
    return this.http.get(`
      https://overpass-api.de/api/interpreter?data=[out:json];(way[highway~"^(primary|secondary|tertiary|residential)$"][name](around:${radius},${lat},${lng});>;);out;
    `).toPromise();
  }
}
