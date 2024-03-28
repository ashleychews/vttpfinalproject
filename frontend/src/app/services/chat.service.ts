import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ChatGroup, ChatMessage } from "../models";

@Injectable()
export class ChatService {

    private http = inject(HttpClient)


    getMessagesByGroupId(groupId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`api/chat/${groupId}/messages`)
    }


    createChatGroup(chatgroup: ChatGroup): Observable<ChatGroup> {
        return this.http.post<ChatGroup>(`api/chat/group`, chatgroup);
    }
      
    getChatGroups(eventId: string): Observable<ChatGroup[]> {
        return this.http.get<ChatGroup[]>(`api/group/${eventId}`);
    }

    joinGroup(groupId: string, email: string): Observable<void> {
        return this.http.post<void>(`api/group/join/${groupId}`, { email });
    }
      

}