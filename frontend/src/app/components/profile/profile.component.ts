import { Component, OnInit, inject } from '@angular/core';
import { UserStore } from '../../services/user.store';
import { UserService } from '../../services/user.service';
import { Profile } from '../../models';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  profile$!: Observable<Profile>
  profileForm!: FormGroup
  profile!: Profile

  isEditing = false

  private userStore = inject(UserStore)
  private userSvc = inject(UserService)
  private fb = inject(FormBuilder)


  ngOnInit(): void {
  // Get the email from the user store
  this.userStore.getEmail.subscribe(email => {
    // Fetch the profile using the email
    this.userSvc.getProfile(email)
    .subscribe((profile) => {
        this.profile = profile
        console.log("profile", profile)
        // Patch the profile data to the form
        this.profileForm.patchValue(profile)
        console.log("patched", this.profileForm.patchValue(profile))
      },
      (error) => {
        console.error('Error fetching profile:', error)
      }
      )
    })
    this.profileForm = this.update()
  }


  update() {
    return this.fb.group({
      firstname: this.fb.control<string>('', [Validators.required]),
      lastname: this.fb.control<string>('', [Validators.required]),
      birthdate: this.fb.control<string>('', [Validators.required]),
      phoneNo: this.fb.control<string>('', [Validators.required])
    })
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedProfile: Profile = this.profileForm.value;
      this.userSvc.updateProfile(updatedProfile).subscribe(
        (response) => {
          // Handle success
          console.log('Profile updated successfully', response);
          this.isEditing = false;
        },
        (error) => {
          // Handle error
          console.error('Error updating profile:', error);
        }
      );
    }
  }

  toggleEditing(): void {
    this.isEditing = !this.isEditing;
    // Set form values to profile data
    if (!this.isEditing && this.profile) {
      this.profileForm.patchValue(this.profile);
    }
  }

}