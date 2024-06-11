import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket;

  constructor(socket: Socket) { 
    this.socket = socket;
  }

  creatAndJoinNewRoom(gameCode:string, virEnvType:string, isSingleMode:boolean){
    this.socket.emit("newGame", {
      gameCode: gameCode,
      virEnvType: virEnvType,
      isSingleMode: isSingleMode,
    });
  }

  joinVERoom(gameCode:string){
    this.socket.emit("joinVEGame", {
      gameCode: gameCode,
    });
  }
}