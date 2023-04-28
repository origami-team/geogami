import { Injectable } from "@angular/core";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Game } from "./../models/game";

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class GamesService {
  constructor(private http: HttpClient) { }

  createHeaders() {
    let headers = new HttpHeaders();
    const token = window.localStorage.getItem("bg_accesstoken");
    if (token) {
      headers = headers.append("Authorization", "Bearer " + token);
    }
    headers = headers.append("Content-Type", "application/json");
    return headers;
  }

  getGames(minimal: boolean = false, contentAdmin: boolean = false): Promise<any> {
    // Only content admin can view multi-players games
    return this.http
      .get(`${environment.apiURL}/game/all/?${minimal ? "minimal" : ""}&${contentAdmin ? "contentAdmin" : ""}`)
      .toPromise();
  }

  getMinimalGamesWithLocs(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/game/allwithlocs`)
      .toPromise();
  }

  getTracks(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/tracks`, {
        headers: this.createHeaders(),
      })
      .toPromise();
  }

  getGame(id: string): Promise<any> {
    return this.http.get(`${environment.apiURL}/game/${id}`).toPromise();
  }

  postGame(game: Game): Promise<any> {
    // console.log("///Game to be posted: ", game);
    delete game._id;
    // console.log("///Game to be posted without id: ", game);
    game.tasks.forEach((task) => delete task._id);
    return this.http
      .post(`${environment.apiURL}/game`, game, {
        headers: this.createHeaders(),
        observe: "response",
      })
      .toPromise();
  }

  updateGame(game: Game): Promise<any> {
    game.tasks.forEach((task) => {
      if (task._id.length != 24) delete task._id;
    });
    return this.http
      .put(`${environment.apiURL}/game`, game, {
        headers: this.createHeaders(),
        observe: "response",
      })
      .toPromise();
  }

  getUserGames(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/user/games`, {
        headers: this.createHeaders(),
      })
      .toPromise();
  }

  // To retreive updated app version
  getAppVersion(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/appversion/current`)
      .toPromise();
  }

  /* uploadTrack(data): Promise<any> {
    return this.http
    .post(`${environment.apiURL}/track`, data, {
      headers: this.createHeaders(),
      observe: 'response',
    }
    ).toPromise();
  } */
}
