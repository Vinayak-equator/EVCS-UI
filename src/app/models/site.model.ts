import { Guid } from "guid-typescript";
import { Address } from "./address.model";

export class Site {
	constructor(){
		this.address = new Address();
	}
	siteId:Guid;
	tenantName:string;
	name: string;
	utilityProvider: string;
	level2Rate: number;
	level2RateUnit: string;
	utilityBill: File;
	utilityBillUrl:string;
	utilitytdu: string;
	dcFastRate: number;
	dcFastRateUnit : string;
	street: string;
	city: string;
	state: string;
	country:string;
	zipCode: string;
	phone: string;
	status:string;
	address:Address;
	isTransferred: boolean;
	isDeleted: boolean;
	markupCharge: string;
	markupPercentForDC: string;
	preAuthAmount: string;
	dateofCommissioning: string;
	transactionfees: number;
	utilityFees: number;
	cloudServiceFees: number;
	revenueShare: number;
	utilityfeesownedbysiteowner: boolean;
	customerId: string;
	vendorId: string;
	priceType: number;
    networkingFees: number;
	processingFees: number;
    meterServiceFees: number;
    salesTax: number;
    siteManager: string;
    meterNumber:  number;
    utilityOwner: string;
    utilityCost: number;
    maintenanceCharges: number;
    maintenanceChargesReason: string;
	isOwnSetting: boolean;
	timePricing: Object;
	registrationDate: string;
}
