import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { NavController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth-service.service";

@Component({
  selector: "app-create-game",
  templateUrl: "./create-game.page.html",
  styleUrls: ["./create-game.page.scss"],
})
export class CreateGamePage implements OnInit {
  // To hold received parametres vlaues via route
  isRealWorld: boolean = true;
  isSingleMode: boolean = true;
  userRole: string;
  bundle: any;

  user = this.authService.getUser();

  constructor(
    public navCtrl: NavController,
    private route: ActivatedRoute,
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

  navigateCreateGamePage() {
    //* if user role, hide vir env & multiplayer create/edit impl.
    if (this.userRole != "user") {
      this.navCtrl.navigateForward("create-game-menu");
    } else {
      this.bundle = {
        isRealWorld: true,
        isSingleMode: true,
      };

      this.navCtrl.navigateForward(
        `create-game-list/${JSON.stringify(this.bundle)}`
      );
    }
  }

  navigateEditGame() {
    this.navCtrl.navigateForward(`edit-game-list`);
  }
}
