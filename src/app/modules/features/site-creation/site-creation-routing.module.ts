import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { SiteCreationComponent } from './site-creation.component';

const routes: Routes = [
  {
    path: '',
    component: SiteCreationComponent,
    canActivate:[AuthGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteCreationRoutingModule { }
