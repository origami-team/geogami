import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private game: Game;
  private taskIndex = 0;

  taskSubscription: BehaviorSubject<Task | null> = new BehaviorSubject(null);
  gameFinishedSubscription: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }

  loadGame(game: Game) {
    this.game = game;
    this.taskIndex = 0;
    this.gameFinishedSubscription.next(false);
    this.taskSubscription.next(this.game.tasks[this.taskIndex]);
  }

  nextTask() {
    this.taskIndex++;
    if (this.taskIndex > this.game.tasks.length) {
      this.gameFinishedSubscription.next(true);
      this.taskSubscription.complete();
    } else {
      this.taskSubscription.next(this.game.tasks[this.taskIndex]);
    }
  }
}
