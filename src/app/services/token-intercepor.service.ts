import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth-service.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private refreshTokenInProgress$ = this.auth.getRefreshTokenInProgress();
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private auth: AuthService) {
    this.refreshTokenInProgress$.subscribe((res) => {
      this.refreshTokenInProgress = res;
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          request.url.includes('refresh-auth') ||
          request.url.includes('authenticate')
        ) {
          if (request.url.includes('refresh-auth')) {
            this.auth.logout();
            // maybe redirect somewhere or open login modal?
          }
          return throwError(error);
        }
        if (error.status !== 403) {
          return throwError(error);
        }

        if (this.refreshTokenInProgress) {
          // TODO: Check if we need something like this
          return this.refreshTokenSubject
            .pipe(filter((result) => result !== null))
            .pipe(take(1))
            .pipe(
              switchMap(() => next.handle(this.addAuthenticationToken(request)))
            );
        } else {
          this.refreshTokenInProgress = true;
          this.refreshTokenSubject.next(null);

          return this.auth
            .refreshAccessToken()
            .pipe(
              switchMap((token: any) => {
                this.refreshTokenInProgress = false;
                this.refreshTokenSubject.next(token);
                return next.handle(this.addAuthenticationToken(request));
              })
            )
            .pipe(
              catchError((err: any) => {
                this.refreshTokenInProgress = false;

                this.auth.logout();
                return throwError(error);
              })
            );
        }
      })
    );
  }

  addAuthenticationToken(request) {
    const accessToken = this.auth.getAccessToken();
    if (!accessToken) {
      return request;
    }

    return request.clone({
      setHeaders: {
        Authorization: this.auth.getAccessToken(),
      },
    });
  }
}
