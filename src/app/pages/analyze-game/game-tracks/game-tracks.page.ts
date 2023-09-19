import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { AlertController, NavController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth-service.service";
import { TrackerService } from "src/app/services/tracker.service";
import { Capacitor } from "@capacitor/core";

import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { downloadTrackDialog } from "./download-track-dialog";

@Component({
  selector: "app-game-tracks",
  templateUrl: "./game-tracks.page.html",
  styleUrls: ["./game-tracks.page.scss"],
})
export class GameTracksPage implements OnInit {
  gameTracks: any[] = [];
  // to only allow admins and scholars to see this page
  user = this.authService.getUser();
  game = null;

  displayedColumns: string[] = ["#", "players", "createdAt", "id", "action"];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //* to set sanitizer and file name (used in download track data)
  sanitizedBlobUrl: any;
  filename: string;

  isWebPlatform = true;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private trackService: TrackerService,
    private alertCtr: AlertController,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    //* Check platform, if not web ask user to open GeoGamiweb version
    if (Capacitor.platform == "ios" || Capacitor.platform == "android") {
      this.isWebPlatform = false;
    }
    this.getGamesTracksData();
  }

  ionViewWillEnter() {
    // Check user role. Allow only ["admin", "contentAdmin", "scholar"] to access evlaute page
    this.user.subscribe((event) => {
      if (
        event == null ||
        !["admin", "contentAdmin", "scholar"].includes(event["roles"][0])
      ) {
        this.navCtrl.navigateForward("/");
      }
    });
  }

  //* Get selected game tracks
  getGamesTracksData() {
    //* fetch id from params
    this.route.params.subscribe((params) => {
      this.game = JSON.parse(params.bundle);

      //* get selected game tracks
      this.trackService
        .getGameTracks(this.game.id)
        .then((res: any) => res.content)
        .then((tracks) => {
          this.gameTracks = tracks;
          console.log(
            "🚀 ~ file: game-tracks.page.ts:47 ~ GameTracksPage ~ .then ~ gameTracks:",
            this.gameTracks
          );
          this.initializeDataSource(this.gameTracks);
        });
    });
  }

  // material table - initialize data source
  initializeDataSource(usersData) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(usersData);
    console.log("this.dataSource: ", this.dataSource);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // material table filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportTrackData(trackId: string) {
    this.trackService
      .getGameTrackById(trackId)
      .then((res: any) => res.content)
      .then((trackData) => {
        this.downloadTrackData(trackData);
      });
  }

  private downloadTrackData(trackData: any) {
    const blob = new Blob([JSON.stringify(trackData, null, 2)], {
      type: "application/json",
    });
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      gameName: trackData.name,
      players: trackData.players,
      blobUrl: window.URL.createObjectURL(blob),
      // backupType: "snippets",
    };

    const dialogRef = this.dialog.open(downloadTrackDialog, dialogConfig);

    /* dialogRef.afterClosed().subscribe(result => {
      console.log("🚀 ~ file: game-tracks.page.ts:142 ~ GameTracksPage ~ dialogRef.afterClosed ~ result:", result)
      console.log('The dialog was closed');
    }); */

    // this.dialog.closeAll();
  }

  async showAlertOpenGeoGamiWebVersion() {
    const alert = await this.alertCtr.create({
      backdropDismiss: true, // disable alert dismiss when backdrop is clicked
      header: "Open GeoGami portal",
      //subHeader: 'Important message',
      message: "To download tracks you need to use GeoGami portal.",
      buttons: [ /* 'OK' */
        {
          text: "Open portal",
          cssClass: 'alert-button-download-track',
          // role: 'cancel',
          handler: () => {
            window.open(
              "https://app.geogami.ifgi.de/",
              "_system"
            );
          }
        }
      ]
    });
    await alert.present();
  }
}
