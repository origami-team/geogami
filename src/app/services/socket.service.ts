import { Injectable } from "@angular/core";
import { NavController } from "@ionic/angular";
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  socket: Socket;
  // channelCode is used when ve-app is opened in headset mode or using the ve-app directly (without url)
  // it is used to join the channel with ve-app and send game details after being selected by user
  private _channelCode: string; 

  getChannelCode(): string {
    return this._channelCode;
  }

  setChannelCode(value: string) {
    console.log("🚀 ~ SocketService ~ setchannelCode ~ channelCode:")
    this._channelCode = value;
  }

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
    console.log("🚀 test ~ SocketService ~ joinVERoom ~ joinVERoom:")
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

  // for closing webGL frame of single-player and multi-player game
  closeVEGame() {
    console.log("🚀 ~ SocketService ~ closeVEGame ~ closeVEGame:")
    this.socket.emit("closeVEGame");
  }

  /**
   * Socket events' listeners
   * for closing webGL frame of single-player game
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
