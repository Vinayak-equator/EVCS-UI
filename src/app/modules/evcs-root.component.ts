import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from './core/components/navbar/navbar.component';

@Component({
	selector: 'app-tenant-user-layout',
	templateUrl: './evcs-root.component.html',
	styleUrls: ['./evcs-root.component.css'],
})
export class EVCSRootComponent implements OnInit {

	@ViewChild(NavbarComponent) navbarComponent: NavbarComponent;

	toggleClass: string;
	loginDisplay = false;

	constructor() { }

	ngOnInit(): void {}

	receiveMessage($event: any): void {
		this.toggleClass = $event
	}
}
