import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { SiteListComponent } from './site-list.component';

const routes: Routes = [
  {
    path: '',
    component: SiteListComponent,
    canActivate:[AuthGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteListRoutingModule { }
