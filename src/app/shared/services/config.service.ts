import { Injectable, Inject } from '@angular/core';
// import Helper from '../Utility/helper';

@Injectable()
export class ConfigService {
	iisApplication = '';

	constructor(@Inject('IisApplication') iisApplication: string) {
		this.iisApplication = iisApplication;
	}

	getApiURI() {
		return this.getBaseURI() + 'api/';
	}

	getBaseURI() {
		const pathArray = window.location.href.split('/');

		const protocol = pathArray[0];
		const host = pathArray[2];
		let path = protocol + '//' + host + '/';
		if (this.iisApplication != null || this.iisApplication !='') {
			path += this.iisApplication + '/';
		}
		return path;
	}
}
