import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ElementRef, Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ChatGroup, ChatMessage } from "../models";

@Injectable()
export class ChatService {

    private http = inject(HttpClient)


    getMessagesByGroupId(groupId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`api/chat/${groupId}/messages`)
    }

    createChatGroup(chatgroup: ChatGroup): Observable<ChatGroup> {
        return this.http.post<ChatGroup>(`api/chat/group`, chatgroup)
    }

    getChatGroups(eventId: string): Observable<ChatGroup[]> {
        return this.http.get<ChatGroup[]>(`api/group/${eventId}`)
    }

    joinGroup(groupId: string, email: string): Observable<void> {
        return this.http.post<void>(`api/group/join/${groupId}`, { email })
    }

    leaveChatGroup(groupId: string, email: string): Observable<void> {
        // Create an object containing the email to send in the request body
        const requestBody = { email: email }

        // Send the request with the email in the request body
        return this.http.delete<void>(`api/chat/group/${groupId}`, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json', // Specify JSON content type
            }),
            body: requestBody // Send the email in the request body
        })
    }

    getNumberOfMessagesInGroup(groupId: string): Observable<number> {
        return this.http.get<number>(`api/group/${groupId}/message/count`);
    }

    getGroupByGroupId(groupId: string): Observable<ChatGroup> {
        return this.http.get<ChatGroup>(`api/chat/group/${groupId}`);
    }

    updateChatGroup(groupId: string, updatedGroup: ChatGroup, elemRef: ElementRef): Observable<ChatGroup> {

        //to create multipart
        const data = new FormData()
        data.set("groupName", updatedGroup.groupName)
        data.set("image", elemRef.nativeElement.files[0])
        return this.http.put<ChatGroup>(`api/chat/group/${groupId}`, data);
    }


    getGroupsJoinedByCurrentUser(email: string): Observable<ChatGroup[]> {
        return this.http.post<ChatGroup[]>(`/api/groups/joined`, { email })
    }

    //get all groups
    getAllGroups(): Observable<ChatGroup[]> {
        return this.http.get<ChatGroup[]>(`api/allgroups`)
    }


}