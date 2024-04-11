import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { ChargerEditComponent } from './charger-edit.component';

const routes: Routes = [
  {
    path: '',
    component: ChargerEditComponent,
    canActivate:[AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargerEditRoutingModule { }
