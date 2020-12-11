import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth-service.service";
import { Validators, FormBuilder } from "@angular/forms";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  loginForm;
  error: string;
  register;
  loading;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });

    this.authService.getLoading().subscribe((loading) => {
      this.loading = loading;
    });

    this.authService.getRegisterStatus().subscribe((r) => {
      this.register = r;
    });
  }

  login() {
    console.log(this.loginForm.getRawValue());
    this.authService.login(this.loginForm.getRawValue());
  }

  navigateRegister() {
    this.navCtrl.navigateForward("user/register");
  }

  navigateForgotPassword() {
    this.navCtrl.navigateForward("user/forgot-password");
  }
}
