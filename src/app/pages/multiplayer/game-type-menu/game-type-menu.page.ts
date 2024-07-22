import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
    private authService: AuthService,
    private router: Router
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
      if (event != null) {
        this.userRole = event["roles"][0];
      }
    });
  }

  navCreateSinglePlayerGamePage() {
    // this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: true,
    };

    // for both real and Vir.Emv. (single-player mode)
    this.router.navigate(
      [this.isRealWorld ? "create-game-list" : "create-game-virtual-menu"],
      { state: bundle }
    );
  }

  navCreateMultiPlayerGamePage() {
    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: false,
    };

    // for both real and Vir.Emv. (multi-player mode)
    this.router.navigate(
      [this.isRealWorld ? "create-game-list" : "create-game-virtual-menu"],
      { state: bundle }
    );
  }
}
