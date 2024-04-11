import { Guid } from "guid-typescript";
import { Connectors } from "./connectors.model";

export class ChargePointList {
    constructor(){
		this.connectors = [] as Array<Connectors>;
	}
    id:string;
    chargePointId:string;
    siteId:string;
    key:string;
    tenantId:string;
    name:string;
    numberOfConnectors:number;
    chargerType:string;
    status:string;
    connectors:Connectors[];
}