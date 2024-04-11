import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/services/auth.guard';
import { TransactionEditComponent } from './transaction-edit.component';

const routes: Routes = [
  {
    path: 'transaction-edit/:transactionId',
    component: TransactionEditComponent,
    canActivate:[AuthGuard]
  },
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionEditRoutingModule { }
