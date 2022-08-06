import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  loginForm;
  error: string;
  loading;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.authService.setLoginPageOpen(false); // To hide error message from other pages

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });

    this.authService.getLoading().subscribe((loading) => {
      this.loading = loading;
    });
  }

  login() {
    console.log(this.loginForm.getRawValue());
    this.authService.register(this.loginForm.getRawValue());
  }
}
