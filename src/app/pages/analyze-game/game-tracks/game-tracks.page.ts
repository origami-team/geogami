import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth-service.service";
import { TrackerService } from "src/app/services/tracker.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";


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

  //* to set sanitizer and file name
  sanitizedBlobUrl: any;
  filename: string;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private trackService: TrackerService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.getGamesTracksData();

    this.downloadTrack("1");
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

  /* downloadTrack(trackId: string) {
    this.trackService
      .getGameTrackById(trackId)
      .then((res: any) => res.content)
      .then((track) => {

        console.log("🚀🚀🚀 ~ track", track);
        const data = track;
        // 1
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        // 2
        const blobURL = window.URL.createObjectURL(blob);
        // 3
        const backupType = "snippets";
        // 4
        this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(blobURL);
        const currentDate = new Date();
        this.filename = `${backupType}_${currentDate.toISOString()}.json`;
      });
  } */

  downloadTrack(trackId: string) {
    this.trackService
      .getGameTrackById(trackId)
      .then((res: any) => res.content)
      .then((track) => {

        console.log("🚀🚀🚀 ~ track", track);
        const data = track;
        // 1
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        // 2
        const blobURL = window.URL.createObjectURL(blob);
        // 3
        const backupType = "snippets";
        // 4
        this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(blobURL);
        const currentDate = new Date();
        this.filename = `${backupType}_${currentDate.toISOString()}.json`;
      });
  }

}
