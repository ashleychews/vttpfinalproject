import { Component, OnInit, inject } from '@angular/core';
import { ChatGroup } from '../../models';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStore } from '../../services/user.store';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.component.html',
  styleUrl: './chat-group.component.css'
})
export class ChatGroupComponent implements OnInit {

  private ChatGroupSvc = inject(ChatService)
  private route = inject(ActivatedRoute)
  private userStore = inject(UserStore)
  private fb = inject(FormBuilder)
  private router = inject(Router)

  createform!: FormGroup
  eventId!: string;
  groups$!: Observable<ChatGroup[]>
  email!: string
  showCreateForm: boolean = false

  ngOnInit(): void {
    console.log('Initializing Chat Group Component')

    this.createform = this.createGroup()

    this.route.params.subscribe(params => {
      this.eventId = params['eventId']
      console.log('Event ID:', this.eventId)
    })

    this.loadChatGroups()

    // Subscribe to getEmail once and store the email value
    this.userStore.getEmail.subscribe({
      next: (email: string) => {
        this.email = email;
        console.log('Email:', email)
      },
      error: (error: any) => {
        console.error('Error retrieving email:', error)
      }
    })
  }

  loadChatGroups() {
    console.log('Loading chat groups...');
    this.groups$ = this.route.params.pipe(
      switchMap(params => this.ChatGroupSvc.getChatGroups(params['eventId']))
    )
  }

  createGroup(): FormGroup {
    console.log('Creating group form')
    return this.fb.group({
      groupName: this.fb.control<string>('', [Validators.required, Validators.minLength(3)])
    })
  }

  createAndJoinGroup() {
    console.log('creating and joining group')
    if (this.createform.valid) {
      const groupName = this.createform.value.groupName;
      const chatgroup: ChatGroup = {
        groupId: '',
        eventId: this.eventId,
        groupName: groupName,
        creator: this.email,
        users: [], // Initialize the users array with an empty array
        messageCount: 0,
        userCount: 0,
        timestamp: new Date() // Set timestamp to current date and time
      };
      this.ChatGroupSvc.createChatGroup(chatgroup).subscribe(createdGroup => {
        const groupId = createdGroup.groupId //get group id from backend
        const userCount = createdGroup.userCount //get userCount from backend
        console.log('group created:', groupId)
        console.log('user count', userCount)
    
        // Join the group
        this.joinGroup(groupId);
      })
    }
  }

  joinGroup(groupId: string) {
    console.log('Joining group with ID:', groupId)
    if (!this.email) {
      console.error('Email is not available.')
      return
    }

    this.ChatGroupSvc.joinGroup(groupId, this.email).subscribe(() => {
      // Route to chat component after joining
      this.router.navigate(['/chat', this.eventId, groupId])
    })
  }

  toggleCreateForm(){
    this.showCreateForm = !this.showCreateForm
  }


}
