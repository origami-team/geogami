import { Component, OnInit, ElementRef } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analyze-game-list',
  templateUrl: './analyze-game-list.page.html',
  styleUrls: ['./analyze-game-list.page.scss']
})
export class AnalyzeGameListPage implements OnInit {
  tracks: any[] = [];

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
    await this.getTracks();
  }

  async getTracks() {
    try {
      const ret = await Plugins.Filesystem.readdir({
        path: 'origami/tracks',
        directory: FilesystemDirectory.Documents
      });
      this.tracks = ret.files;
    } catch (e) {
      console.error('Unable to read dir', e);
    }
  }

  async upload(track) {
    const contents = await Plugins.Filesystem.readFile({
      path: `origami/tracks/${track}`,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8
    });
    console.log(contents);

    this.http.post(`${environment.apiURL}/track`, JSON.parse(contents.data), { observe: 'response' })
      .subscribe(response => alert(response.status + ' ' + response.statusText));
  }

  async remove(track) {
    this.confirmDialog(`Willst du die Datei ${track} wirklich löschen?`)
      .then(async () => {
        await Plugins.Filesystem.deleteFile({
          path: `origami/tracks/${track}`,
          directory: FilesystemDirectory.Documents,
        });
      })
      .catch(err => console.log('User aborted delete'))
      .finally(async () => await this.getTracks());
  }

  private confirmDialog(msg: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const confirmed = window.confirm(msg);

      return confirmed ? resolve(true) : reject(false);
    });
  }
}
