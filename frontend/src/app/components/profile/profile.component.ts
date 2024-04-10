import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { UserStore } from '../../services/user.store';
import { UserService } from '../../services/user.service';
import { ChatGroup, Profile } from '../../models';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  profile$!: Observable<Profile>
  profileForm!: FormGroup
  profile!: Profile
  imageURL!: string
  groupURL: { [key: string]: string } = {}
  groupsJoined$!: Observable<ChatGroup[]>

  isEditing = false

  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)
  private chatSvc = inject(ChatService)


  chatRoomIDs$!: Observable<string[]>; // Observable to hold chat room IDs
  recipientEmail$!: Observable<string>; // Observable to hold recipient email

  senderEmail!: string

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
        console.log('Groups joined by user:', groups)
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
        this.userSvc.getRecipientEmail(chatRoomId).subscribe(response => {
          const recipientEmail = response.recipientEmail; // Extract the email value

          // Now set the recipient email
          this.userSvc.setRecipientEmail(recipientEmail)
        })
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
      if(this.profileForm.valid) {
      const updatedProfile: Profile = this.profileForm.value
      updatedProfile.email = this.profile.email
      console.log('Submitting form with updated profile:', updatedProfile)
      this.userSvc.updateProfile(updatedProfile, this.image)
        .subscribe(response => {
          // Handle success
          console.log('Profile updated successfully', response)
          this.isEditing = false
          updatedProfile.pictureId = response.pictureId; // Update pictureId with the new value
          this.getImage(updatedProfile.pictureId); // Fetch updated image
          // Reload profile data after successful update
          this.userSvc.getProfile(updatedProfile.email)
            .subscribe((profile) => {
              this.profile = profile
              this.update(profile)
            })
        }, (error) => {
          // Handle error
          console.error('Error updating profile:', error)
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
            this.imageURL = reader.result as string;
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

  //get group image 
  getGroupImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
        if (response.body) {
          const reader = new FileReader()
          reader.onload = () => {
            this.groupURL[id] = reader.result as string;
          };
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


}