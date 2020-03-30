import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

import { Plugins, GeolocationPosition } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<GeolocationPosition>;
  private watchID: string;

  constructor() {
    Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
      console.log(position)
      if (error) {
        console.error(error)
      }
    })

    console.log("init geoloc service")
    this.geolocationSubscription = Observable.create((observer: Subscriber<GeolocationPosition>) => {
      Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        console.log(position)
        if (error) {
          observer.error(error)
        }
        observer.next(position);
        observer.complete();
      })
    });
  }

  clear() {
    Plugins.Geolocation.clearWatch({ id: this.watchID })
  }
}
