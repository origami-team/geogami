import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IUser } from '../interfaces/iUser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  AUTH_API_URL = environment.apiURL;

  private user$: BehaviorSubject<IUser>;
  private loading$: BehaviorSubject<boolean>;
  private loginPageOpen$: BehaviorSubject<boolean>;
  private errorMessage$: BehaviorSubject<string>;
  private refreshTokenInProgress$: BehaviorSubject<boolean>;
  private registerMessage$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private router: Router, private utilService: UtilService) {
    this.user$ = new BehaviorSubject(null);
    this.loading$ = new BehaviorSubject(false);
    this.loginPageOpen$ = new BehaviorSubject(false);
    this.errorMessage$ = new BehaviorSubject(null);
    this.refreshTokenInProgress$ = new BehaviorSubject(false);
    this.registerMessage$ = new BehaviorSubject(false);
  }

  createHeaders() {
    let headers = new HttpHeaders();
    const token = window.localStorage.getItem("bg_accesstoken");
    if (token) {
      headers = headers.append("Authorization", "Bearer " + token);
    }
    headers = headers.append("Content-Type", "application/json");
    return headers;
  }

  getUser() {
    return this.user$.asObservable();
  }
  getUserValue() {
    return this.user$.getValue();
  }
  setUser(user: IUser) {
    return this.user$.next(user);
  }

  /* additional functions */
  getUserRole(){
    return this.getUserValue()['roles'][0]
  }

  getUserId(){
    return this.getUserValue()['_id']
  }
  /*  */

  getLoginPageOpen() {
    return this.loginPageOpen$.asObservable();
  }
  getloginPageOpenValue() {
    return this.loginPageOpen$.getValue();
  }
  setLoginPageOpen(open: boolean) {
    this.setErrorMessage(null);
    return this.loginPageOpen$.next(open);
  }

  getLoading() {
    return this.loading$.asObservable();
  }
  getLoadingValue() {
    return this.loading$.getValue();
  }
  setLoading(loading: boolean) {
    return this.loading$.next(loading);
  }

  getErrorMessage() {
    return this.errorMessage$.asObservable();
  }
  getRefreshTokenInProgress() {
    return this.refreshTokenInProgress$.asObservable();
  }
  getRefreshTokenInProgressValue() {
    return this.refreshTokenInProgress$.getValue();
  }
  getErrorMessageValue() {
    return this.errorMessage$.getValue();
  }
  setErrorMessage(errorMessage: string) {
    return this.errorMessage$.next(errorMessage);
  }

  getRegisterStatus() {
    return this.registerMessage$.asObservable();
  }

  register(creds) {
    this.loading$.next(true);
    this.http.post(this.AUTH_API_URL + '/user/register', creds).subscribe(
      (res: any) => {
        this.registerMessage$.next(res.success); //-- ToDo
        this.loading$.next(false); // To avoid loading in user/login page
        this.setLoginPageOpen(false); // Hide error message (if already shown)
        this.router.navigate(['/user/login']);
      },
      (err) => {
        console.log(err);
        this.errorMessage$.next(err.error.msg);
        this.loading$.next(false);
      }
    );
  }

  login(creds) {
    this.registerMessage$.next(false);
    this.loading$.next(true);
    this.http.post(this.AUTH_API_URL + '/user/login', creds).subscribe(
      (res: any) => {
        this.user$.next(res.user);
        window.localStorage.setItem('bg_accesstoken', res.token);
        window.localStorage.setItem('bg_refreshtoken', res.refreshToken);
        this.loading$.next(false);
        this.setLoginPageOpen(false);
        this.router.navigate(['/']);
      },
      (err) => {
        this.errorMessage$.next(err.error.message);
        this.loading$.next(false);
      }
    );
  }

  requestResetPassword(email) {
    this.http
      .post(this.AUTH_API_URL + '/user/request-password-reset', { email })
      .subscribe(
        (res: any) => {
          this.registerMessage$.next(res.success);
          this.setLoginPageOpen(false);
          // send email address as a parameter to reset-password page (to be used in text and in backend to find user)
          this.router.navigate(['/user/reset-password'], { state: { email :email.email} });
        },
        (err) => {
          console.log(err);
          this.errorMessage$.next(err.error.message);
        }
      );
  }

  resetPassword(newPassword, email, verificationCode) {
    this.http
      .post(this.AUTH_API_URL + '/user/password-reset', {
        newPassword,
        email,
        verificationCode,
      })
      .subscribe(
        (res: any) => {
          // show toast msg
          this.utilService.showToast(res.message, "dark", 3500)
          this.setLoginPageOpen(false);
          this.router.navigate(['/user/login']);
        },
        (err) => {
          this.errorMessage$.next(err.error.message);
        }
      );
  }

  recoverSession(token) {
    // console.log('RECOVER');
    this.refreshTokenInProgress$.next(true);
    this.http
      .post(this.AUTH_API_URL + '/user/refresh-auth', { token })
      .subscribe(
        (res: any) => {
          this.user$.next(res.data.user);
          window.localStorage.setItem('bg_accesstoken', res.token);
          window.localStorage.setItem('bg_refreshtoken', res.refreshToken);
          this.loading$.next(false);
          this.setLoginPageOpen(false);
        },
        (err) => {
          this.errorMessage$.next(err.error.message);
          this.loading$.next(false);
        }
      );
  }

  refreshAccessToken() {
    return new Observable((observer) => {
      return this.http
        .post(this.AUTH_API_URL + '/user/refresh-auth', {
          token: window.localStorage.getItem('bg_refreshtoken'),
        })
        .subscribe(
          (response: any) => {
            this.user$.next(response.user);
            window.localStorage.setItem('bg_accesstoken', response.token);
            window.localStorage.setItem(
              'bg_refreshtoken',
              response.refreshToken
            );
            this.loading$.next(false);

            observer.next(response.refreshToken);
            observer.complete();
          },
          (err) => {
            const error = err && err.errorMessage ? err.errorMessage : 'Error';
            observer.error({ error });
          }
        );
    });
  }

  logout() {
    window.localStorage.removeItem('bg_accesstoken');
    window.localStorage.removeItem('bg_refreshtoken');
    this.user$.next(undefined);
    this.router.navigate(['/']);
  }

  getAccessToken() {
    return window.localStorage.getItem('bg_accesstoken');
  }

  // Delete my account
  DeleteMyAccount(user: string): Promise<any> {
    return this.http
      .post(`${environment.apiURL}/user/delete-me`, user, {
        headers: this.createHeaders()
      })
      .toPromise();
  }

  // Delete account and logout
  DeleteAccountLogout(user: string) {
    this.DeleteMyAccount(user);
    this.logout();
  }

  // Get users list
  GetUsers(): Promise<any>{
    return this.http
      .get(`${environment.apiURL}/user/user`, {
        headers: this.createHeaders(),
      })
      .toPromise();
  }

  // update user role
  updateUserRole(user: string ): Promise<any> {
    return this.http
      .put(`${environment.apiURL}/user/update-role`, user, {
        headers: this.createHeaders(),
        observe: "response",
      })
      .toPromise();
  }
}
