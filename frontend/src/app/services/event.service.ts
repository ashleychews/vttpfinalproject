import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Events } from "../models";

@Injectable()
export class EventService {

    private http = inject(HttpClient)

    getAllEvents(page: number, size:number): Observable<Events[]> {
        return this.http.get<Events[]>(`/api/events?page=${page}&size=${size}`)
    }

    getEventsByCountry(countryCode: string, page: number, size: number): Observable<Events[]> {
        return this.http.get<Events[]>(`/api/events?page=${page}&size=${size}&countryCode=${countryCode}`)
    }

    getLastPage(countryCode: string): Observable<number> {
        return this.http.get<number>(`/api/lastPage?countryCode=${countryCode}`)
    }

    getEventsBySearch(keyword: string, page: number, size: number): Observable<Events[]> {
        return this.http.get<Events[]>(`/api/search?page=${page}&size=${size}&keyword=${keyword}`)
    }
}