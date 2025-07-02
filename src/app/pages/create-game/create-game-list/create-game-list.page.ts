import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
} from "@angular/core";
import { IonReorderGroup } from "@ionic/angular";

import { ModalController } from "@ionic/angular";

import { GameFactoryService } from "../../../services/game-factory.service";

import { CreateTaskModalPage } from "./../create-task-modal/create-task-modal.page";
import { CreateInfoModalComponent } from "./../create-info-modal/create-info-modal.component";

import { NavController } from "@ionic/angular";

import { Game } from "src/app/models/game";

import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UtilService } from "src/app/services/util.service";

@Component({
  selector: "app-create-game-list",
  templateUrl: "./create-game-list.page.html",
  styleUrls: ["./create-game-list.page.scss"],
})
export class CreateGameListPage implements OnInit {
  // name: String;
  // tasks: any[] = [];
  game: Game;
  reorder: Boolean = false;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  // To hold received parametres vlaues via route
  // Multiplayer mode
  isRealWorld: boolean = false;
  isVRMirrored: boolean = false;
  virEnvType: string; // new to store vir env type (default layer)
  isSingleMode: boolean = false; // used to show number of players card in multiplayer mode
  bundle: any;
  numPlayers = 3;

  // dismiss modal on hardware back button
  @HostListener("document:ionBackButton", ["$event"])
  private async overrideHardwareBackAction($event: any) {
    await this.modalController.dismiss();
  }

  constructor(
    private gameFactory: GameFactoryService,
    private modalController: ModalController,
    private navCtrl: NavController,
    public popoverController: PopoverController,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public utilService: UtilService,
    private router: Router,
  ) {
    // Get sent data (not visible on url)
    if (this.router.getCurrentNavigation().extras.state) {
      this.isRealWorld =
        this.router.getCurrentNavigation().extras.state.isRealWorld;
      this.isSingleMode =
        this.router.getCurrentNavigation().extras.state.isSingleMode;

        // only with Vir. Env. get vir-env name
        if(!this.isRealWorld){
          this.virEnvType = this.router.getCurrentNavigation().extras.state.virEnvType;
        }
    } else {
      // if sent data from `game-type-menu` is lost due to reload page, redirect user to previous page
      navCtrl.back();
    }
  }

  async ngOnInit() {

    this.gameFactory.getGame().then((game) => {
      // It could happen that game data is stored from edit game page
      // here we clean game data if it is related to existed game.
      // otheriwse we get `name already exists` error
      if (game._id != 0) {
        this.gameFactory.flushGame(); // clear game data
        this.game = this.gameFactory.initializeGame();
      } else {
        this.game = game;
      }
    });
  }

  async presentTaskModal(
    type: string = "nav",
    task: any = null,
    taskNo: number = null,
    isVirtualWorld: boolean = !this.isRealWorld,
    isVRMirrored: boolean = this.isVRMirrored,
    numPlayers: number = this.numPlayers,
    isSingleMode: boolean = this.isSingleMode,
    //* if task doesn't have a virEnvType send the default one
    virEnvType: string = task && task.virEnvType
      ? task.virEnvType
      : this.virEnvType
  ) {
    console.log("🚀 ~ EditGameTasksPage ~ task:", task);

    const modal: HTMLIonModalElement = await this.modalController.create({
      component:
        type == "info" ? CreateInfoModalComponent : CreateTaskModalPage,
      backdropDismiss: false,
      componentProps: {
        type,
        task,
        taskNo,
        isVirtualWorld,
        isVRMirrored,
        virEnvType,
        numPlayers,
        isSingleMode,
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

  addTaskToGame(task) {
    this.game = this.gameFactory.addTask(task);
    // this.gameFactory.getGame().then(game => {
    // // console.log(game)
    //   this.game = game
    // });

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

  // console.log(this.game.tasks);

    ev.detail.complete(true);

    // After complete is called the items will be in the new order
  // console.log("After complete", this.game.tasks);
  }

  toggleReorder() {
    this.reorder = !this.reorder;
  }

  navigateToOverview() {
    //// console.log("navigate");
    // if device is not connected to internet, show notification
    if (!this.utilService.getIsOnlineValue()) {
      // show no connection notification
      this.utilService.showAlertNoConnection();
      return;
    }

    this.bundle = {
      isVRWorld: !this.isRealWorld, // DoDo update it in overview to isRealWorld
      isVRMirrored: false, // update code so you don't have to send it if realworld is false
      virEnvType: this.virEnvType,
      //isRealWorld: this.isRealWorld,
      isSingleMode: this.isSingleMode,
      numPlayers: this.isSingleMode ? undefined : this.numPlayers,
    };

    this.navCtrl.navigateForward(
      `create-game/create-game-overview/${JSON.stringify(this.bundle)}`
    );
  }
}
