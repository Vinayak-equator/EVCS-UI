import { Guid } from "guid-typescript";
import { Address } from "./address.model";
import { ChargePointList } from "./chargePointList.model";

export class SiteList {
    constructor(){
		this.address = new Address();
        // this.chargePointList =  new Array<ChargePointList>();
		// this.chargePointList =  [
        //     new ChargePointList()
        // ];
	}

    siteId:string;
    name:string;
    lat:number;
    long:number;
    label:string;
    draggable:boolean;
	address : Address;
	location : string;
    status:string;
    numberOfConnectors:number;

    chargePointId:string;
    chargePointTenantId:string;
    chargePointName:string;
    chargePointStatus:string;

    connector1:string;
    connector1Name:string;
    connector1Status:string;

    connector2:string;
    connector2Name:string;
    connector2Status:string;

    noOfChargePoints:number;
    Available:number;
    Faulted:number;
    Occupied:number;
    Offline:number;
    OtherStatus:number
}