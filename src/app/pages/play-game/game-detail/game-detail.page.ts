import { Component, ViewChild, OnInit } from "@angular/core";
import { Clipboard } from "@angular/cdk/clipboard";
import { ActivatedRoute } from "@angular/router";
import { AlertController, NavController } from "@ionic/angular";
import { GamesService } from "../../../services/games.service";
import { PopoverController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { SocketService } from "src/app/services/socket.service";
import { UtilService } from "src/app/services/util.service";
import { AuthService } from "src/app/services/auth-service.service";
import { Storage } from "@ionic/storage";
import { environment } from "src/environments/environment";
import mapboxgl from "mapbox-gl";
import { virEnvLayers } from "src/app/models/virEnvsLayers";

@Component({
  selector: "app-game-detail",
  templateUrl: "./game-detail.page.html",
  styleUrls: ["./game-detail.page.scss"],
})
export class GameDetailPage implements OnInit {
  @ViewChild("monitorMap") mapContainer;

  game: any;
  activities: any[];
  points: any[];
  //* Default share data status
  shareData_cbox = environment.shareData_status;
  useExternalVEApp_cbox = false;

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false;
  gameCode: string = "";
  playerName: string = "";

  // multiplayer
  teacherCode: string = ""; // teacherId+gameId
  isSingleMode: boolean = true;
  numPlayers = 2;
  userRole: String = null;
  user = this.authService.getUser();
  bundle: any = {};
  map: mapboxgl.Map;
  // ToDo: Make color rondomly picked
  cirColor = ["danger", "success", "primary"];
  pointsColor = ["red", "green", "blue"];
  playersLocsFeatures = []; // for storing palyers features received from socket server
  // to disable 'show player location' btn when player locs are displayed
  showLocsBtn = true;

  playersData = [];

  virEnvType: string = null;

  // To copy maulti-player game link
  multiplayerGameLink: string;
  // user id used when game link is sent to player. only with multi-player games. Iniital value is undefined to avoid showing instructor view when game-link is used.
  instructorId: string;
  showInstructionView: boolean = false; // only for multi-player game

  constructor(
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private gamesService: GamesService,
    public popoverController: PopoverController,
    private translate: TranslateService,
    private socketService: SocketService,
    private utilService: UtilService,
    private authService: AuthService,
    private storage: Storage,
    private alertController: AlertController,
    private clipboard: Clipboard
  ) {}

  /******/
  ngOnInit() {
    // Get user role
    this.user.subscribe((event) => {
      if (event != null) {
        this.userRole = event["roles"][0];
      }
    });

    this.route.queryParams.subscribe((params) => {
      // used when user uses multi-player game link
      if (params["uId"]) {
        this.instructorId = params["uId"];
      }

      this.gamesService
        .getGame(params["gameId"])
        .then((res) => res.content)
        .then((game) => {
          this.game = game;
          // VR world
          // Check game type either real or VR world
          if (game.isVRWorld !== undefined && game.isVRWorld != false) {
            this.isVirtualWorld = true;
            if (game.isVRMirrored !== undefined && game.isVRMirrored != false) {
              this.isVRMirrored = true;
            }
          }

          // multi-player
          if (game.isMultiplayerGame) {
            this.isSingleMode = false;
            this.numPlayers = game.numPlayers;

            // show instructor view of multiplayer games
            // should only be shown for
            // - registered users
            // - uid in link does not exist
            // - uid in link equals the id of the player (means the instrauctor rejoins the games using the link)
            // this.showInstructionView = true;
            if (
              this.authService.isRegisteredUser() &&
              (!this.instructorId ||
                this.authService?.getUserId() == this.instructorId)
            ) {
              this.showInstructionView = true;
            }
          }
        })
        .finally(() => {
          // check if this is a teacher with 'scholar' or advanced role who is playing multiplayer game
          if (!this.isSingleMode && this.authService.getUserValue()) {
            // initialize multi-player game link
            const userId = this.authService.getUserId();
            this.multiplayerGameLink = `${environment.uiURL}/play-game/game-detail?gameId=${this.game._id}&uId=${userId}`;

            // initialize teacher-code
            this.teacherCode =
              this.authService.getUserId() + "-" + this.game._id;
            // console.log("teacher code -> game name", this.teacherCode);
            //ex(teacherId+gameId): 610bbc83a9fca4001cea4eaa-638df27d7ece7c88bff50443

            // initialize map
            this.initMonitoringMap();
          }

          //* set vir env type for old (where task type is not included in all tasks) and new games
          if (this.isVirtualWorld) {
            if (this.game.tasks[0] && this.game.tasks[0].virEnvType) {
              this.virEnvType = this.game.tasks[0].virEnvType;
            } else {
              this.virEnvType = this.game.virEnvType;
            }
          }

          // initialize teacher code for multi-player games
          if (!this.isSingleMode) {
            // 1. connect to socketio in cloud (multiplayer)
            this.connectSocketIO_MultiPlayer();

            // 2. check if this is a multiplayer game played using a copied link by instructor
            // if a copied link is used, the instructor/user id attached to link 'uId' will be used to form teacher code / game code
            if (params["uId"]) {
              this.teacherCode = params["uId"] + "-" + this.game._id;
            } else {
              // console.log("unlogged user!!!!");
              this.utilService.getQRCode().subscribe((qrCode) => {
                if (qrCode) {
                  this.teacherCode = qrCode;
                }
              });
            }
          }
        });
    });
  }

  /* ionViewWillEnter(){
  } */

  /******/
  /* connect to SocketIO (multiplayer) */
  connectSocketIO_MultiPlayer() {
    this.socketService.socket.connect();

    // show instructor view of multiplayer games
    // should only be shown for
    // - registered users
    // -  uid in link does not exist
    if (this.showInstructionView) {
      /* get players status when they join or disconnect from socket server */
      this.socketService.socket.on(
        "onPlayerConnectionStatusChange",
        (playersData) => {
          this.playersData = playersData;
        }
      );

      /* get players locations */
      this.socketService.socket.on("updateInstrunctorMapView", (playerData) => {
        // console.log("(updateInstrunctorMapView) playerLoc: ", playerData);

        // impl.
        /* check if player loc is not stored yet. this to avoid duplicate entries */
        if (
          this.playersLocsFeatures.length == 0 ||
          this.playersLocsFeatures.find(
            (feature) => feature.properties.playerNo != playerData.playerNo
          )
        ) {
          this.playersLocsFeatures.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: playerData.playerLoc,
            },
            properties: {
              pColor: this.pointsColor[playerData.playerNo - 1] ?? "green", // if more than three players should be green
              playerNo: playerData.playerNo,
              playerName: this.playersData[playerData.playerNo - 1].name,
            },
          });

          // update source data of points map layer
          this.updateMapView();
        }
      });

      // ToDo: needs to be updated when allowing other than cadmin
      /* Join instructor only */
      this.socketService.socket.emit("joinGame", {
        roomName: this.teacherCode,
        playerName: null,
      });

      /* show monitoring map */
      // this.initMonitoringMap();
    } else {
      /* check if there's uncompleted game session */
      this.checkSavedGameSession();
    }
  }

  async startGame() {
    this.bundle = {
      ...this.prepareRouteParams(),
      playerName: this.playerName,
      isRejoin: false,
    };

    /* check if user name is already existed before proceeding with starting the game */
    // ToDo: test if multiplayer player can have same names
    if (this.isVirtualWorld) {
      // connect to socket.io
      this.socketService.socket.connect();

      this.socketService
        .checkRoomNameExistance(this.playerName)
        .then((isPlayerNameExisted) => {
          if (isPlayerNameExisted) {
            this.utilService.showAlert(
              "Use another name",
              "The name you entered is already in use. Please use another name."
            );
            // return;
          } else {
            this.playGameVE();
          }
        });
    } else {
      this.playGameReal();
    }
  }

  /**
   * for real world games, redirect player to play-game-game
   */
  playGameReal() {
    if (this.isSingleMode) {
      this.navCtrl.navigateForward(
        `play-game/playing-game/${JSON.stringify(this.bundle)}`
      );
    } else {
      //Multi-player
      /* check whether game is full beofore join game */
      this.checkAbilityToJoinaMultiPlayerGame(this.bundle);

      // this.checkSavedGameSession();
    }
  }

  /**
   * for virtual Environment games, redirect player to play-game-game
   */
  playGameVE() {
    if (this.isSingleMode) {
      //*** for new impl. where we need to check whether game name is already used and close frame when game is done.
      this.socketService.creatAndJoinNewRoom(
        this.playerName,
        this.virEnvType,
        this.isSingleMode
      );

      // Close frame and redirect to start-page when game is over.
      this.socketService.closeFrame_listener();

      this.bundle = {
        ...this.bundle,
        date: new Date().getTime(), // you can delete it after fully testing webgl
      };

      /* redirect player to WebGL-build - page */
      this.navCtrl.navigateForward(
        `playing-virenv/${JSON.stringify(this.bundle)}`
      );
    } else {
      //Multi-player
      /* check whether game is full beofore join game */
      this.checkAbilityToJoinaMultiPlayerGame(this.bundle);
      // this.checkSavedGameSession();
    }
  }

  /*****************/
  prepareRouteParams() {
    return {
      id: this.game._id,
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: this.isVRMirrored,
      /* replace is used to get rid of special charachters, so values can be sent via routing */
      /* changed game code to be player name in signle mode game. This will allow V.E app to be conected based on player name which is easier that recalling code entered */
      gameCode: this.isSingleMode
        ? this.playerName
        : this.teacherCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ""),
      isSingleMode: this.isSingleMode,
      shareData_cbox: this.shareData_cbox,
    };
  }

  /*************************/
  /* multiplayer functions */
  /*************************/

  /* open barcode scanner - to scan qr code */
  /********************/
  openBarcodeScanner() {
    this.navCtrl.navigateForward("barcode-scanner");
  }

  /**********************************/
  // Check whether multiplayer game is not full
  checkAbilityToJoinaMultiPlayerGame(bundle: any) {
    /* if multi player mode, check whether room is not yet full. then allow player to join game in playing-page page */
    this.socketService.socket.emit(
      "checkAbilityToJoinGame",
      {
        gameCode: this.teacherCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ""),
        gameNumPlayers: this.numPlayers,
      },
      (response) => {
        if (response.isRoomFull) {
          /* show toast msg */
          this.utilService.showToast(
            `Sorry this game accepts only ${this.numPlayers} players.`,
            "dark",
            3500
          );
        } else {
          if (!this.isVirtualWorld) {
            this.navCtrl.navigateForward(
              `play-game/playing-game/${JSON.stringify(bundle)}`
            );
          } else {
            this.navCtrl.navigateForward(
              `playing-virenv/${JSON.stringify(bundle)}`
            );
          }
        }
      }
    );
  }

  /************************************************************************/
  async showAlertResumeGame(
    s_playerName,
    s_playerNo,
    s_taskNo,
    c_JoinedPlayersCount
  ) {
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
          },
        },
        {
          text: "Yes",
          handler: () => {
            /* retreive task index of previous game state */
            // console.log("🚀🚀🚀 (game-detail) - player found disconnected");
            this.bundle = this.bundle = {
              ...this.prepareRouteParams(),
              isRejoin: true,
              playerName: s_playerName,
              sPlayerNo: s_playerNo,
              cJoindPlayersCount: c_JoinedPlayersCount,
              sTaskNo: s_taskNo,
            };
            // console.log("🚀🚀 (game-detail) - bundle2", this.bundle);

            /* note: if player found in socket server, no need to check room availability */
            this.navCtrl.navigateForward(
              `play-game/playing-game/${JSON.stringify(this.bundle)}`
            );
          },
        },
      ],
    });
    await alert.present();
  }

  checkSavedGameSession() {
    /* retreive tracks and player info of previous uncompleted game session */
    this.storage.get("savedTracksData").then((tracksData) => {
      if (tracksData) {
        // // console.log("tracksData: ", tracksData);
        /* 1. if saved player room name equal and player name equal stroed player name   */
        // if (tracksData.s_playerInfo['roomName'] == this.teacherCode && tracksData.s_playerInfo['playerName'] == this.playerName) {
        if (tracksData.s_playerInfo["roomName"] == this.teacherCode) {
          /* console.log(
            "🚀 (game-detail) savedPlayerInfo - (same game name and player): ",
            tracksData
          ); */

          /* 2. check if user was accidentally disconnected */
          this.socketService.socket.emit(
            "checkPlayerPreviousJoin",
            tracksData.s_playerInfo,
            (response) => {
              if (response.isDisconnected) {
                /* allow user to choose whether to resume game or not */
                this.showAlertResumeGame(
                  tracksData.s_playerInfo["playerName"],
                  tracksData.s_playerInfo["playerNo"],
                  tracksData.s_taskNo,
                  response.joinedPlayersCount
                );
              } else {
                // console.log("🚀🚀 (game-detail) - player not found");
              }
            }
          );
        } else {
          /* console.log(
            "🚀 (game-detail) savedPlayerInfo: No previous info found for this game"
          ); */
        }
      }
    });
  }

  initMonitoringMap() {
    // Set bounds of VR world
    // ToDo_06.08: check if this works with all envs
    var bounds = [
      [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035], // Southwest coordinates (lng,lat)
      [0.003717027207 + 0.002, 0.004459082914 + 0.002], // Northeast coordinates (lng,lat)
    ];

    mapboxgl.accessToken = environment.mapboxAccessToken;
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      // style: environment.mapStyle + 'realWorld.json',
      style: this.isVirtualWorld
        ? environment.mapStyle + this.game.virEnvType+".json"
        : environment.mapStyle + "realWorld.json",
      // center: [8, 51.8],
      center: this.isVirtualWorld
        ? [0.00001785714286 / 2, 0.002936936937 / 2]
        : [8, 51.8],
      minZoom: 15,
      maxZoom: 18, // to avoid error
      maxBounds: this.isVirtualWorld ? virEnvLayers[this.game.virEnvType].bounds : null, // Sets bounds
    });

    // disable map rotation using right click + drag
    this.map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    this.map.touchZoomRotate.disableRotation();
    // Add zomm in/out controls
    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    this.map.on("load", () => {
      // show red symbol to represent players postions
      this.map.loadImage("/assets/icons/position.png", (error, image) => {
        if (error) throw error;

        this.map.addImage("position", image);

        this.map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: this.playersLocsFeatures,
          },
        });

        // Add players points
        this.map.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            'icon-image': 'position',
            "icon-allow-overlap": true,
            'icon-ignore-placement': true,
            'icon-size': 0.3,
            'icon-offset': [0, 0],
            "text-field": ["get", "playerName"],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            "text-anchor": "top",
            "text-offset": [0, -1.8]
          },
          paint: {
          "icon-color": "#000000"
          }
        });

        // hide points layer
        this.map.setLayoutProperty("points", "visibility", "none");

        // to fix the issue of smaller size map after loading- **this is due to adding ngstyle on card container**
        this.map.resize();
      });
    });
  }

  /* show locs on map view on click then hide them after few secs */
  showPlayerLocs() {
    /* remove old locs */
    this.playersLocsFeatures = [];
    if (this.socketService.socket) {
      // console.log("🚀 (game-detail) showPlayerLocs");
      this.socketService.socket.emit(
        "requestPlayersLocation",
        this.teacherCode
      );

      //disable button and show points layer
      this.showHideLocs();
      // hide locs and show btn after 5 secs
      setTimeout(() => {
        this.showHideLocs();
      }, 6000);
    } else {
      console.log("🚀 (game-detail) socket is undefined");
    }
  }

  /* to update players locs data */
  updateMapView() {
    if (this.map && this.map.getLayer("points")) {
      this.map.getSource("points").setData({
        type: "FeatureCollection",
        features: this.playersLocsFeatures,
      });

      // zoom to 1st location in list
      if (this.playersLocsFeatures.length != 0) {
        this.map.flyTo({
          center: this.playersLocsFeatures[0].geometry.coordinates,
          zoom: this.map.getZoom() < 15 ? 15 : this.map.getZoom(),
          speed: 3,
        });
      }
    } else {
      // console.log("🚀 (game-detail) updateMapView: map is undefined");
    }
  }

  /* to show and hide locs points on map view  */
  showHideLocs() {
    if (this.map.getLayoutProperty("points", "visibility") == "none") {
      this.map.setLayoutProperty("points", "visibility", "visible");
      this.showLocsBtn = false;
    } else {
      this.map.setLayoutProperty("points", "visibility", "none");
      this.showLocsBtn = true;
    }
  }

  /**
   * Copy game link, only with multi-player game
   */
  copyGameLink() {
    this.clipboard.copy(this.multiplayerGameLink);
  }
}