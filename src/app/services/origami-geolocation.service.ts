import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { shareReplay } from "rxjs/operators";


import { Plugins, GeolocationPosition } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<GeolocationPosition>;

  private watchID: string;

  constructor() { }

  init() {
    console.log("initializing geolocation service")
    this.geolocationSubscription = Observable.create((observer: Subscriber<GeolocationPosition>) => {
      this.watchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true, requireAltitude: true }, (position, error) => {
        if (error != null) {
          observer.error(error)
        }
        observer.next(position);
      })
    }).pipe(shareReplay());
  }

  getSinglePositionWatch(): Observable<GeolocationPosition> {
    return Observable.create((observer: Subscriber<GeolocationPosition>) => {
      const watchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true, requireAltitude: true }, (position, error) => {
        if (error != null) {
          observer.error(error)
        }
        observer.next(position);
      })

      return () => {
        Plugins.Geolocation.clearWatch({ id: watchID })
      }
    }).pipe(shareReplay());
  }

  clear() {
    Plugins.Geolocation.clearWatch({ id: this.watchID })
  }
}
