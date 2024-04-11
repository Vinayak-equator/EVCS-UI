import { AuthGuard } from '@app/shared/services/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChargerCreationComponent } from './charger-creation.component';

const routes: Routes = [
  {
    path: '',
    component: ChargerCreationComponent,
    canActivate:[AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargerCreationRoutingModule { }
