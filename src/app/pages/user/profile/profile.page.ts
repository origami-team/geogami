import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  loginForm;
  error: string;
  register;

  user;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController,
    private alertController: AlertController,
    public _translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUserValue();

    this.loginForm = this.fb.group({
      username: [this.authService.getUserValue().username],
      email: [this.authService.getUserValue().email],
    });

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });

    this.authService.getRegisterStatus().subscribe((r) => {
      this.register = r;
    });
  }

  updateUser() { }

  logout() {
    this.authService.logout();
  }

  // Delete user account
  async deleteMyAccount() {
    const alert = await this.alertController.create({
      backdropDismiss: false, // disable alert dismiss when backdrop is clicked
      header: this._translate.instant("User.deleteAccountHeader"),
      //cssClass:'buttonCss',
      //subHeader: 'Important message',
      message: this._translate.instant("User.deleteAccountMsg"),
      buttons: [
        {
          text: this._translate.instant("User.cancel"),
          handler: () => {
            // Do nothing
          },
        },
        {
          text: this._translate.instant("User.deleteAccount"),
          cssClass: 'alert-button-confirm',
          handler: () => {
            // console.log("user: ", this.user);
            this.authService.DeleteAccountLogout(this.user);
          },
        },
      ],
    });
    await alert.present();
  }

  navigateRegister() {
    this.navCtrl.navigateForward('user/register');
  }
}
