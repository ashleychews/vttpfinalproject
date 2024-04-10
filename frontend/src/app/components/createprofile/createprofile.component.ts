import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../services/user.store';
import { Router } from '@angular/router';
import { COUNTRY_LIST } from '../../constants';

@Component({
  selector: 'app-profile',
  templateUrl: './createprofile.component.html',
  styleUrl: './createprofile.component.css'
})
export class CreateProfileComponent implements OnInit{

  profileForm!: FormGroup
  email!: string

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private userStore = inject(UserStore)
  private router = inject(Router)

  countryList = COUNTRY_LIST

  ngOnInit(): void {
    //retrieve email from the component store
    this.userStore.getEmail.subscribe(email => this.email = email)
    this.profileForm = this.createProfile()
  }

  createProfile() {
    return this.fb.group({
      userName: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      firstName: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      lastName: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      birthdate: this.fb.control<string>('', [Validators.required, this.validateBirthDate]),
      phoneNumber: this.fb.control<string>('', [Validators.required]),
      country: this.fb.control<string>('', [Validators.required])
    })
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const profileData = { ...this.profileForm.value, email: this.email }
      this.userSvc.createProfile(profileData)
        .then(() => {
          console.log('Profile setup successful')
          alert('Profile setup successful')
          // Redirect to dashboard
          this.router.navigate(['/profile'])
        })
        .catch(error => {
          console.error('Error setting up profile:', error)
          alert('Error setting up profile')
        })
    }
  }

  //validation for birthdate
  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const birthDate = new Date(control.value)
    const currentDate = new Date()
    if (birthDate >= currentDate) {
      return { futureDate: true } // Return custom error if birth date is in the future
    }
    return null // Return null if validation passes
  }


}
