import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { GamesService } from '../../../services/games.service';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { TranslateService } from '@ngx-translate/core';
import { SocketService } from 'src/app/services/socket.service';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Storage } from "@ionic/storage";

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

  shareData_cbox = true;

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false;
  gameCode: string = "";
  playerName: string = "";

  // multiplayer
  teacherCode: string = "";
  isSingleMode: boolean = true;
  numPlayers = 2;
  userRole: String = "";
  bundle: any = {};

  playersData = [];


  constructor(public navCtrl: NavController,
    private route: ActivatedRoute,
    private gamesService: GamesService,
    public popoverController: PopoverController,
    private translate: TranslateService,
    private socketService: SocketService,
    private utilService: UtilService,
    private authService: AuthService,
    private storage: Storage,
    private alertController: AlertController
  ) { }

  /******/
  ngOnInit() {
    // Get user role
    if (this.authService.getUserValue()) {
      this.userRole = this.authService.getUserRole();
    }

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

          /* multi-player */
          if (game.isMultiplayerGame == true) {
            this.isSingleMode = false;
            this.numPlayers = game.numPlayers;
          }

        })
        .finally(() => {
          /* initialize user id and teacher code*/
          if (!this.isSingleMode && this.authService.getUserValue() && this.userRole == 'contentAdmin') {
            this.teacherCode = this.authService.getUserId() + '-' + this.game._id;
            console.log('teacher code -> game name', this.teacherCode)
            //610bbc83a9fca4001cea4eaa-638df27d7ece7c88bff50443
          }

          /* multi-player */
          if (this.game.isMultiplayerGame == true) {
            /* connect to socket server (multiplayer) */
            this.connectSocketIO_MultiPlayer();
          }
        });
    });

    this.utilService.getQRCode().subscribe((qrCode) => {
      this.teacherCode = qrCode;
    });
  }

  /******/
  /* connect to SocketIO (multiplayer) */
  connectSocketIO_MultiPlayer() {
    this.socketService.socket.connect();

    if (this.userRole == "contentAdmin") {
      /* get players status when they join or disconnect from socket server */
      this.socketService.socket.on('onPlayerConnectionStatusChange', (playersData) => {
        console.log("(connectSocketIO_MultiPlayer) playersData: ", playersData)
        this.playersData = playersData;
      });

      /* Join instructor */
      this.socketService.socket.emit("joinGame", { roomName: this.teacherCode, playerName: null });
    } else {
      /* check if there's uncompleted game session */
      this.checkSavedGameSession();
    }
  }

  pointClick(point) {
    console.log(point);
  }

  startGame() {
    this.bundle = {
      ...this.prepareRouteParams(),
      playerName: this.playerName,
      isRejoin: false,
    }

    if (this.isSingleMode) {
      this.navCtrl.navigateForward(`play-game/playing-game/${JSON.stringify(this.bundle)}`);
    } else {
      /* check whether game is full beofore join game */
      this.checkAbilityToJoinGame(this.bundle);

      // this.checkSavedGameSession();
    }
  }

  /***************************************/
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

  /*****************/
  prepareRouteParams() {
    return {
      id: this.game._id,
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: this.isVRMirrored,
      /* replace is used to get rid of special charachters, so values can be sent via routing */
      gameCode: (this.isSingleMode ? this.gameCode : this.teacherCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')),
      isSingleMode: this.isSingleMode,
      shareData_cbox: this.shareData_cbox
    }
  }

  
  /*************************/
  /* multiplayer functions */
  /*************************/

    /* open barcode scanner - to scan qr code */
  /********************/
  openBarcodeScanner() {
    this.navCtrl.navigateForward('barcode-scanner');
  }

  /**********************************/
  checkAbilityToJoinGame(bundle: any) {
    /* if multi player mode, check whether room is not yet full. then allow player to join game in playing page */
    this.socketService.socket.emit("checkAbilityToJoinGame", { gameCode: this.teacherCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''), gameNumPlayers: this.numPlayers }, (response) => {
      if (response.isRoomFull) {
        /* show toast msg */
        this.utilService.showToast(`Sorry this game accepts only ${this.numPlayers} players.`, "dark", 3500);
      } else {
        this.navCtrl.navigateForward(`play-game/playing-game/${JSON.stringify(bundle)}`);
      }
    });
  }

  /************************************************************************/
  async showAlertResumeGame(s_playerName, s_playerNo, s_taskNo, c_JoinedPlayersCount) {
    const alert = await this.alertController.create({
      backdropDismiss: false, // disable alert dismiss when backdrop is clicked
      header: "Resume game?",
      //subHeader: 'Important message',
      message: "Do you want to resume previous game session?",
      buttons: [
        {
          text: "No",
          handler: () => {
            // Do nothing
          }
        },
        {
          text: "Yes",
          handler: () => {
            /* retreive task index of previous game state */
            console.log("🚀🚀🚀 (game-detail) - player found disconnected")
            this.bundle = this.bundle = {
              ...this.prepareRouteParams(),
              isRejoin: true,
              playerName: s_playerName,
              sPlayerNo: s_playerNo,
              cJoindPlayersCount: c_JoinedPlayersCount,
              sTaskNo: s_taskNo
            }
            console.log("🚀🚀 (game-detail) - bundle2", this.bundle)

            /* note: if player found in socket server, no need to check room availability */
            this.navCtrl.navigateForward(`play-game/playing-game/${JSON.stringify(this.bundle)}`);
          }
        }
      ]
    });
    await alert.present();
  }

  checkSavedGameSession() {
    console.log("🚀-- (game-detail) checkSavedGameSession");

    /* retreive tracks and player info of previous uncompleted game session */
    this.storage.get("savedTracksData").then((tracksData) => {
      if (tracksData) {
        /* 1. if saved player room name equal and player name equal stroed player name   */
        // if (tracksData.s_playerInfo['roomName'] == this.teacherCode && tracksData.s_playerInfo['playerName'] == this.playerName) {
        if (tracksData.s_playerInfo['roomName'] == this.teacherCode) {
          console.log("🚀 (game-detail) savedPlayerInfo - (same game name and player): ", tracksData);

          /* 2. check if user was accidentally disconnected */
          this.socketService.socket.emit("checkPlayerPreviousJoin", tracksData.s_playerInfo, (response) => {
            if (response.isDisconnected) {
              /* allow user to choose whether to resume game or not */
              this.showAlertResumeGame(tracksData.s_playerInfo['playerName'], tracksData.s_playerInfo['playerNo'], tracksData.s_taskNo, response.joinedPlayersCount);

            } else {
              console.log("🚀🚀 (game-detail) - player not found")
              //this.checkAbilityToJoinGame(this.bundle);
            }
          });
        } else {
          console.log("🚀 (game-detail) savedPlayerInfo: No previous info found for this game");
          // this.checkAbilityToJoinGame(this.bundle);
        }
      }
    });
  }

}
