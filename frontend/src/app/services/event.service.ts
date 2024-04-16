import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { EventDetails, Events } from "../models";
import { environment } from "../../environments/environment";

const URL = environment.url

@Injectable()
export class EventService {

    private http = inject(HttpClient)

    getAllEvents(page: number, size: number): Observable<Events[]> {
        return this.http.get<Events[]>(`${URL}/api/events?page=${page}&size=${size}`)
    }

    getEventsByCountry(countryCode: string, page: number, size: number): Observable<Events[]> {
        return this.http.get<Events[]>(`${URL}/api/events?page=${page}&size=${size}&countryCode=${countryCode}`)
    }

    getLastPage(countryCode: string): Observable<number> {
        return this.http.get<number>(`${URL}/api/lastPage?countryCode=${countryCode}`)
    }

    getEventsBySearch(keyword: string, page: number, size: number): Observable<Events[]> {
        return this.http.get<Events[]>(`${URL}/api/search?page=${page}&size=${size}&keyword=${keyword}`)
    }

    getEventDetails(id: string): Observable<EventDetails[]> {
        return this.http.get<EventDetails[]>(`${URL}/api/events/${id}`)
    }

    getMapUrl(name: string, address: string): Observable<string> {
        return this.http.get(`${URL}/api/url?name=${name}&address=${address}`, { responseType: 'text' })
    }

    getGoogleAuthUrl(): Observable<any> {
        return this.http.get<any>(`${URL}/api/auth`)
    }

    addCalendarEvent(title: string, startDate: string): Observable<string> {
        const params = { title, startDate} // Object containing title and startDate
        return this.http.post<string>(`${URL}/api/calendar/event`, params)
    }

    // Method to check authorization status
    checkAuthorization(): Observable<boolean> {
        return this.http.get<boolean>(`${URL}/api/oauth2/verify`)
    }


}