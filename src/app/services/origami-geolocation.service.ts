import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { filter, shareReplay } from 'rxjs/operators';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';


import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Feature, MultiPolygon, Polygon } from '@turf/helpers';

@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<GeolocationPosition>;

  private watchID: string;

  constructor() {

  }

  init() {
    this.geolocationSubscription = Observable.create((observer: Subscriber<GeolocationPosition>) => {
      this.watchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error)
        }
        observer.next(position);
      })
    }).pipe(shareReplay());
    console.log('initializing geolocation service')
  }

  getSinglePositionWatch(): Observable<GeolocationPosition> {
    return new Observable((observer: Subscriber<GeolocationPosition>) => {
      const singleWatchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error)
        }
        observer.next(position);
      })

      return () => {
        Plugins.Geolocation.clearWatch({ id: singleWatchID })
      }
    });
  }

  initGeofence(bbox: Feature<Polygon, MultiPolygon>) {
    return new Observable<boolean>((subscriber) => {
      this.geolocationSubscription.pipe(filter(p => p.coords.accuracy <= 5)).subscribe((position) => {
        const point = [position.coords.longitude, position.coords.latitude]
        subscriber.next(booleanPointInPolygon(point, bbox));
      })

    })
  }

  clear() {
    Plugins.Geolocation.clearWatch({ id: this.watchID })
  }
}
