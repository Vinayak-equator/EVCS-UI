import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { SiteDashboardComponent } from './site-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SiteDashboardComponent,
    canActivate:[AuthGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteDashboardRoutingModule { }
