import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { ChatGroup, ChatMessage, MessageGroup, Profile } from '../../models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../services/user.store';
import { HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {

  private messageSub!: Subscription

  eventId: string = ''
  groupId: string = ''
  message: string = ''
  username: string = ''
  pictureId: string = ''
  messages: ChatMessage[] = []
  messageForm!: FormGroup
  numberOfMessages: number = 0
  messageGroups: MessageGroup[] = []
  group!: ChatGroup
  groupForm!: FormGroup
  creatorEmail: string = ''

  disabled: boolean = false
  showEditModal: boolean = false

  private route = inject(ActivatedRoute)
  private webSocketSvc = inject(WebSocketService)
  private fb = inject(FormBuilder)
  private chatSvc = inject(ChatService)
  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private router = inject(Router)

  imageURLs: { [key: string]: string } = {} //profile image
  users: Profile[] = []
  profileVisibility: { [key: string]: boolean } = {}

  senderEmail!: string

  //this is for the image
  @ViewChild('image')
  image!: ElementRef

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.eventId = params['eventId']
      this.groupId = params['groupId']
    })

    this.loadNumberOfMessages()

    console.log(this.eventId)

    this.userStore.getEmail.subscribe(email => {
      this.userSvc.getProfile(email)
        .subscribe((profile: Profile) => {
          this.username = profile.userName
          this.pictureId = profile.pictureId
        })
    })

    this.initForm() // Initialize the form
    this.loadMessages()
    this.webSocketSvc.connectToChat(this.eventId, this.groupId, this.onMessageReceived.bind(this))

    // Fetch group details by ID
    this.fetchGroupDetails()

    // Fetch users and initialize profile visibility state
    this.users.forEach(user => {
      this.profileVisibility[user.email] = false; // Initialize all profiles as hidden
    })
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
        senderImgId: this.pictureId,
        content: messageContent,
        timestamp: new Date()
      }
      // Add the sent message to the messages array
      this.messages.push(message)
      // Update messageGroups with the new message
      this.messageGroups = this.groupMessagesByDate(this.messages)
      // Update the total number of message
      this.numberOfMessages++
      this.webSocketSvc.sendMessage(this.eventId, this.groupId, JSON.stringify(message))
      this.messageForm.reset() // Reset the form after sending the message
    }
  }

  onMessageReceived(message: Message): void {
    const messageContent: ChatMessage = JSON.parse(message.body)
    const formattedMessage = {
      sender: messageContent.sender,
      senderImgId: messageContent.senderImgId,
      content: messageContent.content,
      timestamp: messageContent.timestamp
    }
    this.messages.push(formattedMessage)
  }

  initForm() {
    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required]) // Define a form control for the message input
    })
  }

  //fetch messages from mongo
  loadMessages() {
    this.chatSvc.getMessagesByGroupId(this.groupId).subscribe(messages => {
      this.messages = messages
      console.log('Loaded messages:', messages);
      // Group messages by date
      this.messageGroups = this.groupMessagesByDate(messages);
      this.fetchProfileImagesForSenders() // call the profile after message is loaded
    })
  }

  loadNumberOfMessages(): void {
    this.chatSvc.getNumberOfMessagesInGroup(this.groupId)
      .subscribe(count => {
        this.numberOfMessages = count
      })
  }

  fetchProfileImagesForSenders() {
    // Fetch profile images only if messages are available
    if (this.messages.length > 0) {
      this.messages.forEach(message => {
        this.getImage(message.senderImgId)
      })
    }
  }

  getImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
        if (response.body) {
          const reader = new FileReader()
          reader.onload = () => {
            const imageURL = reader.result as string
            this.imageURLs[id] = imageURL // store image url
          }
          reader.readAsDataURL(response.body)
        } else {
          console.error('Error: Response body is null')
        }
      },
        (error) => {
          console.error('Error fetching image:', error)
        })
  }

  // Method to group messages by date
  groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
    const groups: MessageGroup[] = []
    let currentDate: string = ''
    let currentGroup: MessageGroup | null = null
    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Group messages by date
    messages.forEach(message => {
      const messageDate: string = new Date(message.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      })

      if (messageDate !== currentDate) {
        // If the date changes, create a new group
        currentGroup = {
          date: messageDate,
          messages: [message]
        }
        groups.push(currentGroup)
        currentDate = messageDate
      } else {
        // If the date is the same, add the message to the current group
        currentGroup?.messages.push(message)
      }
    })

    return groups
  }

  // Update this method to listen for form changes
  onFormChanges() {
    this.messageForm.valueChanges.subscribe(() => {
      this.disabled = this.messageForm.invalid
    })
  }

  // Method to navigate back to group/:eventId route
  goBackToGroup() {
    const eventId = this.route.snapshot.paramMap.get('eventId')
    this.router.navigate(['/event-details', eventId])
  }

  // Fetch group details by ID
  fetchGroupDetails() {
    this.chatSvc.getGroupByGroupId(this.groupId)
      .subscribe((group: ChatGroup) => {
        console.log('Received group:', group)
        this.group = group;
        console.log('Assigned group:', this.group)
        this.getImage(group.pictureId)

        // Once the group is fetched, fetch the users
        this.fetchUsersForGroup(group)

        // Update the creator's email
        this.creatorEmail = group.creator;
      })
  }

  fetchUsersForGroup(group: ChatGroup) {
    group.users.forEach((userEmail: string) => {
      this.userSvc.getProfile(userEmail)
        .subscribe((profile: Profile) => {
          console.log('received profile:', profile)
          // Preload profile picture for the user
          this.getImage(profile.pictureId)
          this.users.push(profile)
        })
    })
  }

  update() {
    this.groupForm = this.fb.group({
      groupName: this.fb.control<string>(this.group.groupName, [Validators.required]),
      image: ['']
    })
  }

  openEditGroupModal() {
    this.showEditModal = true
    this.update()
  }

  closeEditGroupModal() {
    this.showEditModal = false
  }

  // Function to toggle the visibility of the edit modal
  toggleEditing() {
    this.showEditModal = !this.showEditModal
  }

  onSubmit() {
    if (this.groupForm.valid) {
      const updatedGroup: ChatGroup = this.groupForm.value;
      // Send the updated group info and image to the service method for updating
      this.chatSvc.updateChatGroup(this.groupId, updatedGroup, this.image)
        .subscribe(response => {
          // Handle success
          console.log('Group updated successfully', response)
          // Update group details in the UI
          this.group.groupName = response.groupName
          this.group.pictureId = response.pictureId
          this.closeEditGroupModal()
        }, (error) => {
          // Handle error
          console.error('Error updating group:', error)
        })
    }
  }

  leaveGroup(){
    // Get the user's email from the store
    this.userStore.getEmail.subscribe(email => {
      // Call the service method to leave the group
      this.chatSvc.leaveChatGroup(this.groupId, email)
        .subscribe(response => {
          console.log(response)
          const eventId = this.route.snapshot.paramMap.get('eventId')
          this.router.navigate(['/event-details', eventId])
        }, error => {
          console.error(error) // Handle error
        })
    })
  }

  toggleUserProfile(email: string): void {
    this.profileVisibility[email] = !this.profileVisibility[email]
  }

  MessageUser(recipientEmail: string) {
    // Get the user's email from the store
    this.userStore.getEmail.subscribe(email => this.senderEmail = email)

    console.log('messaging', recipientEmail)
    this.userSvc.setRecipientEmail(recipientEmail);

    this.userSvc.checkChatRoom(this.senderEmail, recipientEmail).subscribe(
      (response: any) => {
        const chatRoomId: string = response.chatRoomId;
    
        if (chatRoomId !== "0") {
          console.log('Chat room already exists with ID:', chatRoomId);
          this.router.navigate(['/single-chat', chatRoomId]);
        } else {
          const chatRoomId = uuidv4().substring(0,6)
          console.log('Generated chatRoomId:', chatRoomId)
          this.router.navigate(['/single-chat', chatRoomId ])
        }
      },
      error => {
        console.error('Error checking chat room:', error)
      }
    )
  }
  

}