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
}