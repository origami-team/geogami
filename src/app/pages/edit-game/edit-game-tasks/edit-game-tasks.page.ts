import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { IonReorderGroup, Platform } from "@ionic/angular";
import { ModalController } from "@ionic/angular";
import { GameFactoryService } from "../../../services/game-factory.service";
import { CreateTaskModalPage } from "../../create-game/create-task-modal/create-task-modal.page";
import { CreateInfoModalComponent } from "../../create-game/create-info-modal/create-info-modal.component";
import { NavController } from "@ionic/angular";
import { Game } from "src/app/models/game";
import { GamesService } from "src/app/services/games.service";
import { ActivatedRoute } from "@angular/router";
import { Task } from "src/app/models/task";
import { UtilService } from "src/app/services/util.service";

@Component({
  selector: "app-edit-game-tasks", // edit-game-tasks
  templateUrl: "./edit-game-tasks.page.html",
  styleUrls: ["./edit-game-tasks.page.scss"],
})
export class EditGameTasksPage implements OnInit {
  // name: String;
  // tasks: any[] = [];
  game: Game;
  reorder: Boolean = false;

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false;
  virEnvType: string; // new to store vir env type

  // Multiplyar impl.
  isRealWorld: boolean = true;
  isSingleMode: boolean = true;
  numPlayers = 1;
  // bundle: any;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  // dismiss modal on hardware back button
  @HostListener("document:ionBackButton", ["$event"])
  private async overrideHardwareBackAction($event: any) {
    await this.modalController.dismiss();
  }


  constructor(
    private gameFactory: GameFactoryService,
    private modalController: ModalController,
    private navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private platform: Platform      //* used in html
  ) { }

  ngOnInit() {
    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSingleMode = JSON.parse(params.bundle).isSingleMode;
      let game_id = JSON.parse(params.bundle).game_id;

      this.isVirtualWorld = !this.isRealWorld;


      // Get data of selected game via game_id
      this.gamesService
        .getGame(game_id)
        .then((res) => res.content)
        .then((game) => {
          this.game = game;
          this.gameFactory.flushGame();
          this.gameFactory.addGameInformation(this.game);

          // VR world
          /* if (game.isVRWorld !== undefined && game.isVRWorld != false) {
            this.isVirtualWorld = true;
            if (game.isVRMirrored !== undefined && game.isVRMirrored != false) {
              this.isVRMirrored = true;
            }
          } */

          // check if game is VE 2 (mirrored)
          if (!this.isRealWorld) {
            // Set num of players
            this.numPlayers = game.numPlayers;
            // Set virEnv Type
            this.virEnvType = game.virEnvType;
            if (game.isVRMirrored !== undefined && game.isVRMirrored != false) {
              this.isVRMirrored = true;
            }
          } else {
            // Get num of players
            this.numPlayers = game.numPlayers;
          // console.log("/// numPlayers: ", this.numPlayers);
          }





        });
    });
  }

  ionViewWillEnter() {
    // mapboxgl.accessToken =
    //   "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA";
    // const map = new mapboxgl.Map({
    //   container: "create-game-map",
    //   style: "mapbox://styles/mapbox/streets-v9",
    //   center: [8, 51.8],
    //   zoom: 2
    // });
    // const geolocate = new mapboxgl.GeolocateControl({
    //   positionOptions: {
    //     enableHighAccuracy: true
    //   },
    //   fitBoundsOptions: {
    //     maxZoom: 25
    //   },
    //   trackUserLocation: true
    // });
    // map.addControl(geolocate);
    // // let watch = this.geolocation.watchPosition();
    // // watch.subscribe((data) => {
    // // // console.log(data)
    // // });
    // // Add geolocate control to the map.
    // map.on("load", () => {
    //   geolocate.trigger();
    // });
  }

  async presentTaskModal(
    type: string = "nav",
    task: any = null,
    isVirtualWorld: boolean = this.isVirtualWorld,
    isVRMirrored: boolean = this.isVRMirrored,
    numPlayers: number = this.numPlayers,
    isSingleMode: boolean = this.isSingleMode,
    //* if task doesn't have a virEnvType send the default one
    virEnvType: string = (task && task.virEnvType ? task.virEnvType : this.virEnvType)) {
  // console.log("🚀 ~ EditGameTasksPage ~ task:", task)

    const modal: HTMLIonModalElement = await this.modalController.create({
      component:
        type == "info" ? CreateInfoModalComponent : CreateTaskModalPage,
      backdropDismiss: false,
      componentProps: {
        type,
        task,
        isVirtualWorld,  // added to view VR world map instead of real map if true
        isVRMirrored,
        virEnvType,
        numPlayers,
        isSingleMode
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
  // console.log(data);
    if (data != undefined) {
      if (task != null) {
        if (!task._id) {
          task._id = String(Math.floor(Date.now() / 1000));
        }
        this.updateTask(task._id, data.data);
      } else {
        this.addTaskToGame(data.data);
      }
    }

    modal.remove();
  }

  addTaskToGame(task: Task) {
    this.game = this.gameFactory.addTask(task);

  // console.log(this.game.tasks);
  }

  deleteTask(taskID) {
  // console.log("deleting", taskID);
    this.game = this.gameFactory.removeTask(taskID);
  }

  updateTask(taskID, task) {
  // console.log("updating", taskID);
    this.game = this.gameFactory.updateTask(taskID, task);
  // console.log(this.game);
  }

  doReorder(ev: any) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
  // console.log("Dragged from index", ev.detail.from, "to", ev.detail.to);

    // Before complete is called with the items they will remain in the
    // order before the drag
  // console.log("Before complete", this.game.tasks);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    this.game.tasks = ev.detail.complete(this.game.tasks);

    this.gameFactory.applyReorder(this.game.tasks);

    // // console.log("this.game", this.game.tasks);

    ev.detail.complete(true);

    // After complete is called the items will be in the new order
  // console.log("After complete", this.game.tasks);
  }

  toggleReorder() {
    this.reorder = !this.reorder;
  }

  navigateToOverview() {
    // if device is not connected to internet, show notification
    if (!this.utilService.getIsOnlineValue()) {
      // show no connection notification
      this.utilService.showAlertNoConnection();
      return;
    }

    let bundle = {
      game_id: this.game._id,
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: this.isVRMirrored
    }

    this.gamesService.updateGame(this.game).then((res) => {
      if (res.status == 200) {
        this.navCtrl.navigateForward(
          `edit-game/edit-game-overview/${JSON.stringify(bundle)}`
        );
        // this.gameFactory.flushGame();
      }
    })
      .catch((e) => {
        console.error(e);
      });
  }

  navigateBack() {
    this.gameFactory.flushGame();
    // this.navCtrl.back();
    this.navCtrl.navigateForward(`edit-game-list`);;
  }
}
