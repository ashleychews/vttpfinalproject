import { Component, OnInit, inject } from '@angular/core';
import { ChatGroup, EventDetails } from '../../models';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { UserStore } from '../../services/user.store';

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.component.html',
  styleUrl: './chat-group.component.css'
})
export class ChatGroupComponent implements OnInit {

  groups$!: Observable<ChatGroup[]>
  imageURLs: { [key: string]: string } = {}
  eventDetails: { [key: string]: EventDetails } = {}
  email!: string

  private chatSvc = inject(ChatService)
  private userSvc = inject(UserService)
  private eventSvc = inject(EventService)
  private userStore = inject(UserStore)
  private router = inject(Router)

  ngOnInit(): void {
    this.loadAllGroups()

    // Subscribe to getEmail once and store the email value
    this.userStore.getEmail.subscribe({
      next: (email: string) => {
        this.email = email
        console.log('Email:', email)
      },
      error: (error: any) => {
        console.error('Error retrieving email:', error)
      }
    })
  }

  loadAllGroups(): void {
    this.groups$ = this.chatSvc.getAllGroups()

    this.groups$
      .subscribe(groups => {
        groups.forEach(group => {
          this.getImage(group.pictureId)
          this.getEventDetails(group.eventId)
        })
      })
  }

  getImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
        if (response.body) {
          const reader = new FileReader()
          reader.onload = () => {
            this.imageURLs[id] = reader.result as string;
          }
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

  getEventDetails(eventId: string): void {
    this.eventSvc.getEventDetails(eventId).subscribe(
      (data: EventDetails[]) => {
        if (data && data.length > 0) {
          // Assuming event details array has only one item for simplicity
          this.eventDetails[eventId] = data[0];
        } else {
          console.error('Error: No event details found');
        }
      },
      error => {
        console.error('Error fetching event details:', error);
      }
    )
  }

  joinGroup(groupId: string, eventId: string) {
    console.log('Joining group with ID:', groupId)
    if (!this.email) {
      console.error('Email is not available.')
      return;
    }

    this.chatSvc.joinGroup(groupId, this.email).subscribe(() => {
      // Route to chat component after joining, passing both event ID and group ID
      this.router.navigate(['/chat', eventId, groupId])
    })
  }
}
