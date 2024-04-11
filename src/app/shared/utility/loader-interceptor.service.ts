// loader-interceptor.service.ts
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoaderService } from '@app/shared/services/loader.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  urlCheck = false;
  constructor(private loaderService: LoaderService, private router: Router) { }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let pageUrl = this.router.url;
    const noSpinner = localStorage.getItem('UserApproved');

    this.requests.push(req);

    // if (!noSpinner) {
    this.loaderService.isLoading.next(true);
    if (pageUrl.includes('/dashboard')) {
      this.removeRequest(req);
    }
    //  }

    return new Observable(observer => {
      const subscription = next.handle(req)
        .subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.removeRequest(req);
              observer.next(event);
            }
          },
          err => {
            console.log('error' + err);
            this.removeRequest(req);
            observer.error(err);
          },
          () => {
            this.removeRequest(req);
            observer.complete();
          });
      // remove request from queue when cancelled
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });
  }
}
