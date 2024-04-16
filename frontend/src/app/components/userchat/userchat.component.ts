import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserWebSocketService } from '../../services/user-web-socket.service';
import { Message } from '@stomp/stompjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile, UserMessages } from '../../models';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../services/user.store';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-userchat',
  templateUrl: './userchat.component.html',
  styleUrl: './userchat.component.css'
})
export class UserchatComponent implements OnInit, AfterViewInit {


  senderId: string = '';
  recipientId: string = '';
  messageText: string = '';
  messageSub!: Subscription;
  messages: UserMessages[] = []

  senderEmail: string = ''
  recipientEmail: string = ''

  messageForm!: FormGroup

  private route = inject(ActivatedRoute)
  private userWebSocketSvc = inject(UserWebSocketService)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)
  private userStore = inject(UserStore)

  id: string = ''
  senderProfile!: Profile
  recipientProfile!: Profile

  disabled: boolean = false

  groupedMessages: { [date: string]: UserMessages[] } = {}
  imageURLs: { [id: string]: string } = {}

  chatRoomIDs: string[] = []
  selectedChatRoomId!: string

  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id']
      console.log('Received chatRoomId:', this.id)
    })

    this.initForm() // Initialize the form

    this.connectToWebSocket()

    // Get the user's email from the store
    this.userStore.getEmail.subscribe(email => {
      this.senderEmail = email
      // Fetch sender's and recipient's profiles based on their emails
      this.userSvc.getProfile(this.senderEmail).subscribe(profile => {
        // Handle sender profile data
        this.senderProfile = profile
        this.getImage(this.senderProfile.pictureId) // Fetch sender's image
        console.log('Sender Profile:', this.senderProfile)
      })
    })

    // Get recipient's email from service
    this.userSvc.recipientEmail$.subscribe(recipientEmail => {
      this.recipientEmail = recipientEmail
      console.log('Recipient Email:', this.recipientEmail)

      // Fetch recipient's profile based on their email
      this.userSvc.getProfile(this.recipientEmail).subscribe(recipientProfile => {
        // Handle recipient profile data
        this.recipientProfile = recipientProfile
        this.getImage(this.recipientProfile.pictureId) // Fetch recipient's image
        console.log('Recipient Profile:', this.recipientProfile)
        this.loadMessages(this.id)
      })
    })


  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe()
    }
    this.userWebSocketSvc.disconnect()
  }

  connectToWebSocket(): void {
    this.userWebSocketSvc.connectToSingleUserChat(
      this.id,
      this.onMessageReceived.bind(this)
    )
  }

  onMessageReceived(message: Message): void {
    const newMessage: UserMessages = JSON.parse(message.body)
    const formattedMessage = {
      id: newMessage.id,
      senderEmail: newMessage.senderEmail,
      recipientEmail: newMessage.recipientEmail,
      content: newMessage.content,
      timestamp: newMessage.timestamp
    }
    this.messages.push(formattedMessage)
    this.groupedMessages = this.groupMessagesByDate(this.messages)

    setTimeout(() => {
      this.scrollToBottom()
    }, 100)

  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const messageContent = this.messageForm.get('message')?.value; // Get message content from form

      if (messageContent.trim() !== '') {

        // Create a UserMessages object and push it to the messages array
        const newMessage: UserMessages = {
          id: this.id,
          content: messageContent,
          senderEmail: this.senderEmail,
          recipientEmail: this.recipientEmail,
          timestamp: new Date(),
        }
        // this.messages.push(newMessage)
        // this.groupedMessages = this.groupMessagesByDate(this.messages) // Update groupedMessages
        this.userWebSocketSvc.sendSingleUserMessage(JSON.stringify(newMessage))
        this.messageForm.reset()
        console.log('Messages Array:', this.messages)
      }
    }
  }

  initForm() {
    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required]) // Define a form control for the message input
    })
  }

  // Update this method to listen for form changes
  onFormChanges() {
    this.messageForm.valueChanges.subscribe(() => {
      this.disabled = this.messageForm.invalid
    })
  }

  loadMessages(chatRoomId: string) {
    this.userSvc.getMessagesByChatRoomId(chatRoomId).subscribe(
      (messages: UserMessages[]) => {
        this.messages = messages
        this.groupedMessages = this.groupMessagesByDate(messages) // Group messages
        console.log('Loaded messages:', this.messages)
        // After updating the messages and view, scroll to bottom
        setTimeout(() => {
          this.scrollToBottom();
        }, 100); // Adjust the delay as needed
      },
      (error) => {
        console.error('Error loading messages:', error)
      }
    )
  }

  isSender(senderEmail: string): boolean {
    return senderEmail === this.senderEmail
  }

  groupMessagesByDate(messages: UserMessages[]): { [date: string]: UserMessages[] } {
    const grouped: { [date: string]: UserMessages[] } = {}

    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toLocaleDateString('en-US')
      if (!grouped[dateKey]) {
        grouped[dateKey] = [message]
      } else {
        grouped[dateKey].push(message)
      }
    })

    return grouped
  }

  groupedMessagesKeys(): string[] {
    return Object.keys(this.groupedMessages)
  }

  getImage(id: string): void {
    const sub = this.userSvc.getImage(id)
      .subscribe(
        (response: HttpResponse<Blob>) => {
          if (response.body) {
            const reader = new FileReader();
            reader.onload = () => {
              const imageURL = reader.result as string
              this.imageURLs[id] = imageURL; // Store image URL
            };
            reader.readAsDataURL(response.body)
          } else {
            console.error('Error: Response body is null')
          }
        },
        (error) => {
          console.error('Error fetching image:', error)
        }
      )
  }

  scrollToBottom() {
    console.log('Scrolling to bottom'); // Log scroll action
    try {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const container = this.scrollContainer.nativeElement
        container.scrollTop = container.scrollHeight
        console.log('Container Scrolled Successfully')
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err)
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }


}
