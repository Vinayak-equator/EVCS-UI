import { Connectors } from "./connectors.model";
import { Address } from "./address.model";

export class ChargePoint {
	constructor(){
		this.connectors =  [];
		// this.connectors = new Connectors();
		this.address = new Address();
	}
	id:string;
	key:string;
	chargePointId: string;
	tenantId: string;
	siteId: string;
	name: string;
	numberOfConnectors: number;
	availabilityStatus: string;
	status: string;
    chargerType:string;
	connectorType1:string;
	connectorType2:string;
	lastHeartBeatTime:string;
	lastTransactionTimeC1:string;
	lastTransactionTimeC2:string;
	connector1Id:number;
    connector1Name:string;
    connector1LastStatusTime:string;
    connector1LastMeterTime:string;
    connector1Meter:number;
    connector1AuthorizationCode:string;
	
	connector2Id:number;
    connector2Name:string;
    connector2LastStatusTime:string;
    connector2LastMeterTime:string;
    connector2Meter:number;
    connector2AuthorizationCode:string;
	
	connectors:Connectors[];
	connector:Connectors;
	connector1Status:string;
	connector1LastMeter:number;
	connector2Status:string;
	connector2LastMeter:number;
	address:Address;
	info:{
		chargePointVendor:string;
		chargePointModel:string;
		chargePointSerialNumber:string;
		chargeBoxSerialNumber:string;
		firmwareVersion:string;
		iccid:string;
		imsi:string;
		meterType:string;
		meterSerialNumber:string;
	}
}