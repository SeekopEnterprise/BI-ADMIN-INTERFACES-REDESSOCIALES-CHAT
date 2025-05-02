import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/dist/types";
import { ResponseKpiPostChat } from "../interfaces/kpi-post-chat.interface";

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    constructor(private http: HttpClient) { }
    getKpiPostChatByIdPublicacion(idPublicacion:string): Observable<ResponseKpiPostChat> {
        let apiUrl = 'http://demo8917364.mockable.io/getKpiPostChatByIdPublicacion';

        return this.http.get<ResponseKpiPostChat>(apiUrl);
    }
}