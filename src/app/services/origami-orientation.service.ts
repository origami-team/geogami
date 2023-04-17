import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
  DeviceOrientation,
  DeviceOrientationCompassHeading
} from '@ionic-native/device-orientation/ngx';

// VR world, SockitIO
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class OrigamiOrientationService {

  public orientationSubscription: Observable<number>;
  private orientationSubscriber: Subscriber<number>;

  deviceOrientationSubscription: Subscription;

  // VR world
  public avatarOrientationSubscription: Observable<any>;
  isVirtualWorld: boolean = false;


  constructor(private platform: Platform, private deviceOrientation: DeviceOrientation, private socket: Socket) { }

  init(isVirtualWorld: boolean) {
    this.isVirtualWorld = isVirtualWorld;
    console.log(this.platform.platforms());

    if (this.platform.is('mobile') && this.platform.is('capacitor') && !this.platform.is('mobileweb')) {
      // native
      this.deviceOrientationSubscription = this.deviceOrientation
        .watchHeading({
          frequency: 10       //* setting it to one second will affect the compass functionality
        })
        .subscribe((data: DeviceOrientationCompassHeading) => {
          this.orientationSubscriber.next(data.magneticHeading);
        });
    } else {
      // not native
      if (this.platform.is('android')) {
        // Android Chrome
        window.addEventListener('deviceorientationabsolute', this.handleDeviceOrientation, true);
      } else {
        // everything else
        window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
      }
    }

    if (!isVirtualWorld) {
      this.orientationSubscription = new Observable((subscriber: Subscriber<number>) => {
        // console.log("......orientationSubscription (subscriber): ",  subscriber);
        this.orientationSubscriber = subscriber;
      }).pipe(shareReplay());
    } else {
      // VR world
      this.avatarOrientationSubscription = Observable.create((observer: Subscriber<any>) => {
        this.socket.on('updateAvatarDirection', (avatarHeading) => {
          observer.next(avatarHeading["angleValue"]);
        });
      }).pipe(shareReplay());
    }
  }

  handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    this.orientationSubscriber.next(360 - event.alpha);
  }

  clear() {
    // issue still open: https://github.com/danielsogl/awesome-cordova-plugins/issues/3537
    if (this.platform.is('mobile') && this.platform.is('capacitor') && !this.platform.is('mobileweb')) {
    } else {
      if (this.platform.is('android')) {
        window.removeEventListener('deviceorientationabsolute', this.handleDeviceOrientation, true);
      }else{
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
      }
    }
    
    //--- ToDo
    if (!this.isVirtualWorld) {
      this.orientationSubscriber.unsubscribe();
      this.deviceOrientationSubscription.unsubscribe();
    }
  }
}
