import { Component, OnInit } from '@angular/core';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { AppConstants } from '@app/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maintainace',
  templateUrl: './maintainace.component.html',
  styleUrls: ['./maintainace.component.css']
})
export class MaintainaceComponent implements OnInit {

  GetMaintenanceflag = true


  constructor(private httpDataService: HttpDataService,private router: Router) {    
    setInterval(() => this.checkMaintenanceStatus(), 15000);
   }

  ngOnInit(): void {

  }


  private checkMaintenanceStatus() {
    if( this.GetMaintenanceflag){

    this.httpDataService.get(AppConstants.GetMaintenance)
      .subscribe(
        (res: boolean) => {
          console.log(res)
          if (!res) {
            this.GetMaintenanceflag = false
            this.router.navigate(['/']);
          }
        },
        (error) => {
          console.log(error);
          // Handle error as needed
        }
      );
    }
  }



}
