import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserStore } from '../../services/user.store';
import { Store } from '@ngrx/store';
import { AppState } from '../authentication/app.state';
import { login } from '../authentication/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  hide = true
  loginform!: FormGroup
  errorMessage: string = ''

  private fb = inject(FormBuilder)
  private userStore = inject(UserStore)
  private store = inject(Store<AppState>)

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

      //Dispatch the login action with user data
      this.store.dispatch(login({ user: userData }))
      this.userStore.setEmail(userData.email)
    }
  }
}
