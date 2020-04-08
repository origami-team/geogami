import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Game } from "./../models/game";

import { environment } from "../../environments/environment";

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
}
