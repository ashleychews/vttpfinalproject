import { Injectable } from "@angular/core";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private connected: boolean = false;

  constructor() { }

  connectToChat(eventId: string, groupId: string, onMessageCallback: (message: Message) => void) {
    if (this.connected) {
      console.log('WebSocket already connected')
    }

    console.log('Connecting to WebSocket')

    const websocketURL = `http://localhost:8080/chat`
    const sockJS = new SockJS(websocketURL)

    this.stompClient = new Client({
      webSocketFactory: () => sockJS,
      debug: (msg: string) => console.log(msg)
    })

    this.stompClient.onConnect = () => {
      console.log('WebSocket connected')
      const topic = `/topic/chat/${eventId}/${groupId}`
      this.stompClient.subscribe(topic, onMessageCallback)
    }

    this.stompClient.onDisconnect = () => {
      console.log('WebSocket disconnected')
      this.connected = false;
    }

    this.stompClient.activate()
    this.connected = true
  }

  sendMessage(eventId: string, groupId: string, content: string) {
    const topic = `/app/chat/${eventId}/${groupId}`
    const message = { content }
    this.stompClient.publish({ destination: topic, body: JSON.stringify(message) })
  }

  disconnect() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate()
      this.connected = false
    }
  }
} 