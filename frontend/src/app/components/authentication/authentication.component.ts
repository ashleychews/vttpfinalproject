import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { isLoggedIn } from './auth.selectors';
import { logout } from './auth.actions';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {

  isLoggedIn$!: Observable<boolean>

  private store = inject(Store<AppState>)

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.select(isLoggedIn)
  }

  logout(): void {
    this.store.dispatch(logout())
  }

}
