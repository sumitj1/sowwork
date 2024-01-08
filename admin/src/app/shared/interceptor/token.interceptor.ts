import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiService } from '../service/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private api: ApiService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (this.api.getUserToken()) {
      req = req.clone({
        setHeaders: {
          token: `Bearer ${this.api.getUserToken()}`,
          timezone,
        },
      });
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle the error here
        console.error('HTTP Error:', error);
        // You can rethrow the error or return a custom response
        if (error.status == 401) {
          this.api.deleteSession();
        }
        return throwError(error);
      })
    );
  }
}
