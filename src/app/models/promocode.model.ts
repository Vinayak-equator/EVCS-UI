import { DecimalPipe } from "@angular/common";
import { Guid } from "guid-typescript";

export class PromoCode {
	
	promoCodeID:Guid;
	promoCode:string;
	promoCodeDescription: string;
	discountPercentage: number;
    flatDiscount: number;
    validityStartDate: string;
    validityEndDate: string;
    maxUsage: number;
    tenantId: string;
    siteId: string;
    chargePointId: string;
    used: 0;
    isActive: true;
    isDeleted: true;
    status: string;
    createdOn: string;
    createdBy: string;
    updatedOn: string;
    updatedBy: string;
}
