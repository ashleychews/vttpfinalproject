import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserStore } from '../../services/user.store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  hide = true
  loginform!: FormGroup

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private router = inject(Router)
  private userStore = inject(UserStore)

  ngOnInit(): void {
    this.loginform = this.login()
  }

  login(): FormGroup {
    return this.fb.group({
      email:this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required])
    })
  }

  process() {
    if (this.loginform.valid) {
      const userData = this.loginform.value;
      console.log("Logging in:", userData);
      this.userSvc.login(userData)
        .then(response => {
          alert("Login successful")
          this.router.navigate(['/events'])
          this.userStore.setEmail(userData.email)
        })
        .catch(error => {
          alert("Login Failed")
        });
    }
  }
}
