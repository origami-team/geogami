import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';

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
      header: 'Delete Account',
      //cssClass:'buttonCss',
      //subHeader: 'Important message',
      message: "Are you sure you want to delete your account?",
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // Do nothing
          },
        },
        {
          text: 'Delete Account',
          cssClass: 'alert-button-confirm',
          handler: () => {
            console.log("user: ", this.user);
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
