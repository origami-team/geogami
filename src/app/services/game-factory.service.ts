import { Injectable } from '@angular/core';

import { Game } from './../models/game'


@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  public game: Game

  constructor() { }


  addGameInformation(data: any) {
    this.game = {
      ...this.game,
      ...data
    }
    console.log("New Game: ", this.game)
  }

  addTask(task: any) {
    this.game = {
      ...this.game,
      tasks: [
        ...this.game.tasks,
        task
      ]
    }
  }
}
