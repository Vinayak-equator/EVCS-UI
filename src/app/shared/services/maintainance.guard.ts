import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { AppConstants } from '@app/constants';
import { map, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard  {

  constructor(private httpDataService: HttpDataService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    return this.httpDataService.get(AppConstants.GetMaintenance)
      .pipe(
        map((res: boolean) => {
          if (res) {
            // If maintenance is required, navigate to maintenance page
            this.router.navigate(['/maintenance']);
            return false; // Prevent activation of the route
          } else {
            
            return true; // Allow activation of the route
          }
        }),
        catchError((error: any) => {
          // Handle error as needed
          return [true]; // Allow activation of the route even in case of an error
        })
      );
  }
}
