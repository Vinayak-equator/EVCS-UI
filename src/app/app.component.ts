import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { AppConstants } from '@app/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  isIframe = false;
  userName = '';
  GetMaintenanceflag = true

  constructor(public router: Router, private indexedDBService: IndexedDBService, private httpDataService: HttpDataService,
    ) {

      this.check()
  }





  check(){
      if( this.GetMaintenanceflag){
        this.httpDataService
        .get(AppConstants.GetMaintenance)
        .subscribe(
          (res) => {
              // this.GetMaintenance = 
              if(res){
                this.router.navigate(['/maintenance'])
                this.GetMaintenanceflag = JSON.parse(res)
              }else{
                this.GetMaintenanceflag = false
              }
          },
          (error) => {
            console.log(error);
          }
        );
      }
   
  }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    const user = localStorage.getItem('user');
    if (user) {
      this.indexedDBService.getTableList('PermissionDB').then((data: any) => {
        if (!data.length) {
          localStorage.clear();
          sessionStorage.clear();
          this.router.navigate(['/']);
        }
      }).catch(error => {
        console.error(error);
      });
    }
  }
}
