import { Injectable } from '@angular/core';
import { Geoposition, Geolocation } from "@ionic-native/geolocation/ngx";
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<Geoposition>;

  constructor(private geolocation: Geolocation) {
    console.log('creating new geolocation subscription')
    this.geolocationSubscription = this.geolocation.watchPosition({ enableHighAccuracy: true, timeout: 1000, maximumAge: 1000 })
      .pipe(filter((p) => p.coords !== undefined))

    this.geolocationSubscription.subscribe(() => { }, (err) => console.error(err))
  }

  clear() {
    this.geolocationSubscription = null;
  }
}
