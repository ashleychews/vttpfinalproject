import { HttpClient, HttpResponse } from "@angular/common/http";
import { ElementRef, Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { Profile, User, UserMessages } from "../models";

@Injectable()
export class UserService {

    private http = inject(HttpClient)

    register(userData: User): Promise<any> {
        return firstValueFrom(this.http.post<User>(`/api/register`, userData))
    }

    login(userData: User): Promise<any> {
        return firstValueFrom(this.http.post<User>(`/api/login`, userData))
            .then(response => {
                return response
            })
    }

    createProfile(userProfile: Profile): Promise<any> {
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
        data.set("joinedDate", updatedProfile.joinedDate)
        data.set("country", updatedProfile.country)
        data.set("image", elemRef.nativeElement.files[0])

        console.info("Updating profile:", data)

        return this.http.put<any>(`/api/profile`, data)
    }

    getImage(id: string): Observable<HttpResponse<Blob>> {
        const url = `/api/image/${id}`

        // Set response type to 'blob' to receive binary data
        return this.http.get(url, { observe: 'response', responseType: 'blob' })
    }

    // Send the email data to check if a chat room exists
    checkChatRoom(senderEmail: string, recipientEmail: string): Observable<string | null> {
        const body = { senderEmail, recipientEmail }
        return this.http.post<string | null>(`/api/chat/check`, body)
    }

    private recipientEmailSubject: BehaviorSubject<string> = new BehaviorSubject<string>('')
    recipientEmail$: Observable<string> = this.recipientEmailSubject.asObservable()

    setRecipientEmail(email: string): void {
        this.recipientEmailSubject.next(email)
    }

    getMessagesByChatRoomId(chatRoomId: string): Observable<UserMessages[]> {
        return this.http.get<UserMessages[]>(`api/chat/${chatRoomId}`)
    }

    getChatRoomIDsForUser(senderEmail: string): Observable<string[]> {
        return this.http.post<string[]>(`/api/chat/user/roomids`, { senderEmail })
    }

    getRecipientEmail(chatRoomId: string): Observable<{ recipientEmail: string }> {
        return this.http.get<{ recipientEmail: string }>(`/api/chat/recipientemail/${chatRoomId}`);
    }

}