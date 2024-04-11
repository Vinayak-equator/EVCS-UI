import { SignUpInvitationComponent } from './components/sign-up-invitation/sign-up-invitation.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSerializer } from '@angular/router';
import { MaintainaceComponent } from './maintainace/maintainace.component';
import { MaintenanceGuard } from './shared/services/maintainance.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent,
    canActivate: [MaintenanceGuard]

  },
  {
    path: 'SignUpInvitation',
    component: SignUpInvitationComponent,
    canActivate: [MaintenanceGuard]

  },
  {
    path: '*',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    
  },
  {
    path: 'maintenance',
    component: MaintainaceComponent
  },
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    useHash: false,
    initialNavigation: !isIframe ? 'enabledBlocking' : 'disabled',
    scrollPositionRestoration: 'top',
    paramsInheritanceStrategy: 'always',
    malformedUriErrorHandler: (error: URIError, urlSerializer: UrlSerializer, url: string) => urlSerializer.parse('/dashboard')
}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
