import { Injectable } from "@angular/core";
import { NavController } from "@ionic/angular";
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  socket: Socket;

  constructor(socket: Socket, public navCtrl: NavController) {
    this.socket = socket;
  }

  creatAndJoinNewRoom(
    gameCode: string,
    virEnvType: string,
    isSingleMode: boolean
  ) {
    this.socket.emit("newGame", {
      gameCode: gameCode,
      virEnvType: virEnvType,
      isSingleMode: isSingleMode,
    });
  }

  joinVERoom(gameCode: string) {
    this.socket.emit("joinVEGame", {
      gameCode: gameCode,
    });
  }

  closeVEGame() {
    this.socket.emit("closeVEGame");
  }

  closeFrame_listener() {
    this.socket.on("closeWebGLFrame", () => {
      this.navCtrl.navigateForward(`/`);
    });
  }

  disconnectSocket() {
    /* dissconnect socket connection */
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
