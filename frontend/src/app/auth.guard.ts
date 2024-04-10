import { Injectable, inject } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "./components/authentication/app.state";
import { Observable, map, take } from "rxjs";
import { isLoggedIn } from "./components/authentication/auth.selectors";

@Injectable()
export class AuthGuard implements CanActivate {

  private store = inject(Store<AppState>)
  private router = inject(Router)

  canActivate(): Observable<boolean> {
    return this.store.select(isLoggedIn).pipe(
      take(1), // Take one value and unsubscribe
      map((loggedIn: boolean) => {
        if (loggedIn) {
          return true;
        } else {
          this.router.navigate(['/login']) // Redirect to login page if not logged in
          return false;
        }
      })
    )
  }
}