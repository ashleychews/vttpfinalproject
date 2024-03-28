import { HttpClient, HttpResponse } from "@angular/common/http";
import { ElementRef, Injectable, inject } from "@angular/core";
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

    createProfile(userProfile: Profile) : Promise<any> {
        return firstValueFrom(this.http.post<Profile>(`/api/user/createprofile`, userProfile))
    }

    getProfile(email: string): Observable<Profile> {
        return this.http.post<Profile>('/api/profile', { email })
    }

    updateProfile(updatedProfile: Profile, elemRef: ElementRef): Observable<any> {
        console.info("files", elemRef.nativeElement.files)
        //to create multipart
        const data = new FormData()

        data.set("email", updatedProfile.email)
        data.set("userName", updatedProfile.userName)
        data.set("firstName", updatedProfile.firstName)
        data.set("lastName", updatedProfile.lastName)
        data.set("birthDate", updatedProfile.birthDate)
        data.set("phoneNo", updatedProfile.phoneNo)
        data.set("image", elemRef.nativeElement.files[0])

        console.info("Updating profile:", data)

        return this.http.put<any>(`/api/profile`, data)
    }

    getImage(id: string): Observable<HttpResponse<Blob>> {
        this.loggedIn = true // Update the authentication state to true
        const url = `/api/image/${id}`
    
        // Set response type to 'blob' to receive binary data
        return this.http.get(url, { observe: 'response', responseType: 'blob' })
    }

}