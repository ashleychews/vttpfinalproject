import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserStore } from '../../services/user.store';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  hide = true;
  registerform!: FormGroup

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private router = inject(Router)
  private userStore = inject(UserStore)

  ngOnInit(): void {
    this.registerform = this.register()
  }

  register(): FormGroup {
    return this.fb.group({
      email:this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(8), this.validatePasswordStrength])

    })
  }

  process() {
    if (this.registerform.valid) {
      const userData = this.registerform.value;
      console.log("userData" , userData)
      this.userSvc.register(userData)
        .then(resp => {
          console.info('Registration successful', resp)
          // Set email in the UserComponent store
          this.userStore.setEmail(userData.email)
          console.info('email', userData.email)
          //redirect to create profile page
          this.router.navigate(['/createprofile'])
        })
        .catch(err => {
          alert('Registration failed')
        })

    }
  }

  validatePasswordStrength(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    
    // Check if password contains at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { lowercase: true }
    }

    // Check if password contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { uppercase: true }
    }

    // Check if password contains at least one digit
    if (!/\d/.test(password)) {
      return { digit: true }
    }

    // Check if password contains at least one special character
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return { specialChar: true }
    }

    return null
  }

}