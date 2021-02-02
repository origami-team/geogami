import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscriber } from 'rxjs';
import { filter, shareReplay } from 'rxjs/operators';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';


import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Feature, MultiPolygon, Polygon } from '@turf/helpers';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<GeolocationPosition>;

  private watchID: string;

  public lastPointInBbox: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(undefined);
  public lastPointInBboxDirection: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);


  constructor(private helperService: HelperService) {

  }

  init() {
    this.geolocationSubscription = Observable.create((observer: Subscriber<GeolocationPosition>) => {
      this.watchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error);
        }
        observer.next(position);
      });
    }).pipe(shareReplay());
    console.log('initializing geolocation service');
  }

  getSinglePositionWatch(): Observable<GeolocationPosition> {
    return new Observable((observer: Subscriber<GeolocationPosition>) => {
      const singleWatchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error);
        }
        observer.next(position);
      });

      return () => {
        Plugins.Geolocation.clearWatch({ id: singleWatchID });
      };
    });
  }

  initGeofence(bbox: Feature<Polygon, MultiPolygon>) {
    return new Observable<boolean>((subscriber) => {
      this.geolocationSubscription.pipe(filter(p => p.coords.accuracy <= 5)).subscribe((position) => {
        // this.geolocationSubscription.subscribe((position) => {
        const point = [position.coords.longitude, position.coords.latitude];
        const inside = booleanPointInPolygon(point, bbox);
        if (inside) {
          this.lastPointInBbox.next(point);
        } else {
          if (this.lastPointInBbox.getValue() !== undefined) {
            const direction = this.helperService.bearing(
              point[1],
              point[0],
              this.lastPointInBbox[1],
              this.lastPointInBbox[0],
            );
            this.lastPointInBboxDirection.next(direction);
          } else {
            this.lastPointInBboxDirection.next(undefined);
          }
        }
        subscriber.next(inside);
      });
    });
  }

  clear() {
    Plugins.Geolocation.clearWatch({ id: this.watchID });
  }
}
