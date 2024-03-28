import { Injectable, inject } from "@angular/core";
import { UserService } from "./services/user.service";
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {

    private userSvc = inject(UserService)
    private router = inject(Router)

    canActivate(): boolean {
      if (this.userSvc.isLoggedIn()) {
        return true;
      } else {
        this.router.navigate(['/login']); // Redirect to login page if not logged in
        return false;
      }
    }
  }