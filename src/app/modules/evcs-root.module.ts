/**
 * This it the evcs main module
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EVCSRootRoutingModule } from './evcs-root-routing.module';
import { CoreModule } from './core/core.module';
import { EVCSRootComponent } from './evcs-root.component';
import { SharedModule } from '../shared/shared.module';
import { SmartChargingComponent } from './features/smart-charging/smart-charging.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';

@NgModule({
	declarations: [
		EVCSRootComponent,
        SmartChargingComponent,
        OnboardingComponent,
  
  
  
	],
	imports: [
		SharedModule, /*this will have all the shared components info*/
		CommonModule, /*this will have all the common components info*/
		CoreModule, /*this will have all the core module components info*/
		EVCSRootRoutingModule
	]
})
export class EVCSRootModule { }
