import { Injectable } from "@angular/core";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";

@Injectable({
    providedIn: 'root'
})
export class UserWebSocketService {
    private stompClient!: Client
    private connected: boolean = false
    private chatRoomId: string = ''

    constructor() { }

    connectToSingleUserChat(
        chatRoomId: string,
        onMessageCallback: (message: Message) => void
    ) {
        if (this.connected) {
            console.log('Single User WebSocket already connected');
            return;
        }

        console.log('Connecting to Single User WebSocket');
        this.chatRoomId = chatRoomId;

        const websocketURL = `http://localhost:8080/single-chat`;
        const sockJS = new SockJS(websocketURL);

        this.stompClient = new Client({
            webSocketFactory: () => sockJS,
            debug: (msg: string) => console.log(msg)
        });

        this.stompClient.onConnect = () => {
            console.log('Single User WebSocket connected');

            const topic = `/topic/single-chat/${this.chatRoomId}`;
            this.stompClient.subscribe(topic, onMessageCallback);
        };

        this.stompClient.onDisconnect = () => {
            console.log('Single User WebSocket disconnected');
            this.connected = false;
            this.chatRoomId = '';
        };

        this.stompClient.activate();
        this.connected = true;
    }

    sendSingleUserMessage(content: string) {
        if (!this.connected) {
            console.error('Single User WebSocket not connected');
            return;
        }

        const topic = `/app/single-chat/${this.chatRoomId}`;

        const message = { content };
        this.stompClient.publish({ destination: topic, body: JSON.stringify(message) });
    }

    disconnect() {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.deactivate();
            this.connected = false;
            this.chatRoomId = '';
        }
    }
}
