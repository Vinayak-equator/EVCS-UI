import { Guid } from "guid-typescript";
import { Observable } from "rxjs";
import { Tenant } from "./tenant.model";

export class ServerError<T> {
    // export class ServerError<T> {
    // constructor(){
    // 	this.error.errors : Observable<T>;
    // }
    type: string;
    title: string;
    status: string;
    traceId: Guid;
    message:string;
    navigationUrl:string;
    error: {
        errors: {
            Phone: '',
            Name: '',
            Company: '',
            Email: '',
            Street: '',
            City: '',
            State: '',
            ZipCode: '',
        }
    };
}
