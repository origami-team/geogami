import { Component, OnInit, ElementRef } from "@angular/core";

import { NavController } from "@ionic/angular";

import { GamesService } from "../../../services/games.service";

import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-analyze-game-list",
  templateUrl: "./analyze-game-list.page.html",
  styleUrls: ["./analyze-game-list.page.scss"]
})
export class AnalyzeGameListPage implements OnInit {
  tracks: any[] = []

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private elRef: ElementRef,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    // this.gamesService.getTracks().then(tracks => {
    //   this.tracks = tracks
    // });
    try {
      let ret = await Plugins.Filesystem.readdir({
        path: 'origami/tracks',
        directory: FilesystemDirectory.Documents
      });
      this.tracks = ret.files
    } catch (e) {
      console.error('Unable to read dir', e);
    }
  }

  async upload(track) {
    let contents = await Plugins.Filesystem.readFile({
      path: `origami/tracks/${track}`,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8
    });
    console.log(contents);

    this.http.post(`${environment.apiURL}/track`, JSON.parse(contents.data), { observe: "response" })
      .subscribe(response => alert(response.status + " " + response.statusText))
  }
}
