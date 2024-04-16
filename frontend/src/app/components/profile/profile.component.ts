import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { UserStore } from '../../services/user.store';
import { UserService } from '../../services/user.service';
import { ChatGroup, Profile, UserMessages } from '../../models';
import { Observable, map, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  profile$!: Observable<Profile>
  profileForm!: FormGroup
  profile!: Profile
  imageURL: { [key: string]: string } = {}
  groupURL: { [key: string]: string } = {}
  groupsJoined$!: Observable<ChatGroup[]>

  isEditing = false

  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)
  private chatSvc = inject(ChatService)
  private router = inject(Router)
  
  private snackBar = inject(MatSnackBar)

  chatRoomIDs$!: Observable<string[]> // Observable to hold chat room IDs

  senderEmail!: string
  recipientProfiles: Profile[] = []

  chatRoomRecipientMap: { [key: string]: Profile } = {} // Mapping chat room ID to recipient profile
  lastMessagesMap: { [key: string]: UserMessages } = {} // Map to store last messages for each chat room ID

  //this is for the image
  @ViewChild('image')
  image!: ElementRef

  ngOnInit(): void {
    this.userStore.getEmail.subscribe(email => {
      this.userSvc.getProfile(email)
        .subscribe((profile) => {
          this.profile = profile
          console.log(profile.pictureId)
          this.getImage(profile.pictureId) // Fetch profile picture
          this.update(profile) // Initialize form with profile data
        },
          (error) => {
            console.error('Error fetching profile:', error)
          }
        )
    })

    // Load groups joined by the user
    this.userStore.getEmail.subscribe(email => {
      console.log('Fetching groups joined by user with email:', email)
      this.groupsJoined$ = this.chatSvc.getGroupsJoinedByCurrentUser(email)
      this.groupsJoined$.subscribe(groups => {
        //console.log('Groups joined by user:', groups)
        groups.forEach(group => {
          this.getGroupImage(group.pictureId) // Fetch group images for each group
        })
      })
    })

    // Fetch chat room IDs for the user
    this.userStore.getEmail.subscribe(email => this.senderEmail = email)
    this.chatRoomIDs$ = this.userSvc.getChatRoomIDsForUser(this.senderEmail)

    this.chatRoomIDs$.subscribe(ids => {
      ids.forEach(chatRoomId => {
        if (!this.chatRoomRecipientMap[chatRoomId]) {
          this.getLastMessage(chatRoomId)

          this.userSvc.getRecipientEmail(chatRoomId, this.senderEmail).subscribe(response => {
            const recipientEmail = response.recipientEmail // Extract the email value
            // Fetch recipient's profile based on their email
            this.userSvc.getProfile(recipientEmail).subscribe(recipientProfile => {
              const existingRecipient = this.recipientProfiles.find(profile => profile.email === recipientEmail)
              if (!existingRecipient) {
                this.recipientProfiles.push(recipientProfile)
              }
              this.chatRoomRecipientMap[chatRoomId] = recipientProfile
              this.getImage(recipientProfile.pictureId)
            })
          })
        }
      })
    })
  }


  update(profile: Profile): void {
    this.profileForm = this.fb.group({
      email: [{ value: profile.email, disabled: true }],
      userName: this.fb.control<string>(profile.userName, [Validators.required, Validators.minLength(3)]),
      firstName: this.fb.control<string>(profile.firstName, [Validators.required]),
      lastName: this.fb.control<string>(profile.lastName, [Validators.required]),
      birthDate: this.fb.control<string>(profile.birthDate, [Validators.required]),
      phoneNo: this.fb.control<string>(profile.phoneNo, [Validators.required]),
      image: [''],
      joinedDate: [profile.joinedDate],
      country: [profile.country]
    })
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedProfile: Profile = this.profileForm.value
      updatedProfile.email = this.profile.email
      console.log('Submitting form with updated profile:', updatedProfile)
      this.userSvc.updateProfile(updatedProfile, this.image)
        .subscribe(response => {

          // Update sender image ID in chat message mongo if the profile image is update
          this.chatSvc.updateSenderImgId(updatedProfile.email, response.pictureId).subscribe(() => {
            //console.log('Sender image ID updated successfully')
          }, error => {
            //console.error('Error updating sender image ID:', error)
          })

          this.show('Profile updated successfully')//show success msg

          this.isEditing = false
          updatedProfile.pictureId = response.pictureId // Update pictureId with the new value
          this.getImage(updatedProfile.pictureId) // Fetch updated image
          // Reload profile data after successful update
          this.userSvc.getProfile(updatedProfile.email)
            .subscribe((profile) => {
              this.profile = profile
              this.update(profile)
            })
        }, (error) => {
          this.show('Error updating profile' + error) //show error msg
        })
    }
  }

  toggleEditing(): void {
    this.isEditing = !this.isEditing;
    // Set form values to profile data
    if (!this.isEditing && this.profile) {
      this.profileForm.patchValue(this.profile)
    }
  }

  //get user image
  getImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
        if (response.body) {
          const reader = new FileReader()
          reader.onload = () => {
            this.imageURL[id] = reader.result as string
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

  //get group image 
  getGroupImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
        if (response.body) {
          const reader = new FileReader()
          reader.onload = () => {
            this.groupURL[id] = reader.result as string
          }
          reader.readAsDataURL(response.body)
        } else {
          console.error('Error: Response body is null')
        }
      },
        (error) => {
          console.error('Error fetching group image:', error)
        }
      )
  }

  // get recipient profile based on chat room ID
  getRecipientProfile(chatRoomId: string): Profile {
    return this.chatRoomRecipientMap[chatRoomId]
  }

  // Get the last message for a chat room
  getLastMessage(chatRoomId: string): void {
    this.userSvc.getLastMessageByChatRoomId(chatRoomId).subscribe(lastMessage => {
      //console.log('Last Message:', lastMessage)
      this.lastMessagesMap[chatRoomId] = lastMessage // Store the last message in the map
    })
  }

  navigateToChatRoom(chatRoomId: string, recipientEmail: string) {
    this.userSvc.setRecipientEmail(recipientEmail)
    this.router.navigate(['/single-chat', chatRoomId])
  }

  show(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'center', // Center horizontally
      verticalPosition: 'top', // Align at the top
    })
  }
  

}