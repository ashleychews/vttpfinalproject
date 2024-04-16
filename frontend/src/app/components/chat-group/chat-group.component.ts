import { Component, OnInit, inject } from '@angular/core';
import { ChatGroup, EventDetails } from '../../models';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { HttpResponse } from '@angular/common/http';
import { Observable, debounceTime, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { UserStore } from '../../services/user.store';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  searchForm!: FormGroup
  searchTerm: string = ''
  private fb = inject(FormBuilder)

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


    this.searchForm = this.fb.group({
      keyword: this.fb.control<string>('')
    })

    // Subscribe to search input changes for live filtering
    this.searchForm.get('keyword')?.valueChanges
      .pipe(
        startWith(''), // Emit an initial value to trigger filtering
        debounceTime(300), // Wait for 300ms after each keystroke
        distinctUntilChanged() // Filter out repeated consecutive values
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm.toLowerCase()
        this.applyFilter()
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
          this.eventDetails[eventId] = data[0]
          this.filterGroupsByEventDate()
        } else {
          console.error('Error: No event details found')
        }
      },
      error => {
        console.error('Error fetching event details:', error)
      }
    )
  }

  joinGroup(groupId: string, eventId: string) {
    console.log('Joining group with ID:', groupId)
    if (!this.email) {
      console.error('Email is not available.')
      return
    }

    this.chatSvc.joinGroup(groupId, this.email).subscribe(() => {
      // Route to chat component after joining, passing both event ID and group ID
      this.router.navigate(['/chat', eventId, groupId])
    })
  }

  filterGroupsByEventDate(): void {
    const todayDate = new Date() // Get today's date
    this.groups$ = this.groups$.pipe(
      map(groups =>
        groups.filter(group => {
          const eventDate = new Date(this.eventDetails[group.eventId].localDate)
          return eventDate > todayDate // Filter groups where event date is after today
        })
      )
    )
  }

  applyFilter(): void {
    this.groups$ = this.chatSvc.getAllGroups().pipe(
      map(groups =>
        groups.filter(group =>
          group.groupName.toLowerCase().includes(this.searchTerm)
        )
      )
    )
  }

  selectionFilter(selectedFilter: string) {
    this.groups$ = this.chatSvc.getAllGroups().pipe(
      map(groups => {
        if (!selectedFilter) {
          return groups // No filter selected, return original groups
        }
        switch (selectedFilter) {
          case 'userCount':
            return groups.slice().sort((a, b) => b.userCount - a.userCount)
          case 'creationDate':
            return groups.slice().sort((a, b) => {
              const dateA = new Date(a.timestamp).getTime();
              const dateB = new Date(b.timestamp).getTime();
              return dateB - dateA //descending order
            })
          case 'eventDate':
            return groups.slice().sort((a, b) => {
              const dateA = new Date(this.eventDetails[a.eventId].localDate).getTime();
              const dateB = new Date(this.eventDetails[b.eventId].localDate).getTime();
              return dateA - dateB //ascending order
            })
          default:
            return groups
        }
      }),
    )
  }

}
