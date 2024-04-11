import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RegisterChargePointRoutingModule } from './register-chargepoint-routing.module';
import { RegisterChargePointComponent } from './register-chargepoint.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    RegisterChargePointComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    RegisterChargePointRoutingModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class RegisterChargePointModule { }
