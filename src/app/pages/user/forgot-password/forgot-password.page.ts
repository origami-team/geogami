import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  loginForm;
  error: string;
  register;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
    });

    this.authService.setLoginPageOpen(false); // To hide error message from other pages

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });
  }

  resetPassword() {
    // Remove extra spaces before and after email string
    this.loginForm.setValue({email: (this.loginForm.getRawValue().email).trim()})
    this.authService.requestResetPassword(this.loginForm.getRawValue());
  }
}
