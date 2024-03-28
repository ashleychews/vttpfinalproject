import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { ChatMessage, Profile } from '../../models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../services/user.store';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy{

  private messageSub!: Subscription

  eventId: string = ''
  groupId: string = ''
  message: string = ''
  username: string = ''
  messages: ChatMessage[] = []
  messageForm!: FormGroup

  private route = inject(ActivatedRoute)
  private webSocketSvc = inject(WebSocketService)
  private fb = inject(FormBuilder)
  private chatSvc = inject(ChatService)
  private userStore = inject(UserStore)
  private userSvc = inject(UserService)

  ngOnInit(): void {

    this.route.params.subscribe(params => {
    this.eventId = params['eventId']
    this.groupId = params['groupId']
    })

    console.log(this.eventId)

    this.userStore.getEmail.subscribe(email => {
      this.userSvc.getProfile(email)
      .subscribe((profile: Profile) => {
          this.username = profile.userName;
        })
      })

    this.initForm() // Initialize the form
    this.loadMessages()
    this.webSocketSvc.connectToChat(this.eventId, this.groupId, this.onMessageReceived.bind(this))
    
  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe()
    }
    this.webSocketSvc.disconnect()
  }

  sendMessage(): void {
    const messageContent = this.messageForm.get('message')?.value // Get the message content from the form
    console.log("contents", messageContent)
    if (messageContent.trim() !== '') {
        const message: ChatMessage = {
          sender: this.username,
          content: messageContent,
          timestamp: new Date()
      }
      this.webSocketSvc.sendMessage(this.eventId, this.groupId, JSON.stringify(message));
      this.messageForm.reset() // Reset the form after sending the message
    }
  }

  private onMessageReceived(message: Message): void {
    const messageContent: ChatMessage = JSON.parse(message.body);
    const formattedMessage = {
      sender: messageContent.sender,
      content: messageContent.content,
      timestamp: messageContent.timestamp
    };
    this.messages.push(formattedMessage);
  }
  
   
  private initForm(): void {
    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required]) // Define a form control for the message input
    })
  }

  private loadMessages(): void {
    this.chatSvc.getMessagesByGroupId(this.groupId).subscribe(messages => {
      this.messages = messages
    })
  }
}