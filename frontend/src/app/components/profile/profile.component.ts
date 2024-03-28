import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { UserStore } from '../../services/user.store';
import { UserService } from '../../services/user.service';
import { Profile } from '../../models';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  profile$!: Observable<Profile>
  profileForm!: FormGroup
  profile!: Profile
  imageURL!: string

  isEditing = false

  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)

  //this is for the image
  @ViewChild('image')
  image!: ElementRef

  ngOnInit(): void {
    this.userStore.getEmail.subscribe(email => {
      this.userSvc.getProfile(email)
      .subscribe((profile) => {
          this.profile = profile;
          console.log(profile.pictureId)
          this.getImage(profile.pictureId) // Fetch profile picture
          this.update(profile); // Initialize form with profile data
        },
        (error) => {
          console.error('Error fetching profile:', error);
        }
      )
    })
  }

  update(profile: Profile) : void {
    this.profileForm = this.fb.group({
      email: [{ value: profile.email, disabled: true }],
      userName: this.fb.control<string>(profile.userName, [Validators.required, Validators.minLength(3)]),
      firstName: this.fb.control<string>(profile.firstName, [Validators.required]),
      lastName: this.fb.control<string>(profile.lastName, [Validators.required]),
      birthDate: this.fb.control<string>(profile.birthDate, [Validators.required]),
      phoneNo: this.fb.control<string>(profile.phoneNo, [Validators.required]),
      image: [''],
    })
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedProfile: Profile = this.profileForm.value;
      updatedProfile.email = this.profile.email;
      console.log('Submitting form with updated profile:', updatedProfile)
      this.userSvc.updateProfile(updatedProfile, this.image)
        .subscribe(response => {
          // Handle success
          console.log('Profile updated successfully', response)
          this.isEditing = false;
          updatedProfile.pictureId = response.pictureId
          this.getImage(updatedProfile.pictureId)
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

  getImage(id: string): void {
    this.userSvc.getImage(id)
      .subscribe((response: HttpResponse<Blob>) => {
          if (response.body) {
            const reader = new FileReader();
            reader.onload = () => {
              this.imageURL = reader.result as string;
            };
            reader.readAsDataURL(response.body);
          } else {
            console.error('Error: Response body is null.');
          }
        },
        (error) => {
          console.error('Error fetching image:', error)
        }
      )
  }
  
}