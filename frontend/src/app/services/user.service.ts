import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, firstValueFrom } from "rxjs";
import { Profile, User } from "../models";

@Injectable()
export class UserService {

    private loggedIn: boolean = false

    isLoggedIn(): boolean {
        return this.loggedIn
    }

    private http = inject(HttpClient)

    register(userData: User): Promise<any> {
        return firstValueFrom(this.http.post<User>(`/api/register`, userData))
    }

    login(userData: User): Promise<any> {
        return firstValueFrom(this.http.post<User>(`/api/login`, userData))
            .then(response => {
            this.loggedIn = true // Update the authentication state to true
            return response;
        });
    }

    logout(): void {
        this.loggedIn = false
    }

    createProfile(userProfile: Profile): Promise<any> {
        return firstValueFrom(this.http.post<Profile>(`/api/user/createprofile`, userProfile))
    }

    getProfile(email: string): Observable<Profile> {
        return this.http.post<Profile>('/api/profile', { email });
    }

    updateProfile(updatedProfile: Profile): Observable<any> {
        return this.http.put(`/api/profile`, updatedProfile);
      }

}