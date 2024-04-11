import { Guid } from 'guid-typescript';
import { Address } from './address.model';
import { Site } from './site.model';
export class Tenant {
	constructor(){
		this.address = new Address();
	}
    tenantId: Guid;
	name: string;
	company: string;
	email: string;
	address : Address;
	street: string;
	location: string;
	city: string;
	state: string;
	country:string;
	zipCode: string;
	phone: string;
	registrationDate:string;
	status:string;
	sites:Site[];
	type:string;
	isOwnMerchantKey: boolean;
	keyName: string;
	apiLoginID: string;
	apiTransactionKey: string;
}
