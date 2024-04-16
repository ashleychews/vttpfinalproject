import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../services/user.store';
import { Router } from '@angular/router';
import { COUNTRY_LIST } from '../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  private snackBar = inject(MatSnackBar)

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
          //console.log('Profile setup successful')
          this.show('Profile setup successful')
          // Redirect to dashboard
          this.router.navigate(['/profile'])
        })
        .catch(error => {
          //console.error('Error setting up profile:', error)
          this.show('Error setting up profile')
        })
    }
  }

  //validation for birthdate
  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const birthDate = new Date(control.value)
    const currentDate = new Date()
    if (birthDate >= currentDate) {
      return { futureDate: true }
    }
    return null 
  }

  show(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'center', // Center horizontally
      verticalPosition: 'top', // Align at the top
    })
  }


}
