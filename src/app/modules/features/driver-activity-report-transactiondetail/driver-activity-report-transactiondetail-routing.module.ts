import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { DriverActivityReportTransactiondetailComponent } from './driver-activity-report-transactiondetail.component';


const routes: Routes = [
  {
    path: '',
    component: DriverActivityReportTransactiondetailComponent,
    canActivate:[AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverActivityReportTransactiondetailRoutingModule { }
