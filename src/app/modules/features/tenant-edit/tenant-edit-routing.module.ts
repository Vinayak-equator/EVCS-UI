import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { TenantEditComponent } from './tenant-edit.component';

const routes: Routes = [
  {
    path: 'tenantedit/:tenantId',
    component: TenantEditComponent,
    canActivate:[AuthGuard]
  },
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantEditRoutingModule { }
