import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';


import mapboxgl from 'mapbox-gl';

import { GamesService } from '../../../services/games.service';
import { environment } from 'src/environments/environment';

import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
})
export class GameDetailPage implements OnInit {

  @ViewChild('map') mapContainer;

  game: any;
  activities: any[];
  points: any[];

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false;
  gameCode: string = "";

  constructor(public navCtrl: NavController,
    private route: ActivatedRoute,
    private gamesService: GamesService,
    public popoverController: PopoverController,
    private translate: TranslateService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gamesService.getGame(params.id)
        .then(res => res.content)
        .then(game => {
          this.game = game;

          // VR world
          // Check game type either real or VR world
          if (game.isVRWorld !== undefined && game.isVRWorld != false) {
            this.isVirtualWorld = true;
            if (game.isVRMirrored !== undefined && game.isVRMirrored != false) {
              this.isVRMirrored = true;
            }
          }
        })
        .finally(() => {
          // console.log(this.game);
          // this.activities = this.game.activities
          // this.points = this.activities[0].points
          // if(this.mapContainer.nativeElement) {
          //   this.initMap()
          // }
        });
    });

  }

  // initMap() {
  //   mapboxgl.accessToken = environment.mapboxAccessToken;
  //   const map = new mapboxgl.Map({
  //     container: this.mapContainer.nativeElement,
  //     style: 'mapbox://styles/mapbox/streets-v9',
  //   });


  //   map.on('load', () => {
  //     const tasks = this.game.tasks;
  //     // const markers = activity.points.map(point => new mapboxgl.Marker().setLngLat([point.lng, point.lat]).addTo(map))

  //     var bounds = new mapboxgl.LngLatBounds();

  //     tasks.forEach((task) => {
  //       if (task.settings.point)
  //         bounds.extend(task.settings.point.geometry.coordinates);
  //     });

  //     map.fitBounds(bounds, { padding: 40, duration: 2000 });
  //   })
  // }

  pointClick(point) {
    // console.log(point);
  }

  startGame() {
    let bundle = {
      id: this.game._id,
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: this.isVRMirrored,
      gameCode: this.gameCode
    }
    this.navCtrl.navigateForward(`play-game/playing-game/${JSON.stringify(bundle)}`);
  }

  async showPopover(ev: any, key: string) {
    let text = this.translate.instant(key);

    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

}
