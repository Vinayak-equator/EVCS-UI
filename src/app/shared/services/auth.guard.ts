import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {

  constructor(public router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = localStorage.getItem('accessToken')
      ? localStorage.getItem('accessToken')
      : null;
    if (
      token &&
      token !== undefined &&
      token !== null &&
      token !== 'undefined'
    ) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
