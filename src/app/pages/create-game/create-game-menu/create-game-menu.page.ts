import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth-service.service";

@Component({
  selector: "app-create-game-menu",
  templateUrl: "./create-game-menu.page.html",
  styleUrls: ["./create-game-menu.page.scss"],
})
export class CreateGameMenuPage implements OnInit {
  user = this.authService.getUser();
  userRole: string = "user";

  constructor(
    public navCtrl: NavController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get user role
    this.user.subscribe((event) => {
      if (event != null) {
        this.userRole = event["roles"][0];
      }
    });
  }

  navigateCreateRealGamePage() {
    // this.navCtrl.navigateForward('create-game');

    if (["admin", "contentAdmin", "scholar"].includes(this.userRole)) {
      this.navCtrl.navigateForward(`game-type-menu/${"RealWorld"}`);
    } else {
      let bundle = {
        isRealWorld: true,
        isSingleMode: true
      }  
      this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(bundle)}`);
    }
  }

  navigateCreateVirtualGamePage() {
    if (["admin", "contentAdmin", "scholar"].includes(this.userRole)) {
      this.navCtrl.navigateForward(`game-type-menu/${"Vir.Env."}`);
    } else {
      let bundle = {
        isRealWorld: false,
        isSingleMode: true
      }  
      this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(bundle)}`);
    }
  }
}
