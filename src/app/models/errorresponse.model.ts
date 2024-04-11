import { HttpHeaders } from "@angular/common/http";
import { Tenant } from "./tenant.model";

export class ErrorResponse {
	errors: [];
	title: string;
    error?: any;
    headers?: HttpHeaders;
    status?: number;
    statusCode?: number;
    url?: string;
    message:string;
}
