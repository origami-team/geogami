import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth-service.service";

@Component({
  selector: "app-game-type-menu",
  templateUrl: "./game-type-menu.page.html",
  styleUrls: ["./game-type-menu.page.scss"],
})
export class GameTypeMenuPage implements OnInit {
  user = this.authService.getUser();
  userRole: String = "unlogged";

  constructor(
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  isRealWorld = false;

  ngOnInit() {
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "RealWorld") {
        this.isRealWorld = true;
      } else {
        this.isRealWorld = false;
      }
    });

    /* Check whther user is registerd. if yes, get role and id */
    // Get user role
    this.user.subscribe((event) => {
      console.log(
        "🚀 ~ PlayGameMenuPage ~ this.user.subscribe ~ user:",
        this.user
      );
      if (event != null) {
        this.userRole = event["roles"][0];
        console.log(
          "🚀 ~ PlayGameMenuPage ~ this.user.subscribe ~ this.userRole:",
          this.userRole
        );
      }
    });
  }

  navCreateSinglePlayerGamePage() {
    // this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: true,
    };

    /* fpr both real and Vir.Emv. */
    if (this.isRealWorld) {
      this.navCtrl.navigateForward(
        `create-game-list/${JSON.stringify(bundle)}`
      );
    } else {
      this.navCtrl.navigateForward(
        `create-game-virtual-menu/${JSON.stringify(bundle)}`
      );
    }
  }

  navCreateMultiPlayerGamePage() {
    // this.navCtrl.navigateForward(`play-game/play-game-list/${"VRWorld"}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: false,
    };

    /* fpr both real and Vir.Emv. */
    if (this.isRealWorld) {
      this.navCtrl.navigateForward(
        `create-game-list/${JSON.stringify(bundle)}`
      );
    } else {
      this.navCtrl.navigateForward(
        `create-game-virtual-menu/${JSON.stringify(bundle)}`
      );
    }
  }
}
