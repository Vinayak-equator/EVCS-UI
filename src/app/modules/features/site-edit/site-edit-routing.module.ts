import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { SiteEditComponent } from './site-edit.component';

const routes: Routes = [
  {
    path: '',
    component: SiteEditComponent,
    canActivate:[AuthGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteEditRoutingModule { }
