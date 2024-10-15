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

  /**
   * Socket events
   */
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

  checkRoomNameExistance(gameCode) {
    return new Promise((resolve) => {
      this.socket.emit(
        "checkRoomNameExistance_v2",
        { gameCode: gameCode },
        (callback) => {
          console.log(
            "🚀 ~ SocketService ~ checkRoomNameExistance ~ response.roomStatus:",
            callback.roomStatus
          );
          resolve(callback.roomStatus);
        }
      );
    });
  }

  // to close webgl frame when game is over
  closeVEGame() {
    console.log("🚀 ~ SocketService ~ closeVEGame ~ closeVEGame:")
    this.socket.emit("closeVEGame");
  }

  /**
   * Socket events' listeners
   */
  closeFrame_listener() {
    this.socket.on("closeWebGLFrame", () => {
      this.navCtrl.navigateForward(`/`);
    });
  }

  /**
   * General functions
   */
  disconnectSocket() {
    /* dissconnect socket connection */
    if (this.socket) {
      /* remove all listners to avoid duplicate listenres after rejoining game */
      this.socket.removeAllListeners();
      /*  dissconnect socket server*/
      this.socket.disconnect();
    }
  }
}
