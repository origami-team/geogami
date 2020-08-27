import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Game } from "./../models/game";

import { environment } from "../../environments/environment";
import { BeaconInfo } from '../models/ibeacon/beaconInfo';
import { GameResults } from '../models/ibeacon/gameResults';

@Injectable({
  providedIn: "root"
})
export class GamesService {
  constructor(private http: HttpClient) { }

  getGames(minimal: boolean = false): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/games?minimal=${minimal}`)
      .toPromise();
  }

  getTracks(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/tracks`)
      .toPromise();
  }

  getGame(id: string): Promise<any> {
    return this.http.get(`${environment.apiURL}/game/${id}`).toPromise();
  }

  postGame(game: Game): Promise<any> {
    return this.http
      .post(`${environment.apiURL}/game`, game, { observe: "response" })
      .toPromise();
  }

  updateGame(game: Game): Promise<any> {
    return this.http
      .put(`${environment.apiURL}/game`, game, { observe: "response" })
      .toPromise();
  }

  /**************************/
  /* ibeacon services start */
  getBeaconInfo(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/beacon-info`)
      .toPromise();
  }

  postBeaconInfo(beaconInfo: BeaconInfo): Promise<any> {
    return this.http
      .post(`${environment.apiURL}/beacon-info`, beaconInfo, { observe: "response" })
      .toPromise();
  }

  updateBeaconInfo(beaconInfo: BeaconInfo): Promise<any> {
    return this.http
      .patch(`${environment.apiURL}/beacon-info/` + beaconInfo.minor, beaconInfo, { observe: "response" })
      .toPromise();
  }

  getBeaconGame(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/game`)
      .toPromise();
  }

  postBeaconGame(game: Game): Promise<any> {
    return this.http
      .post(`${environment.apiURL}/game`, game, { observe: "response" })
      .toPromise();
  }

  updateBeaconGame(game: Game): Promise<any> {
    return this.http
      .patch(`${environment.apiURL}/game/` + game.name, game, { observe: "response" })
      .toPromise();
  }

  postGameResults(gameResults: GameResults): Promise<any> {
    return this.http
      .post(`${environment.apiURL}/game-results`, gameResults, { observe: "response" })
      .toPromise();
  }

  getGameResults(): Promise<any> {
    return this.http
      .get(`${environment.apiURL}/game-results`)
      .toPromise();
  }
  /* ibeacon services end */
}
