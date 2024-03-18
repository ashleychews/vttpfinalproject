import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {

  private userSvc = inject(UserService)

  isLoggedIn(): boolean {
    return this.userSvc.isLoggedIn()
  }

  logout(): void {
    this.userSvc.logout()
  }

}
