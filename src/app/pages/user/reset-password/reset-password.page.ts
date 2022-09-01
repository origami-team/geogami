import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  loginForm;
  error: string;
  register;
  codeInput = [];
  userEmail;
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Get user email address sent from forgot password page
    this.userEmail = this.router.getCurrentNavigation().extras.state.email;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      password: ['', Validators.required],
      Input1: ['', Validators.required],
      Input2: ['', Validators.required],
      Input3: ['', Validators.required],
      Input4: ['', Validators.required],
      Input5: ['', Validators.required],
    });

    this.authService.setLoginPageOpen(false); // To hide error message from other pages

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });
  }

  resetPassword() {
    this.authService.resetPassword(this.loginForm.getRawValue().password, this.userEmail ,this.codeInput.join(''));
  }

  gotoNextField(nextElement) {
    nextElement.setFocus();
  }
  
}
