import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { TenantCreationComponent } from './tenant-creation.component';

const routes: Routes = [
  {
    path: '',
    component: TenantCreationComponent,
    canActivate:[AuthGuard]
  },
 ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantCreationRoutingModule { }
