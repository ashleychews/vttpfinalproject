import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {

  private userSvc = inject(UserService)
  private router = inject(Router)

  isLoggedIn(): boolean {
    return this.userSvc.isLoggedIn()
  }

  logout(): void {
    this.userSvc.logout()
    this.router.navigate(['/login']); // Redirect to login page
  }

}
