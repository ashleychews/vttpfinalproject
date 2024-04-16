import { Component, OnInit, inject } from '@angular/core';
import { ChatGroup, EventDetails, Profile } from '../../models';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStore } from '../../services/user.store';
import { Observable, switchMap } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {

  eventId!: string
  eventDetails!: EventDetails[]
  mapUrl: SafeResourceUrl = ''
  private sanitizer = inject(DomSanitizer)

  private eventSvc = inject(EventService)
  private route = inject(ActivatedRoute)

  private ChatGroupSvc = inject(ChatService)
  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)

  createform!: FormGroup
  groups$!: Observable<ChatGroup[]>
  email!: string
  showCreateForm: boolean = false
  imageURLs: { [key: string]: string } = {}
  users: Profile[] = []

  authorized = false

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['id']
      this.getEventDetails()
    })

    console.log('Initializing Chat Group Component')

    this.createform = this.createGroup()

    this.loadChatGroups()

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

  getEventDetails() {
    this.eventSvc.getEventDetails(this.eventId)
      .subscribe(data => {
        this.eventDetails = data;
        console.log(this.eventDetails)
        if (this.eventDetails.length > 0) {
          const venue = this.eventDetails[0].venue;
          this.getMapUrl(venue.name, venue.address)
        }
      })
  }

  getMapUrl(name: string, address: string) {
    this.eventSvc.getMapUrl(name, address)
      .subscribe((url: string) => {
        // Sanitize the URL before assigning it
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const amPm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amPm}`
  }

  loadChatGroups() {
    console.log('Loading chat groups...')
    this.groups$ = this.route.params.pipe(
      switchMap(params => this.ChatGroupSvc.getChatGroups(params['id']))
    )

    // Fetch images for each group
    this.groups$.subscribe(groups => {
      groups.forEach(group => {
        this.getImage(group.pictureId)
        this.fetchUsersForGroup(group) // Call fetchUsersForGroup for each group
      })
    })
  }

  createGroup(): FormGroup {
    //console.log('Creating group form')
    return this.fb.group({
      groupName: this.fb.control<string>('', [Validators.required, Validators.minLength(3)])
    })
  }

  createAndJoinGroup() {
    if (!this.email) {
      // Show an alert if email is not available
      this.show('Not logged in. Cannot create group')
      return // Exit the method if email is not available
    }

    console.log('creating and joining group')
    if (this.createform.valid) {
      const groupName = this.createform.value.groupName;
      const chatgroup: ChatGroup = {
        groupId: '',
        eventId: this.eventId,
        groupName: groupName,
        creator: this.email,
        users: [], // Initialize the users array with an empty array
        userCount: 0,
        timestamp: new Date(), // Set timestamp to current date and time
        pictureId: ''
      }
      this.ChatGroupSvc.createChatGroup(chatgroup).subscribe(createdGroup => {
        const groupId = createdGroup.groupId //get group id from backend
        const userCount = createdGroup.userCount //get userCount from backend
        const pictureId = createdGroup.pictureId //get picture id from backend
        console.log('group created:', groupId)
        console.log('user count', userCount)

        // Join the group
        this.joinGroup(groupId)
      })
    }
  }

  joinGroup(groupId: string) {
    console.log('Joining group with ID:', groupId)
    if (!this.email) {
      this.show('Please login to enter group')
      //console.error('Email is not available.')
      return
    }

    this.ChatGroupSvc.joinGroup(groupId, this.email).subscribe(() => {
      // Route to chat component after joining
      this.router.navigate(['/chat', this.eventId, groupId])
    })
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm
  }

  cancelCreateGroup() {
    this.showCreateForm = false
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

  sliceUsers(group: ChatGroup, profiles: Profile[]): Profile[] {
    const userEmails = group.users
    const slicedProfiles: Profile[] = []
    const maxUsers = 3

    for (let i = 0; i < userEmails.length && slicedProfiles.length < maxUsers; i++) {
      const userEmail = userEmails[i];
      const profile = profiles.find(p => p.email === userEmail)
      if (profile) {
        slicedProfiles.push(profile)
      }
    }

    //console.log('length', slicedProfiles.length)

    return slicedProfiles
  }

  sliceUsersForDisplay(group: ChatGroup, users: Profile[]): Profile[] {
    return this.sliceUsers(group, users)
  }

  // Check if there are more users than the displayed ones
  displayPlusOthers(group: ChatGroup, users: Profile[]): boolean {
    //console.log('group', group.userCount)
    return group.userCount > 3 && this.sliceUsers(group, users).length === 3;
  }

  authorizeGoogle(): void {
    this.eventSvc.getGoogleAuthUrl().subscribe(
      (response) => {
        console.log('Received authorization URL:', response.authorize);
        // Open the authorization URL in a new tab or window
        window.open(response.authorize)
        // Check authorization status after user attempts to authorize
        this.checkAuthorizationStatus()
      },
      (error) => {
        console.error('Error getting authorization URL:', error);
      }
    )
  }

  addEventToCalendar(title: string, startDate: string, startTime: string): void {

    if (!this.authorized) {
      console.error('User is not authorized')
      return
    }
    const fullStartDate = startDate + 'T' + startTime // Combine date and time
    this.eventSvc.addCalendarEvent(title, fullStartDate)
      .subscribe(response => {
        console.log('Response from backend:', response)
        this.show("successfully added event")
      }, error => {
        //console.error('Error:', error)
        this.show("error in adding event")
      })
  }

  checkAuthorizationStatus(): void {
    this.eventSvc.checkAuthorization().subscribe(
      (authorized: boolean) => {
        this.authorized = authorized
        console.log('Authorization status:', authorized)
        if (!authorized) {
          console.log('User not authorized')
        }
      },
      (error) => {
        console.error('Error checking authorization:', error)
      }
    )
  }

  show(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'center', // Center horizontally
      verticalPosition: 'top', // Align at the top
    })
  }


}
